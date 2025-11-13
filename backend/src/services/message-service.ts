import { appEmitter } from "../events/app-emiter";
import { getMessageAI } from "../http/functions/get-message-ai";
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
		const chat = await prisma.chat.findFirst({
			where: { id: chatId, userId: userId },
			select: { id: true },
		});
		if (!chat) {
			throw new Error(
				"Forbidden: Chat not found or you do not have permission.",
			);
		}

		const previousMessages = await prisma.message.findMany({
			where: { chatId: chatId },
			select: { text: true, sender: true, difficulty: true },
			orderBy: { createdAt: "asc" },
		});

		const lastMessage = data[data.length - 1];
		if (!lastMessage) {
			throw new Error("No messages provided");
		}
		const { text, difficulty } = lastMessage;
		const fullHistory = [...previousMessages, ...data];
		const answer = await getMessageAI(
			role,
			fullHistory as geminiStudentSchemaType[],
		);
		if (!answer) {
			throw new Error("AI service error");
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
		]);

		appEmitter.emit("send-sse-event", chatId, {
			type: "new-message",
			payload: { message: aiMessage, chatId: chatId },
		});

		return aiMessage;
	},

	async getMessagesByChatId(id: string, userId: string) {
		return await prisma.message.findMany({
			where: {
				chatId: id,
				chat: {
					userId: userId,
				},
			},
			select: {
				id: true,
				text: true,
				sender: true,
				difficulty: true,
			},
			orderBy: { createdAt: "asc" },
		});
	},
};
