import type { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { mockDeep, mockReset } from "jest-mock-extended";
import { prisma } from "../../src/http/lib/prisma";
import { userService } from "../../src/services/user-service";

// Mocka as dependências externas
jest.mock("../../src/http/lib/prisma", () => ({
	__esModule: true,
	prisma: mockDeep<PrismaClient>(),
}));
jest.mock("bcrypt");

const prismaMock = prisma as unknown as ReturnType<
	typeof mockDeep<PrismaClient>
>;

describe("User Service", () => {
	beforeEach(() => {
		mockReset(prismaMock);
		jest.clearAllMocks();
	});

	describe("createUser", () => {
		it("should create a student successfully", async () => {
			const userData = {
				name: "Test User",
				email: "test@example.com",
				password: "password123",
				role: "student" as const,
			};

			(bcrypt.hash as jest.Mock).mockResolvedValue("hashed_password");

			(prismaMock.user.create as jest.Mock).mockResolvedValue({
				name: userData.name,
				email: userData.email,
				role: userData.role,
			});

			const result = await userService.createUser(userData);

			expect(result).toEqual({
				name: userData.name,
				email: userData.email,
				role: userData.role,
			});
			expect(prismaMock.user.create).toHaveBeenCalledWith({
				data: {
					name: userData.name,
					email: userData.email,
					password: "hashed_password",
					role: userData.role,
					Student: {
						create: {},
					},
					Teacher: undefined,
				},
				select: {
					name: true,
					email: true,
					role: true,
				},
			});
		});

		it("should create a teacher successfully", async () => {
			const userData = {
				name: "Test Teacher",
				email: "teacher@example.com",
				password: "password123",
				role: "teacher" as const,
			};

			(bcrypt.hash as jest.Mock).mockResolvedValue("hashed_password_teacher");

			(prismaMock.user.create as jest.Mock).mockResolvedValue({
				name: userData.name,
				email: userData.email,
				role: userData.role,
			});

			await userService.createUser(userData);

			expect(prismaMock.user.create).toHaveBeenCalledWith({
				data: {
					name: userData.name,
					email: userData.email,
					password: "hashed_password_teacher", // Agora o valor esperado vai bater
					role: userData.role,
					Student: undefined,
					Teacher: {
						create: {},
					},
				},
				select: {
					name: true,
					email: true,
					role: true,
				},
			});
		});
		it("should throw an error if email already exists", async () => {
			const userData = {
				name: "Another User",
				email: "existing@example.com",
				password: "password123",
				role: "student" as const,
			};

			(prismaMock.user.findUnique as jest.Mock).mockResolvedValue({
				id: "existing-user-id",
				email: userData.email,
			});

			await expect(userService.createUser(userData)).rejects.toThrow(
				"Email already exists",
			);

			expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
				where: { email: userData.email },
			});
			expect(bcrypt.hash).not.toHaveBeenCalled();
			expect(prismaMock.user.create).not.toHaveBeenCalled();
		});
	});

	describe("loginUser", () => {
		it("should return user data on successful login", async () => {
			const loginData = { email: "test@example.com", password: "password123" };
			const userFromDb = {
				id: "user-123",
				email: loginData.email,
				password: "hashed_password",
			};
			(prismaMock.user.findUnique as jest.Mock).mockResolvedValue(userFromDb);

			(bcrypt.compare as jest.Mock).mockResolvedValue(true);

			const result = await userService.loginUser(loginData);

			expect(result).toEqual(userFromDb);
			expect(bcrypt.compare).toHaveBeenCalledWith(
				loginData.password,
				userFromDb.password,
			);
		});
		it("should handle a user found without a password property", async () => {
			const loginData = { email: "test@example.com", password: "password123" };

			const userFromDbWithoutPassword = {
				id: "user-123",
				email: loginData.email,
			};
			(prismaMock.user.findUnique as jest.Mock).mockResolvedValue(
				userFromDbWithoutPassword,
			);

			(bcrypt.compare as jest.Mock).mockResolvedValue(false);

			await expect(userService.loginUser(loginData)).rejects.toThrow(
				"Invalid credentials",
			);

			expect(bcrypt.compare).toHaveBeenCalledWith(
				loginData.password,
				undefined,
			);
		});

		it("should throw an error for invalid credentials if user not found", async () => {
			// Arrange
			const loginData = { email: "test@example.com", password: "password123" };
			(prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

			// Act & Assert
			await expect(userService.loginUser(loginData)).rejects.toThrow(
				"Invalid credentials",
			);
			expect(bcrypt.compare).not.toHaveBeenCalled();
		});

		it("should throw an error for invalid credentials if password does not match", async () => {
			const loginData = {
				email: "test@example.com",
				password: "wrong_password",
			};

			const userFromDb = {
				id: "user-123",
				email: loginData.email,
				password: "hashed_password",
			};

			(prismaMock.user.findUnique as jest.Mock).mockResolvedValue(userFromDb);
			(bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

			await expect(userService.loginUser(loginData)).rejects.toThrow(
				"Invalid credentials",
			);

			expect(bcrypt.compare).toHaveBeenCalledWith(
				loginData.password,
				userFromDb.password,
			);
		});
	});
	describe("getUserById", () => {
		it("should return a user by id", async () => {
			const userId = "user-123";
			const userFromDb = {
				name: "Test User",
				email: "test@example.com",
			};
			(prismaMock.user.findUnique as jest.Mock).mockResolvedValue(userFromDb);

			const result = await userService.getUserById(userId);

			expect(result).toEqual(userFromDb);
			expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
				where: { id: userId },
				select: {
					name: true,
					email: true,
				},
			});
		});

		it("should throw an error if user is not found", async () => {
			const userId = "non-existent-user";
			(prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

			await expect(userService.getUserById(userId)).rejects.toThrow(
				"User not found",
			);
		});
	});
});
