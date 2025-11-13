import { api } from "@/lib/axios";
import type { IClass } from "@/types/class";

export async function getClasses(): Promise<IClass[]> {
	const { data } = await api.get<IClass[]>("/classes/student");
	return data;
}
