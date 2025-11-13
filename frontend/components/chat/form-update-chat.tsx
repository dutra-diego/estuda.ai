import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Check, X } from "lucide-react";
import { useEffect } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import z from "zod";
import { queryClient } from "@/lib/react-query";
import { updateChatTitle } from "@/services/update-chat";
import type { IChat } from "@/types/chat";
import { Button } from "../ui/button";

const formSchema = z.object({
	title: z.string().min(1).max(100),
});

type typeForm = z.infer<typeof formSchema>;

type FormUpdateChatProps = {
	chatId: string;
	setEditingChatId: React.Dispatch<React.SetStateAction<string | null>>;
};

export function FormUpdateChat({
	chatId,
	setEditingChatId,
}: FormUpdateChatProps) {
	const { register, handleSubmit } = useForm<typeForm>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: "",
		},
	});

	const updateTitleMutatate = useMutation({
		mutationFn: updateChatTitle,
		onMutate: async (chats: { id: string; title: string }) => {
			await queryClient.cancelQueries({ queryKey: ["chats"] });
			const previous = queryClient.getQueryData<IChat[]>(["chats"]);
			queryClient.setQueryData<IChat[]>(["chats"], (old) =>
				(old ?? []).map((c) =>
					c.id === chats.id ? { ...c, title: chats.title } : c,
				),
			);
			return { previous };
		},
		onError: (_err, _vars, context?: { previous?: IChat[] }) => {
			if (context?.previous) {
				queryClient.setQueryData(["chats"], context.previous);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["chats"] });
		},
		onSuccess: () => {
			setEditingChatId(null);
		},
	});

	const onSubmit: SubmitHandler<typeForm> = async (data) => {
		updateTitleMutatate.mutate({
			id: chatId,
			title: data.title,
		});
	};

	function handleCancelEdit() {
		setEditingChatId(null);
	}

	useEffect(() => {
		const input = document.querySelector(
			'input[name="title"]',
		) as HTMLInputElement | null;
		input?.focus();
	}, []);

	return (
		<form
			className="flex items-center justify-between w-full h-10 mb-2 border rounded-md px-2"
			onSubmit={handleSubmit(onSubmit)}
		>
			<input
				className="h-full w-full pr-2 border-none bg-transparent outline-none focus:ring-0"
				type="text"
				{...register("title")}
			/>
			<Button
				className="p-0"
				size="sm"
				variant="ghost"
				type="submit"
				aria-label="Salvar"
			>
				<Check width={16} color="green" />
			</Button>
			<Button
				className="p-0"
				size="sm"
				variant="ghost"
				type="button"
				onClick={handleCancelEdit}
				aria-label="Cancelar"
			>
				<X width={16} color="red" />
			</Button>
		</form>
	);
}
