"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { FormTypeContext } from "@/contexts/form-context";
import { userLogin } from "@/services/user-login";
import { Button } from "../ui/button";

const formSchema = z.object({
	email: z.email("Digite um email válido"),
	password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

type typeForm = z.infer<typeof formSchema>;

export function FormLogin() {
	const { setFormType } = useContext(FormTypeContext);
	const router = useRouter();
	const loginMutation = useMutation({
		mutationFn: userLogin,
		onSuccess: () => {
			router.push("/chat");
		},
		onError: (error) => {
			if (error instanceof AxiosError && error.status === 500) {
				toast.error("Usuário e/ou senha inválidos.");
			} else {
				toast.error("Não foi possível conectar ao servidor.");
			}
		},
	});
	const {
		handleSubmit,
		register,
		formState: { errors },
	} = useForm<typeForm>({
		resolver: zodResolver(formSchema),
		mode: "onTouched",
	});

	const onSubmit: SubmitHandler<typeForm> = async (data) => {
		loginMutation.mutate(data);
	};
	return (
		<div className="flex p-2 md:w-96 flex-col lg:h-[600px] items-center justify-center md:justify-self-center">
			<h2 className="self-start pb-2 text-lg font-bold text-zinc-100">Login</h2>
			<form
				onSubmit={handleSubmit(onSubmit)}
				className="flex flex-col w-full space-y-2"
			>
				<label htmlFor="email" className="text-md font-medium text-zinc-100">
					Email
				</label>

				<input
					{...register("email")}
					type="email"
					name="email"
					id="email"
					className={`${errors.email ? "border-red-500" : ""} w-full border border-gray-300 rounded-md shadow-sm p-2`}
					placeholder="Digite seu email"
					autoComplete="username"
				/>
				{errors.email && (
					<p className="px-2 text-red-500 text-sm">{errors.email.message}</p>
				)}
				<label htmlFor="password" className="text-md font-medium text-zinc-100">
					Senha
				</label>
				<input
					{...register("password")}
					type="password"
					name="password"
					id="password"
					className={`${errors.password ? "border-red-500" : ""} w-full border border-gray-300 rounded-md shadow-sm p-2`}
					placeholder="Digite sua senha"
					autoComplete="current-password"
				/>
				{errors.password && (
					<p className="px-2 text-red-500 text-sm">{errors.password.message}</p>
				)}
				<Button
					type="submit"
					disabled={loginMutation.isPending || loginMutation.isSuccess}
					className={` ${loginMutation.isPending || loginMutation.isSuccess ? "opacity-40 cursor-not-allowed" : ""} mt-1 w-full bg-blue-600 hover:bg-blue-500 text-zinc-100`}
					size={"lg"}
				>
					{loginMutation.isPending && <Loader2Icon className="animate-spin" />}
					Entrar
				</Button>
			</form>
			<div className="w-full px-1 py-2 flex justify-between">
				<Button onClick={() => setFormType("forgot")} variant={"link"}>
					Esqueci a senha
				</Button>
				<Button onClick={() => setFormType("register")} variant={"link"}>
					Criar conta
				</Button>
			</div>
		</div>
	);
}
