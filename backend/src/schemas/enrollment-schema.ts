import z from "zod";

export const enrollmentSchema = z.object({
	classId: z.uuid(),
	studentId: z.uuid(),
});
