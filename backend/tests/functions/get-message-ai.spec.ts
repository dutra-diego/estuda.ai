import { getMessageAI } from "../../src/http/functions/get-message-ai";
import { gemini } from "../../src/lib/gemini";
import type { geminiTeacherSchemaType } from "../../src/schemas/gemini-schema";

jest.mock("../../src/lib/gemini", () => ({
	gemini: {
		models: {
			generateContent: jest.fn(),
		},
		chats: {
			create: jest.fn(),
		},
	},
}));

describe("getMessageAI", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		(gemini.models.generateContent as jest.Mock).mockResolvedValue({
			text: "Mocked AI response",
		});
		(gemini.chats.create as jest.Mock).mockReturnValue({
			sendMessage: jest.fn().mockResolvedValue({
				text: "Mocked AI response",
			}),
		});
	});

	it("should generate the correct system instruction for 'easy' difficulty", async () => {
		const mockMessages = [
			{
				text: "Me explique o que é uma variável.",
				sender: "user" as const,
				difficulty: "easy" as const,
			},
		];

		await getMessageAI("student", mockMessages);

		expect(gemini.chats.create).toHaveBeenCalledWith(
			expect.objectContaining({
				model: "gemini-2.5-flash",
				history: expect.any(Array),
				config: expect.objectContaining({
					systemInstruction: expect.stringContaining("NÍVEL FÁCIL"),
				}),
			}),
		);
	});

	it("should generate the correct system instruction for 'medium' difficulty", async () => {
		const mockMessages = [
			{
				text: "Me explique o que é uma variável.",
				sender: "user" as const,
				difficulty: "medium" as const,
			},
		];

		await getMessageAI("student", mockMessages);

		expect(gemini.chats.create).toHaveBeenCalledWith(
			expect.objectContaining({
				model: "gemini-2.5-flash",
				config: expect.objectContaining({
					systemInstruction: expect.stringContaining("NÍVEL MÉDIO"),
				}),
			}),
		);
	});

	it("should handle teacher role correctly", async () => {
		const mockTeacherMessages = [
			{
				id: "chat-1",
				messages: [
					{
						id: "msg-1",
						text: "Student question",
						sender: "user" as const,
						createdAt: new Date(),
					},
					{
						id: "msg-2",
						text: "AI answer",
						sender: "ai" as const,
						createdAt: new Date(),
					},
				],
			},
			{
				id: "chat-2",
				messages: [
					{
						id: "msg-3",
						text: "Another question",
						sender: "user" as const,
						createdAt: new Date(),
					},
					{
						id: "msg-4",
						text: "Another answer",
						sender: "ai" as const,
						createdAt: new Date(),
					},
				],
			},
		];

		const result = await getMessageAI(
			"teacher",
			mockTeacherMessages as geminiTeacherSchemaType[],
		);

		expect(result).toBe("Mocked AI response");
		expect(gemini.models.generateContent).toHaveBeenCalledWith(
			expect.objectContaining({
				model: "gemini-2.5-flash",

				contents: expect.stringContaining("--- Conversa 1 ---"),
			}),
		);
	});
});
