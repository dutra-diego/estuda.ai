import { api } from "@/lib/axios";
import type { IChat } from "@/types/chat";

export async function getChat(): Promise<IChat[]> {
	const { data } = await api.get<IChat[]>("/chat");
	return data;
}
