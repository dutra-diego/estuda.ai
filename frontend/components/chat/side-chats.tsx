"use client";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { LogOut, MessageSquareMore, Pencil, SquarePlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import nookies from "nookies";
import React, { useContext, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { FormUpdateChat } from "@/components/chat/form-update-chat";
import { Button } from "@/components/ui/button";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { FormTypeContext } from "@/contexts/form-context";
import { queryClient } from "@/lib/react-query";
import { createChat } from "@/services/create-chat";
import { getChat } from "@/services/get-chat";
import { getMessages } from "@/services/get-messages";
import { getUser } from "@/services/get-user";
import type { IChat } from "@/types/chat";
import { Skeleton } from "../ui/skeleton";
import { Spinner } from "../ui/spinner";

export function SideChats() {
	const [editingChatId, setEditingChatId] = useState<string | null>(null);
	const { activeChat, setUser } = useContext(FormTypeContext);
	const { setOpenMobile } = useSidebar();
	const router = useRouter();
	const {
		data: user,
		isError,
		isSuccess,
		isLoading: userIsLoading,
	} = useQuery({
		queryKey: ["user"],
		queryFn: getUser,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		refetchOnMount: false,
		staleTime: Infinity,
		retry: false,
	});

	const {
		data: chatData,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useInfiniteQuery({
		queryKey: ["chats"],
		queryFn: ({ pageParam }) => getChat(pageParam),
		refetchOnMount: false,
		refetchOnWindowFocus: false,
		retry: false,
		initialPageParam: 0,
		getNextPageParam: (lastPage, allPages) => {
			if (!Array.isArray(lastPage) || lastPage.length < 11) return undefined;
			const pages = Array.isArray(allPages) ? allPages : [];
			return pages.flat().length;
		},

	});

	const { ref, inView } = useInView();

	useEffect(() => {
		if (inView && hasNextPage) {
			fetchNextPage();
		}
	}, [inView, hasNextPage, fetchNextPage]);

	const { mutate: createNewChatMutation, isPending: createNewChatPending } =
		useMutation({
			mutationFn: createChat,

			onMutate: async () => {
				await queryClient.cancelQueries({ queryKey: ["chats"] });

				const previousChats = queryClient.getQueryData<{ pages: IChat[][] }>([
					"chats",
				]);

				const optimisticChat: IChat = {
					id: `temp-${Date.now()}`,
					title: "Novo Chat",
					classId: "",
				};
				queryClient.setQueryData<{ pages: IChat[][]; pageParams: number[] }>(
					["chats"],
					(old) => {
						const optimisticPage = [optimisticChat];
						if (!old || !Array.isArray(old.pages)) {
							return { pages: [optimisticPage], pageParams: [0] };
						}
						const newPages = old.pages.map((page) =>
							Array.isArray(page) ? page : [],
						);
						if (newPages.length === 0) {
							newPages.push(optimisticPage);
						} else {
							newPages[0] = [optimisticChat, ...newPages[0]];
						}
						return { ...old, pages: newPages };
					},
				);
				setOpenMobile(false);
				router.push(`/chat/${optimisticChat.id}`);

				return { previousChats, optimisticChat };
			},

			onSuccess: (chat, _, context) => {
				queryClient.setQueryData<{ pages: IChat[][]; pageParams: number[] }>(
					["chats"],
					(old) => {
						if (!old) return { pages: [[chat]], pageParams: [0] };
						return {
							...old,
							pages: old.pages.map((page) =>
								page.map((c) =>
									c.id === context?.optimisticChat.id ? chat : c,
								),
							),
						};
					},
				);
				router.replace(`/chat/${chat.id}`);
			},

			onError: (_error, _, context) => {
				if (context?.previousChats) {
					queryClient.setQueryData<{ pages: IChat[][] }>(
						["chats"],
						context.previousChats,
					);
				}

				router.push("/chat");
			},

			onSettled: () => {
				queryClient.invalidateQueries({ queryKey: ["chats"] });
			},
		});
	useEffect(() => {
		if (isSuccess && user) {
			setUser(user);
		}
		if (isError) {
			nookies.destroy(null, "authToken", { path: "/" });
			router.push("/");
		}
	}, [isSuccess, isError, user, setUser, router]);

	function handleChatClick(chatId: string) {
		setOpenMobile(false);
		queryClient.prefetchInfiniteQuery({
			queryKey: ["getmessages", chatId],
			queryFn: ({ pageParam }) => getMessages(chatId, pageParam),
			initialPageParam: 0,
		});
		router.push(`/chat/${chatId}`);
	}
	function handleEditClick(chat: { id: string; title: string }) {
		setEditingChatId(chat.id);
	}

	function handleLogout() {
		nookies.destroy(null, "authToken");
		setUser(null);
		router.push("/");
	}
	return (
		<Sidebar className="border-r border-zinc-500 scrollbar-thin scrollbar-track-rounded-full scrollbar-thumb-rounded-full scrollbar-thumb-gray-800 scrollbar-track-gray-900 overflow-y-auto scrollbar-hover:scrollbar-thumb-gray-600 ">
			<SidebarHeader className="border-b border-zinc-500">
				<div className="flex items-center justify-between my-2">
					<Link href="/chat" className="text-zinc-300 hover:text-zinc-100">
						Chats
					</Link>
					<Button
						variant="ghost"
						onClick={() => createNewChatMutation()}
						disabled={!user || createNewChatPending}
					>
						<SquarePlus width={16} />
						<p>Novo Chat</p>
					</Button>
				</div>
			</SidebarHeader>
			<SidebarContent className="my-2 scrollbar-thin scrollbar-track-rounded-full scrollbar-thumb-rounded-full scrollbar-thumb-gray-800 scrollbar-track-gray-900 overflow-y-auto scrollbar-hover:scrollbar-thumb-gray-600">
				<SidebarGroup>
					<SidebarGroupContent className="">
						<SidebarMenu>
							<SidebarMenuItem>
								{chatData?.pages.map((page, pageIndex) => (
									<React.Fragment key={`page-${pageIndex + 1}`}>
										{page.map((chat) => (
											<div key={chat.id}>
												{editingChatId === chat.id ? (
													<FormUpdateChat
														chatId={chat.id}
														setEditingChatId={setEditingChatId}
													/>
												) : (
													<div
														className={`flex items-center hover:bg-accent/10 px-1 justify-between rounded-md h-10 mb-2 ${
															activeChat === chat.id
																? "bg-accent/10"
																: "bg-transparent"
														}`}
													>
														<Button
															className="cursor-pointer flex-1 flex justify-start min-w-0"
															onClick={() => handleChatClick(chat.id)}
															type="button"
															variant="chat"
															aria-label="Abrir"
														>
															<MessageSquareMore />
															<p className="flex-1 text-left overflow-hidden text-ellipsis whitespace-nowrap">
																{chat.title}
															</p>
														</Button>
														<Button
															className="cursor-pointer hover:bg-accent/10 shrink-0"
															type="button"
															variant="chat"
															onClick={(e) => {
																e.stopPropagation();
																handleEditClick(chat);
															}}
															aria-label="Editar"
														>
															<Pencil />
														</Button>
													</div>
												)}
											</div>
										))}
									</React.Fragment>
								))}
								<div ref={ref} className="h-4 w-full text-center">
									{isFetchingNextPage && <Spinner />}
								</div>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter className="border-t  border-zinc-500 ">
				<div className="flex items-center justify-between m-2">
					{userIsLoading ? (
						<Skeleton className="w-48 h-6 rounded-full" />
					) : (
						<p className="truncate w-48">Bem-vindo, {user?.name}.</p>
					)}
					<Button
						variant="ghost"
						onClick={() => handleLogout()}
						aria-label="Sair"
						disabled={userIsLoading}
					>
						<LogOut color="red" className="w-5 h-5" />
					</Button>
				</div>
			</SidebarFooter>
		</Sidebar>
	);
}
