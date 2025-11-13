import { appEmitter } from "../../src/events/app-emiter";
import { getMessageAI } from "../../src/http/functions/get-message-ai";
import { prisma } from "../../src/http/lib/prisma";
import { messageService } from "../../src/services/message-service";

jest.mock("../../src/http/lib/prisma", () => ({
	prisma: {
		$transaction: jest.fn(),

		message: {
			findMany: jest.fn(),
			create: jest.fn((args) => args),
		},

		chat: {
			findFirst: jest.fn(),
		},
	},
}));
jest.mock("../../src/http/functions/get-message-ai");
jest.mock("../../src/events/app-emiter");

describe("Message Service", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});
	describe("createMessage", () => {
		it("should throw an error if chat is not found", async () => {
			const chatId = "non-existent-chat";
			const userId = "user-123";
			const role = "student";
			const inputData = [
				{ text: "test", difficulty: "easy" as const, sender: "user" as const },
			];

			(prisma.chat.findFirst as jest.Mock).mockResolvedValue(null);

			await expect(
				messageService.createMessage(chatId, role, userId, inputData),
			).rejects.toThrow(
				"Forbidden: Chat not found or you do not have permission.",
			);
		});

		it("should throw an error if AI service fails", async () => {
			const chatId = "chat-123";
			const userId = "user-123";
			const role = "student";
			const inputData = [
				{ text: "test", difficulty: "easy" as const, sender: "user" as const },
			];

			(prisma.chat.findFirst as jest.Mock).mockResolvedValue({ id: chatId });
			(prisma.message.findMany as jest.Mock).mockResolvedValue([]);

			(getMessageAI as jest.Mock).mockResolvedValue(null);

			await expect(
				messageService.createMessage(chatId, role, userId, inputData),
			).rejects.toThrow("AI service error");
		});
	});
	describe("createMessage", () => {
		it("should save user message, get AI response, save AI message, and emit event", async () => {
			const chatId = "chat-123";
			const userId = "user-123";
			const role = "student";
			const inputData = [
				{
					text: "Olá",
					difficulty: "easy" as const,
					sender: "user" as const,
				},
			];
			const aiResponseText = "Olá! Como posso ajudar?";
			const userMessageFromDb = { id: "user-msg-id" };
			const aiMessageFromDb = {
				id: "ai-msg-id",
				text: aiResponseText,
				sender: "ai" as const,
			};

			(prisma.chat.findFirst as jest.Mock).mockResolvedValue({ id: chatId });
			(prisma.message.findMany as jest.Mock).mockResolvedValue([]);
			(getMessageAI as jest.Mock).mockResolvedValue(aiResponseText);

			(prisma.$transaction as jest.Mock).mockResolvedValue([
				userMessageFromDb,
				aiMessageFromDb,
			]);

			const result = await messageService.createMessage(
				chatId,
				role,
				userId,
				inputData,
			);

			expect(prisma.chat.findFirst).toHaveBeenCalledTimes(1);
			expect(prisma.message.findMany).toHaveBeenCalledTimes(1);
			expect(getMessageAI).toHaveBeenCalledTimes(1);

			expect(prisma.$transaction).toHaveBeenCalledTimes(1);

			expect(prisma.$transaction).toHaveBeenCalledWith([
				expect.objectContaining({
					data: expect.objectContaining({ sender: "user" }),
				}),
				expect.objectContaining({
					data: expect.objectContaining({ sender: "ai" }),
				}),
			]);

			expect(appEmitter.emit).toHaveBeenCalledTimes(1);
			expect(result).toEqual(aiMessageFromDb);
		});
	});

	describe("getMessagesByChatId", () => {
		it("should return all messages for a chat, ordered by creation date", async () => {
			const chatId = "chat-123";
			const userId = "stu-123";

			const mockMessages = [
				{ id: "msg-1", text: "Primeira mensagem", chatId },
				{ id: "msg-2", text: "Segunda mensagem", chatId },
			];
			(prisma.message.findMany as jest.Mock).mockResolvedValue(mockMessages);

			const result = await messageService.getMessagesByChatId(chatId, userId);

			expect(result).toEqual(mockMessages);
			expect(prisma.message.findMany).toHaveBeenCalledTimes(1);
			expect(prisma.message.findMany).toHaveBeenCalledWith({
				where: { chatId: chatId, chat: { userId: userId } },
				orderBy: {
					createdAt: "asc",
				},
				select: {
					difficulty: true,
					id: true,
					sender: true,
					text: true,
				},
			});
		});
	});
});
