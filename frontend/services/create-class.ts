import { api } from "@/lib/axios";

export async function createClass(name: string): Promise<string> {
	const { data } = await api.post<{ id: string }>("/class", { name });
	return data.id;
}
