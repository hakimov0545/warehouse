import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import AppProviders from "@app/providers/AppProviders";
import "@shared/config/i18n";
import "antd/dist/reset.css";
import "@shared/styles/main.css";

createRoot(document.getElementById("app")).render(
	<StrictMode>
		<AppProviders>
			<App />
		</AppProviders>
	</StrictMode>,
);
