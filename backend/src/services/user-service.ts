import bcrypt from "bcrypt";
import { env } from "../config/env";
import { prisma } from "../http/lib/prisma";
import type { CreateUserType, LoginUserType } from "../schemas/user-schema";
export const userService = {
	async createUser(data: CreateUserType) {
		const user = await prisma.user.findUnique({
			where: { email: data.email },
		});
		if (user) {
			throw new Error("Email already exists");
		}
		const createdUser = await prisma.user.create({
			data: {
				email: data.email,
				name: data.name,
				password: await bcrypt.hash(data.password, env.SALT_ROUNDS),
				role: data.role,
				...(data.role === "student"
					? { Student: { create: {} } }
					: { Teacher: { create: {} } }),
			},
			select: {
				name: true,
				email: true,
				role: true,
			},
		});

		return createdUser;
	},

	async loginUser(data: LoginUserType) {
		const user = await prisma.user.findUnique({
			where: {
				email: data.email,
			},
		});

		if (!user) {
			throw new Error("Invalid credentials");
		}

		const hashedCompare = await bcrypt.compare(data.password, user?.password);

		if (!hashedCompare) {
			throw new Error("Invalid credentials");
		}

		return user;
	},

	async getUserById(id: string) {
		const user = await prisma.user.findUnique({
			where: { id },
			select: { name: true, email: true },
		});
		if (!user) {
			throw new Error("User not found");
		}

		return user;
	},
};
