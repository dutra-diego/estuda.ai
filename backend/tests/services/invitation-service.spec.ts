import { prisma } from "../../src/http/lib/prisma";
import { invitationService } from "../../src/services/invitation-service";

jest.mock("../../src/http/lib/prisma", () => ({
	prisma: {
		user: {
			findUnique: jest.fn(),
		},
		invitation: {
			create: jest.fn(),
			update: jest.fn(),
			findMany: jest.fn(),
		},

		$transaction: jest.fn(),
	},
}));

describe("Invitation Service", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("createInvitation", () => {
		it("should create an invitation if the email exists", async () => {
			const teacherId = "teacher-123";
			const invitationData = {
				email: "student@example.com",
				classId: "class-abc",
				status: "pending" as const,
				createdAt: new Date(),
			};
			const expectedResult = { id: "inv-1", ...invitationData };

			(prisma.user.findUnique as jest.Mock).mockResolvedValue({
				id: "student-xyz",
			});
			(prisma.invitation.create as jest.Mock).mockResolvedValue(expectedResult);

			const result = await invitationService.createInvitation(
				teacherId,
				invitationData,
			);

			expect(result).toEqual(expectedResult);
			expect(prisma.user.findUnique).toHaveBeenCalledWith({
				where: { email: invitationData.email },
			});
			expect(prisma.invitation.create).toHaveBeenCalledWith({
				data: {
					teacherId: teacherId,
					email: invitationData.email,
					classId: invitationData.classId,
					createdAt: invitationData.createdAt,
					status: "pending",
				},

				select: {
					id: true,
					email: true,
					status: true,
					createdAt: true,
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
		});

		it("should throw an error if the email does not exist", async () => {
			const teacherId = "teacher-123";
			const invitationData = {
				email: "nonexistent@example.com",
				classId: "class-abc",
				status: "pending" as const,
				createdAt: new Date(),
			};

			(prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

			await expect(
				invitationService.createInvitation(teacherId, invitationData),
			).rejects.toThrow("Email does not exist");
			expect(prisma.invitation.create).not.toHaveBeenCalled();
		});
	});

	describe("updateInvitation", () => {
		it("should update status without a transaction if not 'accepted'", async () => {
			// Arrange
			const email = "student@example.com";
			const classId = "class-abc";
			const updateData = {
				id: "inv-1",
				classId: "class-abc",
				status: "rejected" as const,
			};
			const expectedResult = { id: "inv-1", status: "rejected" };

			(prisma.invitation.update as jest.Mock).mockResolvedValue(expectedResult);

			const result = await invitationService.updateInvitation(
				email,
				classId,
				updateData,
			);

			expect(result).toEqual(expectedResult);
			expect(prisma.invitation.update).toHaveBeenCalledWith({
				where: { id: updateData.id, classId: updateData.classId, email: email },
				data: { status: updateData.status },
			});
			expect(prisma.$transaction).not.toHaveBeenCalled();
		});

		it("should use a transaction to update status and create enrollment if 'accepted'", async () => {
			const email = "student@example.com";
			const userId = "student-xyz";
			const updateData = {
				id: "inv-1",
				classId: "class-abc",
				status: "accepted" as const,
			};
			const expectedInvitation = { id: "inv-1", status: "accepted" };

			const mockTransactionClient = {
				invitation: { update: jest.fn().mockResolvedValue(expectedInvitation) },
				enrollment: { create: jest.fn() },
			};

			(prisma.$transaction as jest.Mock).mockImplementation(
				async (callback) => {
					return await callback(mockTransactionClient);
				},
			);

			const result = await invitationService.updateInvitation(
				email,
				userId,
				updateData,
			);

			expect(result).toEqual(expectedInvitation);
			expect(prisma.$transaction).toHaveBeenCalledTimes(1);
			expect(mockTransactionClient.invitation.update).toHaveBeenCalledWith({
				where: { id: updateData.id, classId: updateData.classId, email: email },
				data: { studentId: userId, status: updateData.status },
			});
			expect(mockTransactionClient.enrollment.create).toHaveBeenCalledWith({
				data: {
					class: { connect: { id: updateData.classId } },
					student: { connect: { id: userId } },
					joinedAt: expect.any(Date),
				},
			});
		});
	});

	describe("getInvitationByTeacher", () => {
		it("should retrieve and transform invitations for a teacher", async () => {
			const classId = "class-abc";
			const teacherId = "teacher-123";
			const joinedAtDate = new Date();
			const mockInvitationsFromDb = [
				{
					id: "inv-1",
					email: "student1@example.com",
					status: "accepted",
					student: {
						user: { name: "Student One" },
						enrollments: [{ joinedAt: joinedAtDate }],
					},
				},
				{
					id: "inv-2",
					email: "student2@example.com",
					status: "pending",
					student: null,
				},
			];

			(prisma.invitation.findMany as jest.Mock).mockResolvedValue(
				mockInvitationsFromDb,
			);

			const result = await invitationService.getInvitationByTeacher(
				classId,
				teacherId,
			);

			expect(prisma.invitation.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					where: { classId, teacherId },
				}),
			);
			expect(result).toHaveLength(2);
			expect(result[0]).toEqual({
				id: "inv-1",
				email: "student1@example.com",
				status: "accepted",
				student: {
					user: { name: "Student One" },
					joinedAt: joinedAtDate,
				},
			});
			expect(result[1].student).toBeNull();
		});
	});

	describe("getInvitationsByStudent", () => {
		it("should retrieve pending invitations for a student by email", async () => {
			const email = "student@example.com";
			const mockInvitations = [{ id: "inv-1", classId: "class-abc" }];

			(prisma.invitation.findMany as jest.Mock).mockResolvedValue(
				mockInvitations,
			);

			const result = await invitationService.getInvitationsByStudent(email);

			expect(result).toEqual(mockInvitations);
			expect(prisma.invitation.findMany).toHaveBeenCalledWith({
				where: { email: email, status: "pending" },
				select: expect.any(Object),
			});
		});
	});
});
