import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import {
	createChatSchema,
	createChatWithMessageSchema,
	getChatQuerySchema,
	updateChatClassSchema,
	updateChatSchema,
} from "../../schemas/chat-schema";
import type { JwtLoginType } from "../../schemas/jwtLogin-schema";
import { chatService } from "../../services/chat-service";
import { verifyUserRole } from "../handlers/verifyRole";

export const chatRoutes: FastifyPluginAsyncZod = async (server) => {
	server.post(
		"/chat",
		{
			schema: { body: createChatSchema },
			preHandler: [verifyUserRole("student")],
		},
		async (req, reply) => {
			const { userId } = await req.jwtVerify<JwtLoginType>();

			const chat = await chatService.createChat(userId, req.body);

			return reply.status(201).send(chat);
		},
	);
	server.post(
		"/chat/message",
		{
			schema: { body: createChatWithMessageSchema },
			preHandler: [verifyUserRole("student")],
		},
		async (req, reply) => {
			const { userId, role } = await req.jwtVerify<JwtLoginType>();

			const chatId = await chatService.createChatWithMessage(
				userId,
				role,
				req.body,
			);
			return reply.status(201).send(chatId);
		},
	);
	server.patch(
		"/chat/class",
		{
			schema: { body: updateChatClassSchema },
			preHandler: [verifyUserRole("student")],
		},

		async (req, reply) => {
			const { userId } = await req.jwtVerify<JwtLoginType>();
			await chatService.updateChatClass(userId, req.body);
			return reply.status(204).send();
		},
	);
	server.get(
		"/chat",
		{
			schema: {
				querystring: getChatQuerySchema,
			},
			preHandler: [verifyUserRole("student")],
		},
		async (req, reply) => {
			const { userId } = await req.jwtVerify<JwtLoginType>();
			const { cursor } = req.query;
			const chats = await chatService.getAllChatsByUserId(
				userId,
				Number(cursor),
			);
			return reply.status(200).send(chats);
		},
	);
	server.patch(
		"/chat",
		{
			schema: { body: updateChatSchema },
			preHandler: [verifyUserRole("student")],
		},
		async (req, reply) => {
			const { userId } = await req.jwtVerify<JwtLoginType>();
			await chatService.updateChatTitle(userId, req.body);
			return reply.status(204).send();
		},
	);
};
