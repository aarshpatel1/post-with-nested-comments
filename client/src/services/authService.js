import api from "./api";

export const authService = {
	async signup(userData) {
		const response = await api.post("/auth/signup", userData);
		return response.data;
	},

	async login(credentials) {
		const response = await api.post("/auth/login", credentials);
		return response.data;
	},

	async getProfile() {
		const response = await api.get("/auth/profile");
		return response.data;
	},

	logout() {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
	},

	isAuthenticated() {
		return !!localStorage.getItem("token");
	},

	getToken() {
		return localStorage.getItem("token");
	},

	getUser() {
		const user = localStorage.getItem("user");
		return user ? JSON.parse(user) : null;
	},
};
