import { appEmitter } from "../events/app-emiter";
import { getMessageAI } from "../http/functions/get-message-ai";
import { AppError } from "../http/lib/errors";
import { prisma } from "../http/lib/prisma";
import type { geminiStudentSchemaType } from "../schemas/gemini-schema";
import type { CreateMessageType } from "../schemas/message-schema";

export const messageService = {
	async createMessage(
		chatId: string,
		role: string,
		userId: string,
		data: CreateMessageType[],
	) {
		const [chat, previousMessages] = await Promise.all([
			prisma.chat.findFirst({
				select: { id: true },
				where: { id: chatId, userId: userId },
			}),
			prisma.message.findMany({
				select: { text: true, sender: true, difficulty: true },
				where: { chatId: chatId },
				orderBy: { createdAt: "desc" },
			}),
		]);

		if (!chat) {
			throw new AppError(404, "Chat not found");
		}

		const lastMessage = data[data.length - 1];
		if (!lastMessage) {
			throw new AppError(400, "Invalid request");
		}

		const { text, difficulty } = lastMessage;
		const sortedHistory = previousMessages.reverse();
		const fullHistory = [...sortedHistory, ...data];

		const answer = await getMessageAI(
			role,
			fullHistory as geminiStudentSchemaType[],
		);

		if (!answer) {
			throw new AppError(500, "AI service error");
		}

		const [, aiMessage] = await prisma.$transaction([
			prisma.message.create({
				data: {
					chatId: chatId,
					text: text,
					difficulty: difficulty,
					sender: "user",
				},
			}),
			prisma.message.create({
				data: {
					chatId: chatId,
					text: answer,
					difficulty: difficulty,
					sender: "ai",
				},
				select: {
					id: true,
					text: true,
					sender: true,
				},
			}),
			prisma.chat.update({
				where: { id: chatId },
				data: { updatedAt: new Date() },
			}),
		]);

		appEmitter.emit("send-sse-event", chatId, {
			type: "new-message",
			payload: { message: aiMessage, chatId: chatId },
		});

		return aiMessage;
	},

	async getMessagesByChatId(id: string, userId: string, cursor = 0) {
		return await prisma.message.findMany({
			take: 20,
			skip: cursor,
			select: {
				id: true,
				text: true,
				sender: true,
				difficulty: true,
			},
			where: {
				chatId: id,
				chat: {
					userId: userId,
				},
			},
			orderBy: [{ createdAt: "desc" }, { sender: "asc" }],
		});
	},
};
