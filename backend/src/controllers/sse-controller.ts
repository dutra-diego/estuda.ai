import type { FastifyReply, FastifyRequest } from "fastify";
import { env } from "../config/env";
import { sseConnectionHandler } from "../http/handlers/sseHandler";

export const sseController = {
	async connect(req: FastifyRequest, reply: FastifyReply) {
		const origin = req.headers.origin;

		if (origin && env.CORS_ORIGIN.includes(origin)) {
			reply.raw.setHeader("Access-Control-Allow-Origin", origin);
		}
		reply.raw.setHeader("Access-Control-Allow-Credentials", "true");
		reply.raw.setHeader("Vary", "Origin");
		reply.raw.setHeader("Content-Type", "text/event-stream");
		reply.raw.setHeader("Connection", "keep-alive");
		reply.raw.setHeader("Cache-Control", "no-cache");
		const { chat } = req.query as { chat?: string };

		if (!chat) {
			return reply.status(400).send({ error: "Missing chat" });
		}

		if (typeof reply.raw.flushHeaders === "function") {
			reply.raw.flushHeaders();
		}

		sseConnectionHandler.addChat(chat, reply);

		reply.raw.write(
			`data: ${JSON.stringify({ type: "connection-established" })}\n\n`,
		);

		reply.raw.on("close", () => {
			sseConnectionHandler.removeChat(chat);
		});
	},
};
