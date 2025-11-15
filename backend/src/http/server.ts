import "dotenv/config";
import fastifyCors from "@fastify/cors";
import fastifyJwt from "@fastify/jwt";
import fastify from "fastify";
import {
	serializerCompiler,
	validatorCompiler,
	type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { env } from "../config/env";
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

server.setErrorHandler((error, request, reply) => {
	request.log.error(error);
	if (error.validation || error.message === "Invalid request") {
		return reply
			.status(400)
			.send({ error: "Invalid request", details: error.validation });
	}
	if (error.message === "Email already exists") {
		return reply.status(409).send({ error: "Email already exists" });
	}
	if (error.message === "Unauthorized") {
		return reply.status(401).send({ error: "Unauthorized" });
	}
	if (error.message === "User not found") {
		return reply.status(404).send({ error: "User not found" });
	}
	if(error.message === "AI service error"){
		return reply.status(502).send({ error: "AI service error" });
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
