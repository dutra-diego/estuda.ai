"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { SendHorizonal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext, useEffect } from "react";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { FormTypeContext } from "@/contexts/form-context";
import { queryClient } from "@/lib/react-query";
import { createChatWithMessage } from "@/services/create-chat-with-message";
import { Spinner } from "../ui/spinner";
import { ChatSlug } from "./chat-slug";

const formSchema = z.object({
	title: z.string().min(1).max(100),
	classId: z.uuid().optional(),
	text: z.string().min(1).max(1000),
	difficulty: z.enum(["easy", "medium", "hard"]),
});

type typeForm = z.infer<typeof formSchema>;

export function FormChat() {
	const { setActiveChat, setLocalMessages } = useContext(FormTypeContext);
	const router = useRouter();
	const { register, handleSubmit, control } = useForm<typeForm>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: "Novo Chat",
			text: "",
		},
	});

	const createChatMutation = useMutation({
		mutationFn: createChatWithMessage,
		onSuccess: (chatId) => {
			router.push(`/chat/${chatId}`);
			queryClient.invalidateQueries({ queryKey: ["chats"] });
		},
	});

	useEffect(() => {
		setActiveChat("");
		setLocalMessages([]);
	}, [setActiveChat, setLocalMessages]);

	const onValid: SubmitHandler<typeForm> = async (data) => {
		createChatMutation.mutate({
			title: "Novo chat",
			difficulty: data.difficulty,
			text: data.text,
			sender: "user",
		});
	};
	const onInvalid = () => {
		toast.error("Por favor, preencha todos os campos corretamente.");
	};

	return (
		<div className="w-full items-center lg:justify-center p-2 ">
			<form
				onSubmit={handleSubmit(onValid, onInvalid)}
				className="w-full flex flex-col items-center space-y-2"
			>
				<div className="w-11/12 lg:w-7/12">
					<Controller
						name="difficulty"
						control={control}
						render={({ field }) => (
							<Select
								name={field.name}
								value={field.value}
								onValueChange={field.onChange}
								disabled={createChatMutation.isPending}
							>
								<SelectTrigger className="w-46">
									<SelectValue placeholder="Nível" />
								</SelectTrigger>
								<SelectContent className="">
									<SelectGroup>
										<SelectLabel className="text-zinc-300">
											Conhecimento
										</SelectLabel>
										<SelectItem value="easy">Iniciante</SelectItem>
										<SelectItem value="medium">Intermediário</SelectItem>
										<SelectItem value="hard">Avançado</SelectItem>
									</SelectGroup>
								</SelectContent>
							</Select>
						)}
					/>
				</div>

				{createChatMutation.isPending ? (
					<Spinner className="size-8 h-96 self-center" />
				) : (
					<ChatSlug />
				)}

				<div className="flex border border-zinc-500 w-11/12 lg:w-7/12 items-center h-[150px] rounded-md">
					<textarea
						placeholder="Digite sua dúvida.."
						className="px-2 py-1 bg-transparent border-none focus:outline-none resize-none w-full h-full scrollbar-thin scrollbar-track-rounded-full scrollbar-thumb-rounded-full scrollbar-thumb-gray-800 scrollbar-track-gray-900 overflow-y-auto scrollbar-hover:scrollbar-thumb-gray-600"
						{...register("text")}
						onKeyDown={(e) => {
							if (e.key === "Enter" && !e.shiftKey) {
								handleSubmit(onValid, onInvalid)();
								e.preventDefault();
							}
						}}
						disabled={createChatMutation.isPending}
					/>
					<button
						type="submit"
						disabled={createChatMutation.isPending}
						className="cursor-pointer"
						aria-label="Enviar"
					>
						<SendHorizonal className="w-20" />
					</button>
				</div>
			</form>
		</div>
	);
}
