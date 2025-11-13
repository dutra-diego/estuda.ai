import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { sseController } from "../../controllers/sse-controller";

export const sseRoutes: FastifyPluginAsyncZod = async (server) => {
	server.get("/sse/connect", sseController.connect);
};
