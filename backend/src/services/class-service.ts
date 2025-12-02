import { prisma } from "../lib/prisma";
import type { ClassType, UpdateClassType } from "../schemas/class-schema";

export const classService = {
	async createClass(userId: string, data: ClassType) {
		return prisma.class.create({
			data: {
				name: data.name,
				teacher: { connect: { id: userId } },
			},
			select: {
				id: true,
			},
		});
	},

	async updateClass(userId: string, data: UpdateClassType) {
		return await prisma.class.update({
			where: { teacherId: userId, id: data.id },
			data: {
				name: data.name,
			},
		});
	},

	async getClassesByTeacher(userId: string) {
		return await prisma.class.findMany({
			where: { teacherId: userId },
			select: {
				id: true,
				name: true,
			},
			orderBy: { createdAt: "desc" },
		});
	},

	async getClassesByStudent(userId: string) {
		return await prisma.class.findMany({
			where: {
				enrollments: { some: { studentId: userId } },
			},
			select: {
				id: true,
				name: true,
			},
		});
	},
};
