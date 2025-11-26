"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getClasses } from "@/services/get-classes";
import { updateChatClass } from "@/services/update-chat-class";
import type { IChat } from "@/types/chat";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "../ui/select";

export function SelectStudentClass({ slug }: { slug: string }) {
	const [selectedClass, setSelectedClass] = useState<string>("");
	const [isLocked, setIsLocked] = useState(false);
	const queryClient = useQueryClient();

	const { data: classes } = useQuery({
		queryKey: ["student-classes"],
		queryFn: getClasses,
		refetchOnWindowFocus: false,
		staleTime: Infinity,
	});

	useEffect(() => {
		const allChats = queryClient.getQueryData<{ pages: IChat[][] }>(["chats"]);

		if (allChats) {
			const chatMap = new Map(
				allChats.pages.flat().map((chat) => [chat.id, chat]),
			);
			const currentChat = chatMap.get(slug);

			if (currentChat?.classId) {
				setSelectedClass(currentChat.classId);
				setIsLocked(true);
			}
		}

		const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
			if (event?.query.queryKey[0] === "chats") {
				const updatedChats = queryClient.getQueryData<{ pages: IChat[][] }>([
					"chats",
				]);
				if (updatedChats) {
					const chatMap = new Map(
						updatedChats.pages.flat().map((chat) => [chat.id, chat]),
					);
					const updatedChat = chatMap.get(slug);

					if (updatedChat?.classId) {
						setSelectedClass(updatedChat.classId);
						setIsLocked(true);
					}
				}
			}
		});

		return () => unsubscribe();
	}, [queryClient, slug]);

	const updateClassMutation = useMutation({
		mutationFn: (classId: string) => updateChatClass({ id: slug, classId }),
		onMutate: async (classId) => {
			await queryClient.cancelQueries({ queryKey: ["chats"] });
			const previousChats = queryClient.getQueryData<{
				pages: IChat[][];
				pageParams: number[];
			}>(["chats"]);

			queryClient.setQueryData<{ pages: IChat[][]; pageParams: number[] }>(
				["chats"],
				(old) => {
					if (!old) return old;
					return {
						...old,
						pages: old.pages.map((page) =>
							page.map((chat) => (chat.id === slug ? { ...chat, classId } : chat)),
						),
					};
				},
			);

			return { previousChats };
		},
		onError: (_err, _vars, context) => {
			if (context?.previousChats) {
				queryClient.setQueryData(["chats"], context.previousChats);
			}
			setIsLocked(false);
			toast.error("Erro ao vincular turma. Tente novamente.");
		},
		onSuccess: () => {
			setIsLocked(true);
			toast.success("Chat vinculado à turma com sucesso!");
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["chats"] });
		},
	});

	const handleValueChange = (classId: string) => {
		if (isLocked) return;
		setSelectedClass(classId);
		updateClassMutation.mutate(classId);
	};

	if (!classes || classes.length === 0) return null;

	return (
		<>
			<label htmlFor="class-select" className="sr-only">
				Turma
			</label>
			<Select
				value={selectedClass}
				onValueChange={handleValueChange}
				disabled={isLocked || updateClassMutation.isPending}
			>
				<SelectTrigger
					className="w-30 md:w-46"
					id="class-select"
					aria-label="Selecione uma turma"
				>
					<SelectValue placeholder="Selecione uma turma" />
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						<SelectLabel className="text-zinc-300">Minhas Turmas</SelectLabel>
						{classes.map((classItem) => (
							<SelectItem key={classItem.id} value={classItem.id}>
								{classItem.name}
							</SelectItem>
						))}
					</SelectGroup>
				</SelectContent>
			</Select>
		</>
	);
}
