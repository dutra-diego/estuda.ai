import { getMessageAI } from "../http/functions/get-message-ai";
import { prisma } from "../http/lib/prisma";
import type {
	CreateChatType,
	CreateChatWithMessageType,
	UpdateChatType,
	updateChatClassType,
} from "../schemas/chat-schema";
export const chatService = {
	async createChat(userId: string, data: CreateChatType) {
		const chat = await prisma.chat.create({
			data: {
				userId: userId,
				title: data.title,
			},
			select: {
				id: true,
				title: true,
				classId: true,
			},
		});
		return chat;
	},

	async createChatWithMessage(
		userId: string,
		role: string,
		data: CreateChatWithMessageType,
	) {
		const answer = await getMessageAI(role, [
			{
				text: data.text,
				difficulty: data.difficulty,
				sender: data.sender,
			},
		]);
		if (!answer) {
			throw new Error("AI service error");
		}
		const chatId = await prisma.chat.create({
			data: {
				userId: userId,
				title: data.title,
				classId: data.classId,
				messages: {
					create: [
						{
							text: data.text,
							difficulty: data.difficulty,
							sender: "user",
						},
						{
							text: answer,
							difficulty: data.difficulty,
							sender: "ai",
						},
					],
				},
			},
			select: {
				id: true,
			},
		});
		return chatId;
	},

	async getAllChatsByUserId(userId: string) {
		const chat = await prisma.chat.findMany({
			where: {
				userId: userId,
			},
			select: {
				id: true,
				title: true,
				classId: true,
			},
			orderBy: { updatedAt: "desc" },
		});
		return chat;
	},

	async updateChatTitle(userId: string, data: UpdateChatType) {
		const chat = await prisma.chat.update({
			where: {
				id: data.id,
				userId: userId,
			},
			data: {
				title: data.title,
			},
		});
		return chat;
	},
	async updateChatClass(userId: string, data: updateChatClassType) {
		const chat = await prisma.chat.update({
			where: {
				id: data.id,
				userId: userId,
			},
			data: {
				classId: data.classId,
			},
		});
		return chat;
	},
};
