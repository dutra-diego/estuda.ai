import { getMessageAI } from "../http/functions/get-message-ai";
import { AppError } from "../http/lib/errors";
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
			throw new AppError(500, "AI service error");
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

	async getAllChatsByUserId(userId: string, skip = 0) {
		const chat = await prisma.chat.findMany({
			take: 11,
			skip,
			select: {
				id: true,
				title: true,
				classId: true,
			},
			where: {
				userId: userId,
			},
			orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
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
