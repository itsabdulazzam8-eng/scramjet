import { css, createDelegate, type Component } from "dreamland/core";
import type { Frame } from "@mercuryworkshop/scramjet-controller";
import FlagEditor from "./components/FlagEditor";
import BrowserView from "./pages/BrowserView";
import RequestViewer from "./pages/RequestViewer";
import PlaygroundView from "./pages/Playground";
import SettingsView from "./pages/SettingsPage";
import { Omnibox } from "./pages/BrowserView";
import { requestsState } from "./pages/RequestViewer";

const App: Component<
	{},
	{},
	{
		activeTab: "browser" | "requests" | "playground" | "settings";
	}
> = function (cx) {
	this.activeTab ??= "browser";
	return (
		<div>
			<div class="top-bar">
                <h1 class="title">Stereofymer</h1>
				<div class="tab-bar">
					<button class={use(this.activeTab).map((tab) => `tab-button ${tab === "browser" ? "active" : ""}`)} on:click={() => { this.activeTab = "browser"; }}>Browser</button>
					<button class={use(this.activeTab).map((tab) => `tab-button ${tab === "requests" ? "active" : ""}`)} on:click={() => { this.activeTab = "requests"; }}>Requests</button>
					<button class={use(this.activeTab).map((tab) => `tab-button ${tab === "playground" ? "active" : ""}`)} on:click={() => { this.activeTab = "playground"; }}>Playground</button>
					<button class={use(this.activeTab).map((tab) => `tab-button ${tab === "settings" ? "active" : ""}`)} on:click={() => { this.activeTab = "settings"; }}>Settings</button>
					{use(this.activeTab).map((tab) => tab === "browser").andThen(<Omnibox />)}
				</div>
				<div class="top-actions">
					<FlagEditor inline={true} />
				</div>
			</div>
			<div class={use(this.activeTab).map((tab) => `tab-panel browser-panel ${tab === "browser" ? "active" : ""}`)}><BrowserView active={use(this.activeTab).map((tab) => tab === "browser")} /></div>
			<div class={use(this.activeTab).map((tab) => `tab-panel requests-panel ${tab === "requests" ? "active" : ""}`)}><RequestViewer active={use(this.activeTab).map((tab) => tab === "requests")} /></div>
			<div class={use(this.activeTab).map((tab) => `tab-panel playground-panel ${tab === "playground" ? "active" : ""}`)}><PlaygroundView active={use(this.activeTab).map((tab) => tab === "playground")} /></div>
			<div class={use(this.activeTab).map((tab) => `tab-panel settings-tab ${tab === "settings" ? "active" : ""}`)}><SettingsView /></div>
		</div>
	);
};

App.style = css`
	:scope {
		width: 100vw;
		height: 100vh;
		display: flex;
		flex-direction: column;
		background: #8b0000; /* RED BACKGROUND */
		color: white;
	}
    .title {
        color: #00ff00 !important; /* GREEN TITLE */
        font-size: 1.2em;
        padding: 0 10px;
        display: flex;
        align-items: center;
    }
	.top-bar {
		display: flex;
		align-items: stretch;
		background: #000000; /* BLACK TOP BAR */
		border-bottom: 2px solid #00ff00;
	}
	.tab-button {
		background: transparent;
		color: #ffffff;
		padding: 0.24em 0.62em;
		cursor: pointer;
	}
	.tab-button.active {
		background: #8b0000;
		color: #fff;
	}
`;
export default App;
