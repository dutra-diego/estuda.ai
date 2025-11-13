import { api } from "@/lib/axios";
import type { IChatMessage } from "@/types/message";

export async function getMessages(chatId: string): Promise<IChatMessage[]> {
	const { data } = await api.get<IChatMessage[]>(`/messages/${chatId}`);
	return data;
}
