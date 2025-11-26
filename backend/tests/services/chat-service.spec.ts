import { getMessageAI } from "../../src/http/functions/get-message-ai";
import { prisma } from "../../src/http/lib/prisma";
import { chatService } from "../../src/services/chat-service";

jest.mock("../../src/http/lib/prisma", () => ({
	prisma: {
		chat: {
			create: jest.fn(),
			findMany: jest.fn(),
			findUnique: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
		},
	},
}));

jest.mock("../../src/http/functions/get-message-ai");

describe("Chat Service", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("createChat", () => {
		it("should create a new chat successfully", async () => {
			const chatData = {
				title: "New Chat",
				userId: "user-123",
			};
			const expectedChat = { id: "chat-abc", ...chatData };

			(prisma.chat.create as jest.Mock).mockResolvedValue(expectedChat);

			const result = await chatService.createChat(chatData.userId, {
				title: chatData.title,
			});

			expect(result).toEqual(expectedChat);
			expect(prisma.chat.create).toHaveBeenCalledTimes(1);
			expect(prisma.chat.create).toHaveBeenCalledWith({
				data: chatData,
				select: {
					id: true,
					title: true,
					classId: true,
				},
			});
		});
	});

	describe("getAllChatsByUserId", () => {
		it("should return all chats for a specific user", async () => {
			const userId = "user-123";
			const mockChats = [
				{ id: "chat-1", title: "Chat 1", userId },
				{ id: "chat-2", title: "Chat 2", userId },
			];
			(prisma.chat.findMany as jest.Mock).mockResolvedValue(mockChats);

			const result = await chatService.getAllChatsByUserId(userId);

			expect(result).toEqual(mockChats);
			expect(prisma.chat.findMany).toHaveBeenCalledTimes(1);
			expect(prisma.chat.findMany).toHaveBeenCalledWith({
				where: { userId },
				orderBy: {
					updatedAt: "desc",
				},
				select: {
					classId: true,
					id: true,
					title: true,
				},
			});
		});
	});

	describe("updateChatTitle", () => {
		it("should update the title of a specific chat", async () => {
			const updateData = { id: "chat-123", title: "Updated Title" };
			const userId = "user-abc";
			const expectedUpdatedChat = {
				chatId: "chat-123",
				title: "Updated Title",
			};
			(prisma.chat.update as jest.Mock).mockResolvedValue(expectedUpdatedChat);

			const result = await chatService.updateChatTitle(userId, updateData);

			expect(result).toEqual(expectedUpdatedChat);
			expect(prisma.chat.update).toHaveBeenCalledTimes(1);
			expect(prisma.chat.update).toHaveBeenCalledWith({
				where: { id: updateData.id, userId: userId },
				data: { title: updateData.title },
			});
		});
	});

	describe("createChatWithMessage", () => {
		it("should create a new chat with an initial message and AI response", async () => {
			const userId = "user-123";
			const role = "student";
			const inputData = {
				title: "New Chat with Message",
				classId: "class-abc",
				text: "Hello AI",
				difficulty: "easy" as const,
				sender: "user" as const,
			};
			const aiResponse = "Hello! How can I help you?";
			const expectedChatId = { id: "new-chat-id" };

			(getMessageAI as jest.Mock).mockResolvedValue(aiResponse);
			(prisma.chat.create as jest.Mock).mockResolvedValue(expectedChatId);

			const result = await chatService.createChatWithMessage(
				userId,
				role,
				inputData,
			);

			expect(result).toEqual(expectedChatId);
			expect(getMessageAI).toHaveBeenCalledWith(role, [
				{
					text: inputData.text,
					difficulty: inputData.difficulty,
					sender: inputData.sender,
				},
			]);
			expect(prisma.chat.create).toHaveBeenCalledWith({
				data: {
					userId: userId,
					title: inputData.title,
					classId: inputData.classId,
					messages: {
						create: [
							{
								text: inputData.text,
								difficulty: inputData.difficulty,
								sender: "user",
							},
							{
								text: aiResponse,
								difficulty: inputData.difficulty,
								sender: "ai",
							},
						],
					},
				},
				select: {
					id: true,
				},
			});
		});

		it("should throw an error if AI service fails to respond", async () => {
			const userId = "user-123";
			const role = "student";
			const inputData = {
				title: "New Chat with Message",
				classId: "class-abc",
				text: "Hello AI",
				difficulty: "easy" as const,
				sender: "user" as const,
			};

			(getMessageAI as jest.Mock).mockResolvedValue(null);

			await expect(
				chatService.createChatWithMessage(userId, role, inputData),
			).rejects.toThrow("AI service error");

			expect(prisma.chat.create).not.toHaveBeenCalled();
		});
	});

	describe("updateChatClass", () => {
		it("should update the classId of a specific chat", async () => {
			const userId = "user-abc";
			const updateData = { id: "chat-123", classId: "new-class-id" };
			const expectedUpdatedChat = { ...updateData, userId };

			(prisma.chat.update as jest.Mock).mockResolvedValue(expectedUpdatedChat);

			const result = await chatService.updateChatClass(userId, updateData);

			expect(result).toEqual(expectedUpdatedChat);
			expect(prisma.chat.update).toHaveBeenCalledTimes(1);
			expect(prisma.chat.update).toHaveBeenCalledWith({
				where: { id: updateData.id, userId: userId },
				data: { classId: updateData.classId },
			});
		});
	});
});
