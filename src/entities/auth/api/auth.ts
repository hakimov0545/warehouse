import api from "@shared/api/base";

export const authApi = {
	login(credentials) {
		return api.post("/api/auth/login", credentials);
	},
	logout() {
		localStorage.removeItem("token");
	},
	register(data) {
		return api.post("/api/auth/register", data);
	},
};
