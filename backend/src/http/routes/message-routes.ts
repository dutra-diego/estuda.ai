import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import type { JwtLoginType } from "../../schemas/jwtLogin-schema";
import {
	createMessageArraySchema,
	messageIdParamSchema,
} from "../../schemas/message-schema";
import { messageService } from "../../services/message-service";
import { verifyUserRole } from "../handlers/verifyRole";

export const messageRoutes: FastifyPluginAsyncZod = async (server) => {
	server.post(
		"/messages/:chatId",
		{
			schema: {
				params: messageIdParamSchema,

				body: createMessageArraySchema,
			},
			preHandler: [verifyUserRole("student")],
		},
		async (req, reply) => {
			const { chatId } = req.params;
			const { userId, role } = await req.jwtVerify<JwtLoginType>();
			await messageService.createMessage(chatId, role, userId, req.body);
			return reply.status(204).send();
		},
	);
	server.get(
		"/messages/:chatId",
		{
			schema: {
				params: messageIdParamSchema,
			},
			preHandler: [verifyUserRole("student")],
		},
		async (req, reply) => {
			const { userId } = await req.jwtVerify<JwtLoginType>();
			const { chatId } = req.params;
			const messages = await messageService.getMessagesByChatId(chatId, userId);
			return reply.status(200).send(messages);
		},
	);
};
