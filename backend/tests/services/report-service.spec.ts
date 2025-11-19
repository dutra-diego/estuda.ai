import { getMessageAI } from "../../src/http/functions/get-message-ai";
import { prisma } from "../../src/http/lib/prisma";
import { reportService } from "../../src/services/report-service";

jest.mock("../../src/http/lib/prisma", () => ({
	prisma: {
		report: {
			create: jest.fn(),
			findUnique: jest.fn(),
			update: jest.fn(),
		},

		$transaction: jest.fn(),
	},
}));
type MockPrismaTransactionClient = {
	enrollment: {
		findMany: jest.Mock;
	};
	chat: {
		findMany: jest.Mock;
	};
};

jest.mock("../../src/http/functions/get-message-ai");

describe("Report Service", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	const teacherId = "teacher-123";
	const classId = "class-abc";
	const mockChatHistory = [
		{
			id: "chat-1",
			messages: [{ id: "msg-1", text: "Hello", sender: "user" }],
		},
	];
	const mockAiMessage = "This is a generated report.";

	const mockTransactionImplementation = (
		mockTxClient: MockPrismaTransactionClient,
	) => {
		(prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
			return await callback(mockTxClient);
		});
	};

	describe("createReport", () => {
		it("should create a report if student history exists", async () => {
			// Arrange
			const expectedReport = { id: "report-1", content: mockAiMessage };
			const mockTxClient: MockPrismaTransactionClient = {
				enrollment: {
					findMany: jest.fn().mockResolvedValue([{ studentId: "s1" }]),
				},
				chat: { findMany: jest.fn().mockResolvedValue(mockChatHistory) },
			};
			mockTransactionImplementation(mockTxClient);

			(getMessageAI as jest.Mock).mockResolvedValue(mockAiMessage);
			(prisma.report.create as jest.Mock).mockResolvedValue(expectedReport);

			const result = await reportService.createReport(teacherId, classId);

			expect(result).toEqual(expectedReport);
			expect(prisma.$transaction).toHaveBeenCalledTimes(1);
			expect(mockTxClient.enrollment.findMany).toHaveBeenCalled();
			expect(mockTxClient.chat.findMany).toHaveBeenCalled();
			expect(getMessageAI).toHaveBeenCalledWith("teacher", mockChatHistory);
			expect(prisma.report.create).toHaveBeenCalledWith({
				data: { classId, content: mockAiMessage },
			});
		});

		it("should return an empty array if no student history is found", async () => {
			const mockTxClient = {
				enrollment: { findMany: jest.fn().mockResolvedValue([]) },
				chat: { findMany: jest.fn() },
			};
			mockTransactionImplementation(mockTxClient);

			const result = await reportService.createReport(teacherId, classId);

			expect(result).toEqual([]);
			expect(mockTxClient.chat.findMany).not.toHaveBeenCalled();
			expect(getMessageAI).not.toHaveBeenCalled();
			expect(prisma.report.create).not.toHaveBeenCalled();
		});

		it("should throw an error if AI message generation fails", async () => {
			const mockTxClient = {
				enrollment: {
					findMany: jest.fn().mockResolvedValue([{ studentId: "s1" }]),
				},
				chat: { findMany: jest.fn().mockResolvedValue(mockChatHistory) },
			};
			mockTransactionImplementation(mockTxClient);
			(getMessageAI as jest.Mock).mockResolvedValue(null);

			await expect(
				reportService.createReport(teacherId, classId),
			).rejects.toThrow("AI service error");
			expect(prisma.report.create).not.toHaveBeenCalled();
		});
	});

	describe("getReport", () => {
		it("should retrieve a report for a specific class and teacher", async () => {});

		it("should return null if no report is found", async () => {
			(prisma.report.findUnique as jest.Mock).mockResolvedValue(null);

			const result = await reportService.getReport(teacherId, classId);

			expect(result).toBeNull();
			expect(prisma.report.findUnique).toHaveBeenCalledTimes(1);
		});
	});

	describe("updateReport", () => {
		it("should update a report if student history exists", async () => {
			const updatedReport = { id: "report-1", content: "Updated content" };
			const mockTxClient = {
				enrollment: {
					findMany: jest.fn().mockResolvedValue([{ studentId: "s1" }]),
				},
				chat: { findMany: jest.fn().mockResolvedValue(mockChatHistory) },
			};
			mockTransactionImplementation(mockTxClient);
			(getMessageAI as jest.Mock).mockResolvedValue("Updated content");
			(prisma.report.update as jest.Mock).mockResolvedValue(updatedReport);

			const result = await reportService.updateReport(teacherId, classId);

			expect(result).toEqual(updatedReport);
			expect(prisma.$transaction).toHaveBeenCalledTimes(1);
			expect(getMessageAI).toHaveBeenCalledWith("teacher", mockChatHistory);
			expect(prisma.report.update).toHaveBeenCalledWith({
				where: { classId: classId },
				data: { content: "Updated content" },
			});
		});

		it("should return an empty array if no student history is found for update", async () => {
			const mockTxClient = {
				enrollment: { findMany: jest.fn().mockResolvedValue([]) }, // Simula nenhum aluno
				chat: { findMany: jest.fn() },
			};
			mockTransactionImplementation(mockTxClient);

			const result = await reportService.updateReport(teacherId, classId);

			expect(result).toEqual([]);
			expect(getMessageAI).not.toHaveBeenCalled();
			expect(prisma.report.update).not.toHaveBeenCalled();
		});
	});
});
