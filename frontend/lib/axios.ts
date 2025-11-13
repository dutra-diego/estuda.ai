import axios from "axios";
import nookies from "nookies";

export const api = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
	withCredentials: true,
});

api.interceptors.request.use((config) => {
	const cookies = nookies.get();
	const token = cookies.authToken;
	if (token && !config.headers.Authorization) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});
