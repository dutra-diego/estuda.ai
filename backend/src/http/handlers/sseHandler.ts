import type { FastifyReply } from "fastify";
import { appEmitter } from "../../events/app-emiter";
import type { SseEvent } from "../../schemas/stream-chat-schema";

const chats = new Map<string, FastifyReply>();

appEmitter.on("send-sse-event", (chatId: string, data: SseEvent) => {
	const chatRes = chats.get(chatId);
	if (chatRes) {
		chatRes.raw.write(`data: ${JSON.stringify(data)}\n\n`);
	}
});

export const sseConnectionHandler = {
	addChat(chatId: string, reply: FastifyReply): void {
		chats.set(chatId, reply);
		reply.raw.req.on("close", () => {
			this.removeChat(chatId);
		});
	},

	removeChat(chatId: string): void {
		chats.delete(chatId);
	},
};
