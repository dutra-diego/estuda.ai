import { prisma } from "../../src/http/lib/prisma";
import { classService } from "../../src/services/class-service";

jest.mock("../../src/http/lib/prisma", () => ({
	prisma: {
		class: {
			create: jest.fn(),
			update: jest.fn(),
			findMany: jest.fn(),
		},
	},
}));

describe("Class Service", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("createClass", () => {
		it("should create a new class for a teacher", async () => {
			const userId = "teacher-123";
			const classData = { name: "Introduction to Programming" };
			const expectedResult = { id: "class-abc" };

			(prisma.class.create as jest.Mock).mockResolvedValue(expectedResult);

			const result = await classService.createClass(userId, classData);

			expect(result).toEqual(expectedResult);
			expect(prisma.class.create).toHaveBeenCalledTimes(1);
			expect(prisma.class.create).toHaveBeenCalledWith({
				data: {
					name: classData.name,
					teacher: { connect: { id: userId } },
				},
				select: {
					id: true,
				},
			});
		});
	});

	describe("updateClass", () => {
		it("should update a class name for a teacher", async () => {
			const userId = "teacher-123";
			const updateData = { id: "class-abc", name: "Advanced Programming" };
			const expectedResult = { id: "class-abc", name: "Advanced Programming" };

			(prisma.class.update as jest.Mock).mockResolvedValue(expectedResult);

			const result = await classService.updateClass(userId, updateData);

			expect(result).toEqual(expectedResult);
			expect(prisma.class.update).toHaveBeenCalledTimes(1);
			expect(prisma.class.update).toHaveBeenCalledWith({
				where: { teacherId: userId, id: updateData.id },
				data: {
					name: updateData.name,
				},
			});
		});
	});

	describe("getClassesByTeacher", () => {
		it("should return all classes for a specific teacher", async () => {
			const userId = "teacher-123";
			const mockClasses = [
				{ id: "class-1", name: "Class 1" },
				{ id: "class-2", name: "Class 2" },
			];

			(prisma.class.findMany as jest.Mock).mockResolvedValue(mockClasses);

			const result = await classService.getClassesByTeacher(userId);

			expect(result).toEqual(mockClasses);
			expect(prisma.class.findMany).toHaveBeenCalledTimes(1);
			expect(prisma.class.findMany).toHaveBeenCalledWith({
				where: { teacherId: userId },
				select: {
					id: true,
					name: true,
				},
				orderBy: { createdAt: "desc" },
			});
		});
	});

	describe("getClassesByStudent", () => {
		it("should return all classes a student is enrolled in", async () => {
			const userId = "student-456";
			const mockClasses = [
				{ id: "class-A", name: "Math" },
				{ id: "class-B", name: "Science" },
			];

			(prisma.class.findMany as jest.Mock).mockResolvedValue(mockClasses);

			const result = await classService.getClassesByStudent(userId);

			expect(result).toEqual(mockClasses);
			expect(prisma.class.findMany).toHaveBeenCalledTimes(1);
			expect(prisma.class.findMany).toHaveBeenCalledWith({
				where: {
					enrollments: { some: { studentId: userId } },
				},
				select: {
					id: true,
					name: true,
				},
			});
		});
	});
});
