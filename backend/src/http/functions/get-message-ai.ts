import { gemini } from "../../lib/gemini";
import type {
	geminiStudentSchemaType,
	geminiTeacherSchemaType,
} from "../../schemas/gemini-schema";
import { systemInstructionsAI } from "./system-instructions-ai";

export async function getMessageAI<
	T extends geminiStudentSchemaType[] | geminiTeacherSchemaType[],
>(role: string, messages: T): Promise<string> {
	if (role === "student") {
		const history = (messages as geminiStudentSchemaType[])
			.slice(0, -1)
			.map((message) => ({
				role: message.sender === "user" ? "user" : "model",
				parts: [{ text: message.text }],
			}));

		const geminiInstructionStudent = (messages as geminiStudentSchemaType[])[
			messages.length - 1
		].difficulty;

		const chat = gemini.chats.create({
			model: "gemini-2.5-flash",
			history: history,
			config: {
				systemInstruction: systemInstructionsAI(role, geminiInstructionStudent),
			},
		});

		const response = await chat.sendMessage({
			message: (messages as geminiStudentSchemaType[])[messages.length - 1]
				.text,
		});

		return response.text as string;
	}

	const geminiContent = (messages as geminiTeacherSchemaType[])
		.map((chat, index) => {
			const messageLines = chat.messages.map(
				(m) => `${m.sender === "user" ? "ALUNO" : "TUTOR"}: ${m.text}`,
			);
			return `--- Conversa ${index + 1} ---\n${messageLines.join("\n")}\n--- Fim Conversa ${index + 1} ---`;
		})
		.join("\n\n");
	const response = await gemini.models.generateContent({
		model: "gemini-2.5-flash",
		contents: geminiContent,
		config: {
			systemInstruction: {
				role: "system",
				parts: [
					{
						text: systemInstructionsAI(role, ""),
					},
				],
			},
		},
	});
	return response.text as string;
}
