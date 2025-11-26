import { api } from "@/lib/axios";
import type { IChat } from "@/types/chat";

export async function getChat(pageParam = 0): Promise<IChat[]> {
	const { data } = await api.get<IChat[]>("/chat", {
		params: {
			cursor: pageParam,
		},
	});
	return data;
}
