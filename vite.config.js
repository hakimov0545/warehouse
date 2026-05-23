import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@": resolve(__dirname, "./src"),
			"@api": resolve(__dirname, "./src/api"),
			"@store": resolve(__dirname, "./src/store"),
			"@hooks": resolve(__dirname, "./src/hooks"),
			"@components": resolve(__dirname, "./src/components"),
			"@views": resolve(__dirname, "./src/views"),
			"@utils": resolve(__dirname, "./src/utils"),
			"@types": resolve(__dirname, "./src/types"),
		},
	},
	server: {
		port: 5173,
		open: true,
	},
});
