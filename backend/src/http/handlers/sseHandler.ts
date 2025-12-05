import type { FastifyReply } from "fastify";
import { appEmitter } from "../../events/app-emiter";
import type { SseEvent } from "../../schemas/stream-chat-schema";

const chats = new Map<string, Set<FastifyReply>>();

appEmitter.on("send-sse-event", (chatId: string, data: SseEvent) => {
	const chatConnections = chats.get(chatId);
	if (!chatConnections) return;

	const dataString = `data: ${JSON.stringify(data)}\n\n`;
	const deadConnections = new Set<FastifyReply>();

	chatConnections.forEach((connection) => {
		try {
			if (!connection.raw.destroyed) {
				connection.raw.write(dataString);
			} else {
				deadConnections.add(connection);
			}
		} catch (_error) {
			deadConnections.add(connection);
		}
	});

	deadConnections.forEach((dead) => {
		chatConnections.delete(dead);
	});

	if (chatConnections.size === 0) {
		chats.delete(chatId);
	}
});

export const sseConnectionHandler = {
	addChat(chatId: string, reply: FastifyReply): void {
		if (!chats.has(chatId)) {
			chats.set(chatId, new Set());
		}

		const connections = chats.get(chatId) ?? new Set<FastifyReply>();
		connections.add(reply);

		reply.raw.req.on("close", () => {
			this.removeConnection(chatId, reply);
		});

		reply.raw.on("error", () => {
			this.removeConnection(chatId, reply);
		});
	},

	removeConnection(chatId: string, reply: FastifyReply): void {
		const connections = chats.get(chatId);
		if (!connections) return;

		connections.delete(reply);
		if (connections.size === 0) {
			chats.delete(chatId);
		}
	},

	removeChat(chatId: string): void {
		const connections = chats.get(chatId);
		if (!connections) return;

		connections.forEach((conn) => {
			try {
				conn.raw.destroy();
			} catch (_error) {
				
			}
		});
		chats.delete(chatId);
	},
};
