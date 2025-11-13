import { api } from "@/lib/axios";
import type { IChatMessageCreate } from "@/types/message";

export async function createMessage(
	chatId: string,
	message: IChatMessageCreate[],
) {
	const { data } = await api.post(`/messages/${chatId}`, message);
	return data;
}
