import { api } from "@/lib/axios";
import type { IUpdateChat } from "@/types/chat";

export async function updateChatTitle(chat: IUpdateChat) {
	await api.patch("/chat", chat);
}
