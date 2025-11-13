import type {
	geminiStudentSchemaType,
	geminiTeacherSchemaType,
} from "../../schemas/gemini-schema";
import { gemini } from "../lib/gemini";
import { systemInstructionsAI } from "./system-instructions-ai";

export async function getMessageAI<
	T extends geminiStudentSchemaType[] | geminiTeacherSchemaType[],
>(role: string, messages: T): Promise<string> {
	const geminiContent =
		role === "student"
			? (messages as geminiStudentSchemaType[]).map((message) => ({
					role: message.sender === "user" ? "user" : "model",
					parts: [{ text: message.text }],
				}))
			: (messages as geminiTeacherSchemaType[])
					.map((chat, index) => {
						const messageLines = chat.messages.map(
							(m) => `${m.sender === "user" ? "ALUNO" : "TUTOR"}: ${m.text}`,
						);
						return `--- Conversa ${index + 1} ---\n${messageLines.join("\n")}\n--- Fim Conversa ${index + 1} ---`;
					})
					.join("\n\n");

	const geminiInstructionStudent =
		role === "student"
			? (messages as geminiStudentSchemaType[])[messages.length - 1].difficulty
			: "";

	const response = await gemini.models.generateContent({
		model: "gemini-2.5-flash",
		contents: geminiContent,
		config: {
			systemInstruction: {
				role: "system",
				parts: [
					{
						text: systemInstructionsAI(role, geminiInstructionStudent),
					},
				],
			},
		},
	});

	return response.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}
