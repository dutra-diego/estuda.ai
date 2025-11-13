"use client";
import {
	createContext,
	type ReactNode,
	useCallback,
	useMemo,
	useState,
} from "react";
import type { IChatMessage } from "@/types/message";
import type { IUser } from "@/types/user";

type FormType = "login" | "register" | "forgot";
type FormTypeContextProps = {
	formType: FormType;
	setFormType: (type: FormType) => void;
	user: IUser | null;
	setUser: (user: IUser | null) => void;
	activeChat: string | null;
	setActiveChat: (chatId: string) => void;
	localMessages: IChatMessage[];
	setLocalMessages: React.Dispatch<React.SetStateAction<IChatMessage[]>>;
};

export const FormTypeContext = createContext<FormTypeContextProps>(
	{} as FormTypeContextProps,
);

export function FormTypeProvider({ children }: { children: ReactNode }) {
	const [formType, setFormTypeState] = useState<FormType>("login");
	const [user, setUserState] = useState<IUser | null>(null);
	const [activeChat, setActiveChatState] = useState<string | null>(null);
	const [localMessages, setLocalMessagesState] = useState<IChatMessage[]>([]);

	const setFormType = useCallback((type: FormType) => {
		setFormTypeState(type);
	}, []);

	const setUser = useCallback((user: IUser | null) => {
		setUserState(user);
	}, []);

	const setActiveChat = useCallback((chatId: string) => {
		setActiveChatState(chatId);
	}, []);

	const setLocalMessages = useCallback(
		(value: React.SetStateAction<IChatMessage[]>) => {
			setLocalMessagesState(value);
		},
		[],
	);

	const contextValue = useMemo(
		() => ({
			formType,
			setFormType,
			user,
			setUser,
			activeChat,
			setActiveChat,
			localMessages,
			setLocalMessages,
		}),
		[
			formType,
			user,
			activeChat,
			localMessages,
			setFormType,
			setUser,
			setActiveChat,
			setLocalMessages,
		],
	);

	return (
		<FormTypeContext.Provider value={contextValue}>
			{children}
		</FormTypeContext.Provider>
	);
}
