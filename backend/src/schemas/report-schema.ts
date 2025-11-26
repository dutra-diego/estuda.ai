import z from "zod";

export const reportSchema = z.object({
	classId: z.uuid(),
});
