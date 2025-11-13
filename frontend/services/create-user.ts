import { api } from "@/lib/axios";
import type { ICreateUser } from "@/types/user";


export async function createUser(user: ICreateUser) {
	const { data } = await api.post("/users", user);
	return data;
}
