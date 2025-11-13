import { api } from "@/lib/axios";
import type { IChat } from "@/types/chat";

export async function createChat(): Promise<IChat> {
	const { data } = await api.post<IChat>("/chat", { title: "Novo Chat" });
	return data;
}
