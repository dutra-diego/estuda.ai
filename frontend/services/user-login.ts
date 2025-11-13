import { setCookie } from "nookies";
import { api } from "@/lib/axios";

export async function userLogin({
	email,
	password,
}: {
	email: string;
	password: string;
}) {
	const { data } = await api.post("/users/login", { email, password });
	setCookie(null, "authToken", data.token, {
		maxAge: 30 * 24 * 60 * 60,
		path: "/",
	});

	return data;
}
