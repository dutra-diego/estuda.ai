"use client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { LogOut, MessageSquareMore, Pencil, SquarePlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import nookies from "nookies";
import { useContext, useEffect, useState } from "react";
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
import { createClass } from "@/services/create-class";
import { getClasses } from "@/services/get-classes";
import { getUser } from "@/services/get-user";
import type { IClass } from "@/types/class";
import { FormUpdateClass } from "./form-update-class";

export function SideClass() {
	const [editingClassId, setEditingClassId] = useState<string | null>(null);
	const { activeChat, setUser } = useContext(FormTypeContext);
	const { setOpenMobile } = useSidebar();
	const router = useRouter();

	const {
		data: user,
		isError,
		isSuccess,
	} = useQuery({
		queryKey: ["user"],
		queryFn: getUser,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		refetchOnMount: false,
		staleTime: 15,
	});

	const { data: classData } = useQuery({
		queryKey: ["classes"],
		queryFn: getClasses,
		enabled: !!user,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		refetchOnMount: true,
		staleTime: Infinity,
	});

	const createClassMutation = useMutation({
		mutationFn: () => createClass("Nova Turma"),
		onMutate: async () => {
			await queryClient.cancelQueries({ queryKey: ["classes"] });
			const previousClasses = queryClient.getQueryData<IClass[]>(["classes"]);

			const optimisticClass: IClass = {
				id: `temp-${Date.now()}`,
				name: "Nova Turma",
			};

			queryClient.setQueryData<IClass[]>(["classes"], (old) =>
				old ? [optimisticClass, ...old] : [optimisticClass],
			);

			setOpenMobile(false);

			return { previousClasses, optimisticClass };
		},

		onSuccess: (newClassId, _, context) => {
			queryClient.setQueryData<IClass[]>(["classes"], (old) => {
				if (!old) return old;
				return old.map((c) =>
					c.id === context?.optimisticClass.id
						? { ...context.optimisticClass, id: newClassId }
						: c,
				);
			});

			router.push(`/classes/${newClassId}`);
		},

		onError: (_error, _, context) => {
			if (context?.previousClasses) {
				queryClient.setQueryData(["classes"], context.previousClasses);
			}

			router.push("/classes");
		},

		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["classes"] });
		},
	});

	useEffect(() => {
		if (isSuccess && user) {
			setUser(user);
		}
		if (isError) {
			router.push("/");
		}
	}, [isSuccess, isError, user, setUser, router]);

	function handleClassClick(classId: string) {
		setOpenMobile(false);
		router.push(`/classes/${classId}`);
	}

	function handleEditClick(classItem: { id: string; name: string }) {
		setEditingClassId(classItem.id);
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
					<Link href="/classes" className="text-zinc-300 hover:text-zinc-100">
						Turmas
					</Link>
					<Button
						variant="ghost"
						onClick={() => createClassMutation.mutate()}
						disabled={!user}
					>
						<SquarePlus width={16} />
						<p>Nova Turma</p>
					</Button>
				</div>
			</SidebarHeader>
			<SidebarContent className="my-2 scrollbar-thin scrollbar-track-rounded-full scrollbar-thumb-rounded-full scrollbar-thumb-gray-800 scrollbar-track-gray-900 overflow-y-auto scrollbar-hover:scrollbar-thumb-gray-600">
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								{classData?.map((classItem) => (
									<div key={classItem.id}>
										{editingClassId === classItem.id ? (
											<FormUpdateClass
												classId={classItem.id}
												setEditingClassId={setEditingClassId}
											/>
										) : (
											<div
												className={`flex items-center hover:bg-accent/10 px-1 justify-between rounded-md h-10 mb-2 ${activeChat === classItem.id ? "bg-accent/10" : "bg-transparent"}`}
											>
												<Button
													className="cursor-pointer flex-1 flex justify-start min-w-0"
													onClick={() => handleClassClick(classItem.id)}
													type="button"
													variant="chat"
												>
													<MessageSquareMore />
													<p className="flex-1 text-left overflow-hidden text-ellipsis whitespace-nowrap">
														{classItem.name}
													</p>
												</Button>
												<Button
													className="cursor-pointer hover:bg-accent/10 shrink-0"
													type="button"
													variant="chat"
													onClick={(e) => {
														e.stopPropagation();
														handleEditClick(classItem);
													}}
												>
													<Pencil />
												</Button>
											</div>
										)}
									</div>
								))}
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter className="border-t border-zinc-500">
				<div className="flex items-center justify-between m-2">
					<p>Bem-vindo, {user?.name}.</p>
					<Button variant="ghost" onClick={() => handleLogout()}>
						<LogOut color="red" className="w-5 h-5" />
					</Button>
				</div>
			</SidebarFooter>
		</Sidebar>
	);
}
