import { api } from "@/lib/axios";
import type { IChatWithMessages } from "@/types/chat";

export async function createChatWithMessage(
	chatWithMessage: IChatWithMessages,
): Promise<string> {
	const { data } = await api.post<{ id: string }>(
		"/chat/message",
		chatWithMessage,
	);
	return data.id;
}
