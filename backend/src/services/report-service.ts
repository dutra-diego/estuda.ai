import type { Prisma } from "@prisma/client";
import { getMessageAI } from "../http/functions/get-message-ai";
import { AppError } from "../lib/errors";
import { prisma } from "../lib/prisma";
import type { geminiTeacherSchemaType } from "../schemas/gemini-schema";

async function getStudentChatHistory(
	teacherId: string,
	classId: string,
	transaction: Prisma.TransactionClient,
	includeClassId = true,
) {
	const enrollments = await transaction.enrollment.findMany({
		where: { classId, class: { teacherId: teacherId } },
		select: { studentId: true },
	});
	const students = enrollments.map((e) => e.studentId);

	if (students.length === 0) {
		return [];
	}

	const whereClause = includeClassId
		? { userId: { in: students }, classId: classId }
		: { userId: { in: students } };

	const chats = await transaction.chat.findMany({
		where: whereClause,
		select: {
			id: true,
			messages: {
				select: { id: true, text: true, sender: true, createdAt: true },
				orderBy: { createdAt: "asc" },
			},
		},
	});
	return chats;
}

export const reportService = {
	async createReport(teacherId: string, classId: string) {
		const geminiHistoryStudents = await prisma.$transaction(
			async (transaction: Prisma.TransactionClient) => {
				return getStudentChatHistory(teacherId, classId, transaction, true);
			},
		);
		if (geminiHistoryStudents.length === 0) {
			return [];
		}

		const aiMessage = await getMessageAI(
			"teacher",
			geminiHistoryStudents as geminiTeacherSchemaType[],
		);
		if (!aiMessage) {
			throw new AppError(500, "AI service error");
		}
		return await prisma.report.create({
			data: {
				classId,
				content: aiMessage,
			},
		});
	},

	async getReport(teacherId: string, classId: string) {
		return await prisma.report.findUnique({
			where: {
				classId: classId,
				class: {
					teacherId: teacherId,
				},
			},
			select: { content: true, class: { select: { name: true } } },
		});
	},

	async updateReport(teacherId: string, classId: string) {
		const geminiHistoryStudents = await prisma.$transaction(
			async (transaction: Prisma.TransactionClient) => {
				return getStudentChatHistory(teacherId, classId, transaction, false);
			},
		);

		if (geminiHistoryStudents.length === 0) {
			return [];
		}
		const aiMessage = await getMessageAI(
			"teacher",
			geminiHistoryStudents as geminiTeacherSchemaType[],
		);

		const report = await prisma.report.update({
			where: { classId: classId },
			data: {
				content: aiMessage,
			},
		});
		return report;
	},
};
