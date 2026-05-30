import {
	css,
	type Delegate,
	type Component,
	createState,
} from "dreamland/core";
const { Plugin: ScramjetPlugin, ScramjetHeaders } = window.$scramjet;
import type { Plugin } from "@mercuryworkshop/scramjet";
import type { Frame } from "@mercuryworkshop/scramjet-controller";
import { cachePlugin, controller } from "..";
import { demoSettingsStore } from "../store";
import homepage from "./homepage.html?raw";

export const browserState = createState({
	url: demoSettingsStore.homeUrl,
	frame: null! as Frame,
});

export const Omnibox: Component = function (cx) {
	const navigate = () => {
		if (!browserState.url.startsWith("http")) {
			browserState.url = `https://${browserState.url}`;
		}
		demoSettingsStore.homeUrl = browserState.url;
		browserState.frame?.go(browserState.url);
	};
	return (
		<form
			class="url-form"
			on:submit={(e: SubmitEvent) => {
				e.preventDefault();
				navigate();
			}}
		>
			<div class="browser-omnibox-shell">
				<div class="omnibox-nav" aria-hidden="true">
					<button type="button" class="nav-btn" on:click={() => browserState.frame?.back()}>
						<span class="material-symbols-outlined">arrow_back</span>
					</button>
					<button type="button" class="nav-btn" on:click={() => browserState.frame?.forward()}>
						<span class="material-symbols-outlined">arrow_forward</span>
					</button>
					<button type="button" class="nav-btn" on:click={() => browserState.frame?.reload()}>
						<span class="material-symbols-outlined">refresh</span>
					</button>
				</div>
				<input
					id="search"
					class="url-input"
					type="text"
					value={use(browserState.url)}
					spellcheck="false"
					placeholder="Enter URL or search..."
				/>
			</div>
		</form>
	);
};

Omnibox.style = css`
	:scope {
		display: flex;
		align-items: center;
		background: #000000;
		border-bottom: 3px solid #00ff00;
		min-width: 0;
		width: 100%;
	}
	.browser-omnibox-shell {
		display: flex;
		width: 100%;
		align-items: center;
		gap: 0.35em;
		padding: 0.3em;
	}
	.url-input {
		box-sizing: border-box;
		width: 100%;
		padding: 0.4em;
		font-size: 0.9em;
		border: 3px solid #000000 !important;
		border-radius: 4px;
		background: #ffffff !important;
		color: #000000 !important;
		outline: none;
	}
    .nav-btn { color: #ffffff; cursor: pointer; background: transparent; border: 0; }
	.nav-btn:hover { background: #8b0000; }
`;

const BrowserView: Component<{ active: boolean }, {}, { frameel: HTMLIFrameElement; }> = function (cx) {
	cx.mount = async () => {
		await controller.wait();
		browserState.frame = controller.createFrame(this.frameel);
		cachePlugin.install(browserState.frame);
		const openfix = new ScramjetPlugin("openfix");
		openfix.tap(browserState.frame.hooks.fetch.intercept, (context, props) => {
			if (context.request.destination === "document") {
				props.response = {
					body: "",
					status: 302,
					statusText: "Found",
					headers: ScramjetHeaders.fromRawHeaders([
						["Location", new URL(`/?goto=${encodeURIComponent(context.parsed.url.href)}`, location.origin).href],
					]),
				};
			}
		}, (other: Plugin) => (other.name === cachePlugin.name ? 1 : -1));
		this.frameel.src = `data:text/html;base64,${btoa(homepage)}`;
	};
	return (
		<div class={use(this.active).map((active) => `tab-panel browser-view ${active ? "active" : ""}`)}>
			<iframe this={use(this.frameel)}></iframe>
		</div>
	);
};

BrowserView.style = css`
	:scope { flex: 1; width: 100%; min-width: 0; min-height: 0; display: none; flex-direction: column; }
	:scope.active { display: flex; }
	iframe { background: white; flex: 1; border: none; }
`;

export default BrowserView;
