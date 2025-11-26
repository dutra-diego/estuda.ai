import React, { useContext, useMemo } from "react";
import removeMd from "remove-markdown";
import { FormTypeContext } from "@/contexts/form-context";
import TextType from "../ui/textType";

const MessageItem = React.memo<{
	text: string;
	sender: string;
	isLast: boolean;
}>(({ text, sender, isLast }) => {
	const cleanText = useMemo(() => removeMd(text), [text]);

	if (sender === "user") {
		return (
			<p className="flex text-wrap text-lg bg-gray-900 self-end-safe w-1/2 p-3 mt-2 rounded-md">
				{text}
			</p>
		);
	}

	if (isLast) {
		return (
			<TextType
				className="flex text-wrap text-lg bg-gray-900 w-1/2 p-3 mt-2 rounded-md"
				text={cleanText}
				typingSpeed={50}
				pauseDuration={1500}
				showCursorWhileTyping={true}
				cursorCharacter="_"
			/>
		);
	}

	return (
		<p className="flex text-wrap text-lg bg-gray-900 w-1/2 p-3 mt-2 rounded-md">
			{cleanText}
		</p>
	);
});

MessageItem.displayName = "MessageItem";
interface ChatSlugProps {
	liveMessageId?: string;
}

export function ChatSlug({ liveMessageId }: ChatSlugProps) {
	const { activeChat, localMessages } = useContext(FormTypeContext);

	return (
		<div className="w-full flex justify-between  flex-col">
			{!activeChat ? (
				<div className="p-3 h-96 flex items-center justify-center ">
					<h1 className="w-60 lg:w-7/12 text-xl text-center">
						Preencha seu nível de conhecimento e digite sua dúvida, ou selecione
						um chat já criado.
					</h1>
				</div>
			) : (
				localMessages.map((message, idx, arr) => (
					<MessageItem
						key={message.id}
						text={message.text}
						sender={message.sender}
						isLast={idx === arr.length - 1 && message.id === liveMessageId}
					/>
				))
			)}
		</div>
	);
}
