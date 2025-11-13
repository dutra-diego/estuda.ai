import { api } from "@/lib/axios";
import type { IUser } from "@/types/user";

export async function getUser(): Promise<IUser> {
	const { data } = await api.get<IUser>("/user");
	return data;
}
