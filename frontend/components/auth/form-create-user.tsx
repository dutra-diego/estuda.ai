"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useContext } from "react";
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
import { createUser } from "@/services/create-user";
import { Button } from "../ui/button";

const formSchema = z.object({
	name: z.string().min(2, "O nome deve ter no mínimo 2 caracteres"),
	email: z.email("Email inválido"),
	password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
	role: z.enum(["student", "teacher", ""]).refine((val) => val !== "", {
		message: "Selecione seu papel",
	}),
});

type typeForm = z.infer<typeof formSchema>;

export function FormCreateUser() {
	const { setFormType } = useContext(FormTypeContext);
	const createUserMutate = useMutation({
		mutationFn: createUser,
		onSuccess: () => {
			toast.success("Usuário criado com sucesso, redirecionando...");
			setTimeout(() => {
				setFormType("login");
			}, 1500);
		},
		onError: () => {
			toast.error("Erro ao criar usuário.");
		},
	});
	const {
		handleSubmit,
		register,
		control,
		formState: { errors },
	} = useForm<typeForm>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			role: "",
		},
		mode: "onTouched",
	});

	const onSubmit: SubmitHandler<typeForm> = async (data) => {
		createUserMutate.mutate({
			...data,
			role: data.role as "student" | "teacher",
		});
	};
	return (
		<div className="flex p-2 md:w-96 md:justify-self-center flex-col lg:h-[600px] items-center justify-center">
			<h2 className="self-start pb-2 text-lg font-bold text-zinc-100">
				Criar conta
			</h2>
			<form
				onSubmit={handleSubmit(onSubmit)}
				className="flex justify-center flex-col w-full space-y-2"
			>
				<label htmlFor="name" className="text-md font-medium  text-zinc-100">
					Nome
				</label>
				<input
					{...register("name")}
					type="name"
					name="name"
					id="name"
					className={`${errors.name ? "border-red-500" : ""} border border-gray-300 rounded-md shadow-sm p-2`}
					placeholder="Digite seu nome"
				/>
				{errors.name && (
					<p className="px-2 text-red-500 text-sm">{errors.name.message}</p>
				)}
				<label htmlFor="email" className="text-md font-medium text-zinc-100">
					Email
				</label>
				<input
					{...register("email")}
					type="email"
					name="email"
					id="email"
					className={`${errors.email ? "border-red-500" : ""} border border-gray-300 rounded-md shadow-sm p-2`}
					placeholder="Digite seu email"
					autoComplete="email"
				/>
				{errors.email && (
					<p className="px-2 text-red-500 text-sm">{errors.email.message}</p>
				)}
				<label
					htmlFor="password"
					className=" text-md font-medium text-zinc-100"
				>
					Senha
				</label>
				<input
					{...register("password")}
					type="password"
					name="password"
					id="password"
					className={`${errors.password ? "border-red-500" : ""} border border-gray-300 rounded-md shadow-sm p-2`}
					autoComplete="current-password"
					placeholder="Digite sua senha"
				/>
				{errors.password && (
					<p className="px-2 text-red-500 text-sm">{errors.password.message}</p>
				)}
				<label htmlFor="role" className="text-md font-medium text-zinc-100">
					Papel
				</label>
				<div className="w-full">
					<Controller
						name="role"
						control={control}
						render={({ field }) => (
							<Select value={field.value} onValueChange={field.onChange}>
								<SelectTrigger
									className={`${errors.role ? "border-red-500" : ""} w-1/2 p-2`}
								>
									<SelectValue placeholder="Selecione seu papel" />
								</SelectTrigger>
								<SelectContent className="">
									<SelectGroup>
										<SelectLabel className="text-zinc-300">Papel</SelectLabel>
										<SelectItem value="teacher">Professor</SelectItem>
										<SelectItem value="student">Aluno</SelectItem>
									</SelectGroup>
								</SelectContent>
							</Select>
						)}
					/>
				</div>
				{errors.role && (
					<p className="px-2 text-red-500 text-sm">{errors.role.message}</p>
				)}

				<Button
					type="submit"
					disabled={createUserMutate.isPending || createUserMutate.isSuccess}
					className={` ${createUserMutate.isPending || createUserMutate.isSuccess ? "opacity-40 cursor-not-allowed" : ""} mt-1 w-full bg-blue-600 hover:bg-blue-500 text-zinc-100`}
				>
					Criar conta
				</Button>
			</form>
			<div className="w-full py-2 flex justify-between">
				<Button
					onClick={() => setFormType("login")}
					variant={"link"}
					className=" text-zinc-100 hover:text-blue-400"
					type="button"
				>
					Retornar
				</Button>
			</div>
		</div>
	);
}
