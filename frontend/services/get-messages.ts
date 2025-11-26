import { api } from "@/lib/axios";
import type { IChatMessage } from "@/types/message";

export async function getMessages(
	chatId: string,
	pageParam = 0,
): Promise<IChatMessage[]> {
	const { data } = await api.get<IChatMessage[]>(`/messages/${chatId}`, {
		params: {
			cursor: pageParam,
		},
	});
	if (data === null) { return [];}
	return data;
}
