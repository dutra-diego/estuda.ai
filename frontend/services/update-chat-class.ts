import { api } from "@/lib/axios";
import type { IUpdateChatClass } from "@/types/chat";

export async function updateChatClass(chat: IUpdateChatClass) {
	await api.patch("/chat/class", chat);
}
