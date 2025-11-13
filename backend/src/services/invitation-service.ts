import { prisma } from "../http/lib/prisma";
import type {
	CreateInvitationType,
	UpdateInvitationType,
} from "../schemas/invitation";

export const invitationService = {
	async createInvitation(userId: string, data: CreateInvitationType) {
		const emailExist = await prisma.user.findUnique({
			where: { email: data.email },
		});
		if (!emailExist) {
			throw new Error("Email does not exist");
		}
		return await prisma.invitation.create({
			data: {
				teacherId: userId,
				...data,
			},
			select: {
				id: true,
				email: true,
				createdAt: true,
				status: true,
				student: {
					select: {
						user: {
							select: {
								name: true,
							},
						},
					},
				},
			},
		});
	},

	async updateInvitation(
		email: string,
		userId: string,
		data: UpdateInvitationType,
	) {
		if (data.status !== "accepted") {
			return await prisma.invitation.update({
				where: { id: data.id, classId: data.classId, email: email },
				data: { status: data.status },
			});
		}
		return await prisma.$transaction(async (transaction) => {
			const invitation = await transaction.invitation.update({
				where: { id: data.id, classId: data.classId, email: email },
				data: {
					studentId: userId,
					status: data.status,
				},
			});

			await transaction.enrollment.create({
				data: {
					class: { connect: { id: data.classId } },
					student: { connect: { id: userId } },
					joinedAt: new Date(),
				},
			});

			return invitation;
		});
	},
	async getInvitationByTeacher(classId: string, teacherId: string) {
		const invitations = await prisma.invitation.findMany({
			where: {
				classId: classId,
				teacherId: teacherId,
			},
			select: {
				id: true,
				email: true,
				createdAt: true,
				status: true,
				student: {
					select: {
						user: {
							select: {
								name: true,
							},
						},
						enrollments: {
							where: { classId: classId },
							select: {
								joinedAt: true,
							},
						},
					},
				},
			},
			orderBy: { createdAt: "asc" },
		});

		return invitations.map((inv) => {
			if (!inv.student) {
				return { ...inv, student: null };
			}
			const { enrollments, ...studentWithoutEnrollments } = inv.student;
			return {
				...inv,
				student: {
					...studentWithoutEnrollments,
					joinedAt: enrollments[0]?.joinedAt ?? null,
				},
			};
		});
	},

	async getInvitationsByStudent(email: string) {
		return await prisma.invitation.findMany({
			where: { email: email, status: "pending" },
			select: {
				id: true,
				classId: true,
				class: {
					select: {
						name: true,
						teacher: {
							select: {
								user: {
									select: {
										name: true,
									},
								},
							},
						},
					},
				},
			},
		});
	},
};
