import { create } from "zustand";
import { companyUserApi } from "@entities/warehouse/api/warehouseUser";
import { companyApi } from "@entities/company/api/company";
import { authApi } from "../api/auth";

function parseJwt(token) {
	try {
		const base64Url = token.split(".")[1];
		const base64 = base64Url
			.replace(/-/g, "+")
			.replace(/_/g, "/");
		const jsonPayload = decodeURIComponent(
			atob(base64)
				.split("")
				.map(
					(c) =>
						"%" +
						("00" + c.charCodeAt(0).toString(16)).slice(
							-2,
						),
				)
				.join(""),
		);
		return JSON.parse(jsonPayload);
	} catch {
		return {};
	}
}

export const useAuthStore = create((set, get) => ({
	token: localStorage.getItem("token") || null,
	companyRole: localStorage.getItem("companyRole") || null,
	user: JSON.parse(localStorage.getItem("user") || "null"),
	company: JSON.parse(localStorage.getItem("company") || "null"),
	companyId: JSON.parse(
		localStorage.getItem("companyId") || "null",
	),
	companyUser: JSON.parse(
		localStorage.getItem("companyUser") || "null",
	),
	permissions: JSON.parse(
		localStorage.getItem("permissions") || "[]",
	),
	pendingCredentials: null,
	loading: false,
	error: null,

	// Derived helpers — read from state via get()
	isAuthenticated: () => !!get().token,
	hasCompany: () => !!get().companyId,
	isCompanyOwner: () => get().companyRole === "OWNER",

	can: (code) => {
		if (!code) return true;
		const s = get();
		if (s.companyRole === "OWNER") return true;
		return s.permissions.includes(code);
	},

	canAny: (codes) => {
		if (!codes || codes.length === 0) return true;
		const s = get();
		if (s.companyRole === "OWNER") return true;
		return codes.some((c) => s.permissions.includes(c));
	},

	login: async (credentials) => {
		set({ loading: true, error: null });
		try {
			const { data } = await authApi.login(credentials);
			const token = data.token;
			const companyRole =
				data.companyRole || data.warehouseRole || null;
			localStorage.setItem("token", token);
			if (companyRole) {
				localStorage.setItem("companyRole", companyRole);
			} else {
				localStorage.removeItem("companyRole");
			}

			const payload = parseJwt(token);
			let companyId = null;
			if (payload.companyId || payload.warehouseId) {
				companyId = payload.companyId || payload.warehouseId;
				localStorage.setItem(
					"companyId",
					JSON.stringify(companyId),
				);
			} else {
				localStorage.removeItem("companyId");
			}

			set({ token, companyRole, companyId });

			if (companyId) {
				await get().fetchCompanyUser();
			}

			return true;
		} catch (err) {
			set({
				error: err.response?.data?.message || "Login failed",
			});
			return false;
		} finally {
			set({ loading: false });
		}
	},

	fetchCompanyUser: async () => {
		const companyId = get().companyId;
		if (!companyId) return null;
		try {
			const { data } =
				await companyUserApi.getByUserIdAndCompanyId(
					companyId,
				);
			localStorage.setItem("companyUser", JSON.stringify(data));

			const codes = (data.companyRoles || [])
				.flatMap((role) =>
					(role.permissions || []).map((p) => p.code),
				)
				.filter(Boolean);
			const permissions = [...new Set(codes)];
			localStorage.setItem(
				"permissions",
				JSON.stringify(permissions),
			);

			let user = get().user;
			if (data.userName || data.userId) {
				user = {
					id: data.userId,
					name: data.userName,
					fullName: data.userName,
				};
				localStorage.setItem("user", JSON.stringify(user));
			}

			set({ companyUser: data, permissions, user });

			// Fetch and persist the full company object so components that
			// read `company` from the auth store won't encounter nulls.
			try {
				const resp = await companyApi.getById(companyId);
				const company = resp.data;
				if (company) {
					localStorage.setItem(
						"company",
						JSON.stringify(company),
					);
					set({ company });
				}
			} catch {
				// ignore company fetch errors — permissions/user info is primary
			}
			return data;
		} catch {
			return null;
		}
	},

	fetchAcceptedCompanies: async () => {
		try {
			const { data } = await companyUserApi.getAcceptedByUser();
			return Array.isArray(data) ? data : [];
		} catch {
			return [];
		}
	},

	fetchInvitations: async () => {
		try {
			const { data } = await companyUserApi.getInvitations();
			return Array.isArray(data) ? data : [];
		} catch {
			return [];
		}
	},

	setPendingCredentials: (credentials) =>
		set({ pendingCredentials: credentials }),
	clearPendingCredentials: () => set({ pendingCredentials: null }),

	register: async (data) => {
		set({ loading: true, error: null });
		try {
			const res = await authApi.register(data);
			const token = res.data.token;
			const companyRole =
				res.data.companyRole ||
				res.data.warehouseRole ||
				null;
			localStorage.setItem("token", token);
			if (companyRole) {
				localStorage.setItem("companyRole", companyRole);
			} else {
				localStorage.removeItem("companyRole");
			}
			set({ token, companyRole });
			return true;
		} catch (err) {
			set({
				error:
					err.response?.data?.message ||
					"Registration failed",
			});
			return false;
		} finally {
			set({ loading: false });
		}
	},

	setCompany: (company) => {
		localStorage.setItem("company", JSON.stringify(company));
		set({ company });
	},

	logout: () => {
		localStorage.removeItem("token");
		localStorage.removeItem("companyRole");
		localStorage.removeItem("warehouseRole");
		localStorage.removeItem("user");
		localStorage.removeItem("company");
		localStorage.removeItem("companyId");
		localStorage.removeItem("warehouseId");
		localStorage.removeItem("companyUser");
		localStorage.removeItem("permissions");
		set({
			token: null,
			companyRole: null,
			user: null,
			company: null,
			companyId: null,
			companyUser: null,
			permissions: [],
			pendingCredentials: null,
		});
	},
}));
