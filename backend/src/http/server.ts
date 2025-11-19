import "dotenv/config";
import fastifyCors from "@fastify/cors";
import fastifyJwt from "@fastify/jwt";
import fastify, { type FastifyError } from "fastify";
import {
	serializerCompiler,
	validatorCompiler,
	type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { env } from "../config/env";
import { isAppError } from "./lib/errors";
import { chatRoutes } from "./routes/chat-routes";
import { classRoutes } from "./routes/class-routes";
import { invitationRoutes } from "./routes/invitation-routes";
import { messageRoutes } from "./routes/message-routes";
import { reportRoutes } from "./routes/report-routes";
import { sseRoutes } from "./routes/sse-routes";
import { userRoutes } from "./routes/user-routes";

const server = fastify().withTypeProvider<ZodTypeProvider>();

server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);
server.register(fastifyCors, {
	origin: "http://localhost:3000",
	methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
	allowedHeaders: ["Content-Type", "Authorization"],
	credentials: true,
});

server.setErrorHandler((error: FastifyError, request, reply) => {
	request.log.error(error);

	if (isAppError(error)) {
		return reply.status(error.statusCode).send({ error: error.message });
	}

	const validation = (error as { validation?: unknown }).validation;
	if (validation) {
		return reply
			.status(400)
			.send({ error: "Validation failed", details: validation });
	}

	return reply.status(500).send({ error: "Internal Server Error" });
});

server.register(fastifyJwt, {
	secret: env.SECRET_JWT,
});

server.register(userRoutes);
server.register(chatRoutes);
server.register(messageRoutes);
server.register(sseRoutes);
server.register(classRoutes);
server.register(reportRoutes);
server.register(invitationRoutes);
server
	.listen({
		host: "0.0.0.0",
		port: env.PORT,
	})
	.then(() => {})
	.catch((_err) => {
		process.exit(1);
	});
