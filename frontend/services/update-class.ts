import { api } from "@/lib/axios";
import type { IClass } from "@/types/class";

export async function updateClass(classData: IClass) {
	await api.patch("/class", classData);
}
