import LoadInterstitial from "./components/LoadInterstitial";
import App from "./App";
import LibcurlClient from "@mercuryworkshop/libcurl-transport";
import EpoxyClient from "@mercuryworkshop/epoxy-transport";
import { defaultConfigDev } from "@mercuryworkshop/scramjet";
const { Controller, HttpCachePlugin } = $scramjetController;
import { demoSettingsStore } from "./store";

let app = document.getElementById("app")!;

let controller: InstanceType<typeof Controller>;
const cachePlugin = new HttpCachePlugin();

export function getTransport(): LibcurlClient | EpoxyClient {
	const wispUrl = demoSettingsStore.wispUrl;
	switch (demoSettingsStore.transport) {
		case "epoxy":
			return new EpoxyClient({ wisp: wispUrl });
		case "libcurl":
		default:
			return new LibcurlClient({ wisp: wispUrl });
	}
}

async function waitForControllerOrReady(timeoutMs = 10000): Promise<void> {
	if (navigator.serviceWorker.controller) return;

	const ready = navigator.serviceWorker.ready.then(() => {});
	const controllerChanged = new Promise<void>((resolve) => {
		const onChange = () => {
			navigator.serviceWorker.removeEventListener("controllerchange", onChange);
			resolve();
		};
		navigator.serviceWorker.addEventListener("controllerchange", onChange, {
			once: true,
		} as any);
	});
	const timeout = new Promise<void>((resolve) =>
		setTimeout(resolve, timeoutMs)
	);

	await Promise.race([ready, controllerChanged, timeout]);
}

async function init() {
	const interstitial: any = (
		<LoadInterstitial status={"Loading Stereofymer..."}></LoadInterstitial>
	);
	document.body.append(interstitial);
	interstitial.showModal();

	try {
		const registration = await navigator.serviceWorker.register("./sw.js");
		const updateStatus = (sw: ServiceWorker | null) => {
			if (!sw) return;
			const set = (msg: string) => (interstitial.$.state.status = msg);
			const apply = () => {
				switch (sw.state) {
					case "installing": set("Installing..."); break;
					case "activated": set("Stereofymer Ready"); break;
				}
			};
			apply();
			sw.addEventListener("statechange", apply);
		};

		updateStatus(registration.installing ?? registration.waiting ?? null);
		await waitForControllerOrReady(10000);
		
		controller = new Controller({
			serviceworker: navigator.serviceWorker.controller ?? registration.active!,
			transport: getTransport(),
			scramjetConfig: defaultConfigDev,
		});
		await controller.wait();
		interstitial.close();
	} catch (e) {
		interstitial.close();
		app.innerText = "Stereofymer failed to load.";
	}
}

async function mount() {
	const root = <App />;
	app.replaceWith(root);
}

init().then(() => mount());
export { controller, cachePlugin };
