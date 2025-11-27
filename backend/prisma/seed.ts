import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { env } from "../src/config/env";

const prisma = new PrismaClient();

async function seed() {
	const user = await prisma.user.findFirst({
		where: {
			email: "professor@teste.com",
		},
	});

	if (user) {
		console.log("O banco de dados já foi populado.");
		return;
	}

	const teacherPassword = await bcrypt.hash("testeteste", env.SALT_ROUNDS);
	const studentPassword = await bcrypt.hash("testeteste", env.SALT_ROUNDS);

	const teacher = await prisma.user.create({
		data: {
			email: "professor@teste.com",
			name: "Professor Teste",
			password: teacherPassword,
			role: "teacher",
			Teacher: {
				create: {},
			},
		},
		include: {
			Teacher: true,
		},
	});

	const student = await prisma.user.create({
		data: {
			email: "aluno@teste.com",
			name: "Aluno Teste",
			password: studentPassword,
			role: "student",
			Student: {
				create: {},
			},
		},
		include: {
			Student: true,
		},
	});

	const classData = await prisma.class.create({
		data: {
			name: "Turma de Teste",
			teacherId: teacher.id,
		},
	});

	const invitation = await prisma.invitation.create({
		data: {
			email: student.email,
			classId: classData.id,
			teacherId: teacher.id,
			status: "pending",
		},
	});

	console.log("Seed criado com sucesso!");
	console.log("Professor:", teacher.email);
	console.log("Senha do Professor: testeteste");
	console.log("Aluno:", student.email);
	console.log("Senha do Aluno: testeteste");
	console.log("Turma:", classData.name);
	console.log("Convite da turma enviado para:", invitation.email);
}

seed()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
