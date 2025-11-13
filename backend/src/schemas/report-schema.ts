import z from "zod";

export const reportSchema = z.object({
	classId: z.uuid(),
});

export const reportParamsSchema = z.object({
	classId: z.uuid(),
});

export type ReportType = z.infer<typeof reportSchema>;
