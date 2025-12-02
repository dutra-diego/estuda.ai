"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SendHorizonal } from "lucide-react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useContext, useEffect, useRef } from "react";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";
import { useInView } from "react-intersection-observer";
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
import { Spinner } from "@/components/ui/spinner";
import { FormTypeContext } from "@/contexts/form-context";
import { useChatMessages } from "@/hooks/use-chat-messages";
import { useChatScroll } from "@/hooks/use-chat-scroll";
import { useChatSSE } from "@/hooks/use-chat-sse";
import { createMessage } from "@/services/create-message";

const ChatSlug = dynamic(
	() =>
		import("@/components/chat/chat-slug").then((m) => ({
			default: m.ChatSlug,
		})),
	{
		loading: () => (
			<div className="flex justify-center w-full">
				<Spinner className="size-8" />
			</div>
		),
		ssr: false,
	},
);

const SelectStudentClass = dynamic(
	() =>
		import("@/components/chat/select-student-class").then((m) => ({
			default: m.SelectStudentClass,
		})),
	{
		ssr: false,
	},
);

const formSchema = z.object({
	difficulty: z.string().min(1).max(100),
	text: z.string().min(1).max(1000),
	sender: z.enum(["user", "ai"]),
});

type typeForm = z.infer<typeof formSchema>;

export default function Page() {
	const { user, setActiveChat, setLocalMessages, localMessages } =
		useContext(FormTypeContext);
	const slug = useParams().slug as string;
	const queryClient = useQueryClient();
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);

	const {
		messagesData,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		messagesLoading,
		initialLoad,
		isReadyToLoadMore,
	} = useChatMessages(slug, user, setLocalMessages);

	const { isNewMessage } = useChatSSE(slug, setLocalMessages);

	useChatScroll({
		scrollContainerRef,
		contentRef,
		localMessages,
		isNewMessage,
		isFetchingNextPage,
		initialLoad,
	});

	const { ref, inView } = useInView();

	const lastDifficulty = (() => {
		if (!messagesData?.pages?.length) return "";
		const firstPage = messagesData.pages[0];
		if (!Array.isArray(firstPage) || firstPage.length === 0) return "";
		const lastMessage = firstPage[firstPage.length - 1];
		return lastMessage?.difficulty ?? "";
	})();

	const { register, handleSubmit, control, reset } = useForm<typeForm>({
		resolver: zodResolver(formSchema),
		mode: "onTouched",
		defaultValues: {
			difficulty: lastDifficulty,
			text: "",
			sender: "user",
		},
	});

	useEffect(() => {
		setActiveChat(slug);
		reset({
			difficulty: lastDifficulty,
			sender: "user",
			text: "",
		});
	}, [slug, setActiveChat, reset, lastDifficulty]);

	const lastFetchTime = useRef(0);

	useEffect(() => {
		const now = Date.now();
		if (inView && hasNextPage && !isFetchingNextPage && isReadyToLoadMore) {
			if (now - lastFetchTime.current > 1000) {
				lastFetchTime.current = now;
				fetchNextPage();
			}
		}
	}, [
		inView,
		hasNextPage,
		fetchNextPage,
		isFetchingNextPage,
		isReadyToLoadMore,
	]);

	const createMessageMutation = useMutation({
		mutationFn: (data: typeForm) => createMessage(slug, [data]),
		onError: () => {
			setLocalMessages((prev) => prev.slice(0, -1));
			toast.error("Erro ao enviar mensagem. Tente novamente.");
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["getmessages", slug] });
		},
	});

	const onValid: SubmitHandler<typeForm> = (data) => {
		setLocalMessages((prev) => [
			...prev,
			{
				id: crypto.randomUUID(),
				text: data.text,
				difficulty: data.difficulty,
				sender: "user",
				isOptimistic: true,
			},
		]);

		setTimeout(() => {
			const scrollContainer = scrollContainerRef.current;
			if (scrollContainer) {
				scrollContainer.scrollTo({
					top: scrollContainer.scrollHeight,
					behavior: "smooth",
				});
			}
		}, 100);

		createMessageMutation.mutate(data);

		reset({
			difficulty: data.difficulty,
			text: "",
			sender: "user",
		});
	};

	const onInvalid = () => {
		toast.error("Por favor, preencha todos os campos corretamente.");
	};

	return (
		<div className="w-full flex flex-col items-center lg:justify-center p-2 ">
			<form
				onSubmit={handleSubmit(onValid, onInvalid)}
				className="w-full flex flex-col items-center space-y-2"
			>
				<div className="w-11/12 flex justify-between md:py-2">
					<div className="flex flex-col gap-1">
						<label htmlFor="difficulty-select" className="sr-only">
							Nível de conhecimento
						</label>
						<Controller
							name="difficulty"
							control={control}
							render={({ field }) => (
								<Select
									name={field.name}
									value={field.value}
									onValueChange={field.onChange}
									disabled={createMessageMutation.isPending}
								>
									<SelectTrigger
										className="w-30 md:w-46"
										id="difficulty-select"
										aria-label="Selecione o nível de conhecimento"
									>
										<SelectValue placeholder="Nível" />
									</SelectTrigger>
									<SelectContent>
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

					<div className="flex flex-col gap-1">
						<SelectStudentClass slug={slug} />
					</div>
				</div>

				<div
					ref={scrollContainerRef}
					style={{ overflowAnchor: "auto" }}
					className="w-11/12 p-3 h-[580px] lg:h-[700px] border border-zinc-500 rounded-md overflow-y-auto scrollbar-thin scrollbar-track-rounded-full scrollbar-thumb-rounded-full scrollbar-thumb-gray-800 scrollbar-track-gray-900 scrollbar-hover:scrollbar-thumb-gray-600"
				>
					{messagesLoading ? (
						<Spinner className="size-8 flex justify-self-center" />
					) : (
						<div ref={contentRef} className="flex flex-col">
							<div ref={ref} className="h-4 w-full flex justify-center">
								{isFetchingNextPage && (
									<Spinner className="size-8 w justify-self-center" />
								)}
							</div>
							<ChatSlug isNewMessage={isNewMessage} />
						</div>
					)}
				</div>
				<div className="flex border border-zinc-500 w-11/12 items-center h-[150px] rounded-md">
					<label htmlFor="message-input" className="sr-only">
						Digite sua mensagem
					</label>
					<textarea
						id="message-input"
						placeholder="Digite sua dúvida.."
						className="px-2 py-1 bg-transparent border-none focus:outline-none resize-none w-full h-full scrollbar-thin scrollbar-track-rounded-full scrollbar-thumb-rounded-full scrollbar-thumb-gray-800 scrollbar-track-gray-900 scrollbar-hover:scrollbar-thumb-gray-600"
						{...register("text")}
						onKeyDown={(e) => {
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault();
								handleSubmit(onValid, onInvalid)();
							}
						}}
						disabled={createMessageMutation.isPending || messagesLoading}
					/>
					<button
						className="cursor-pointer hover:text-blue-400 transition-colors px-4"
						type="submit"
						disabled={createMessageMutation.isPending || messagesLoading}
						aria-label="Enviar mensagem"
					>
						<SendHorizonal className="w-6 h-6" aria-hidden="true" />
					</button>
				</div>
			</form>
		</div>
	);
}
