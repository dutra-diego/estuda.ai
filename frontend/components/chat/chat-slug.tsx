import React, { useContext, useEffect, useMemo, useRef } from "react";
import removeMd from "remove-markdown";
import { FormTypeContext } from "@/contexts/form-context";
import type { ISSEMessage } from "@/types/message";
import TextType from "../ui/textType";

const MessageItem = React.memo<{
	message: { id: string; text: string; sender: string };
	isLast: boolean;
}>(({ message, isLast }) => {
	const cleanText = useMemo(() => removeMd(message.text), [message.text]);

	if (message.sender === "user") {
		return (
			<p className="flex text-wrap text-justify bg-gray-900 w-1/2 p-3 mt-2 rounded-md">
				{message.text}
			</p>
		);
	}

	if (isLast) {
		return (
			<TextType
				className="flex text-wrap text-justify bg-gray-900 self-end-safe w-1/2 p-3 mt-2 rounded-md"
				text={cleanText}
				typingSpeed={35}
				pauseDuration={1500}
				showCursor={false}
				cursorCharacter="|"
			/>
		);
	}

	return (
		<p className="flex text-wrap text-justify  bg-gray-900 self-end-safe w-1/2 p-3 mt-2 rounded-md">
			{cleanText}
		</p>
	);
});

MessageItem.displayName = "MessageItem";

export function ChatSlug() {
	const { activeChat, localMessages, setLocalMessages } =
		useContext(FormTypeContext);
	const endRef = useRef<HTMLDivElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!activeChat) return;

		let eventSource: EventSource | null = null;

		const connectSSE = () => {
			eventSource = new EventSource(
				`http://localhost:8080/sse/connect?chat=${activeChat}`,
				{
					withCredentials: true,
				},
			);

			eventSource.onmessage = (event) => {
				const data = JSON.parse(event.data) as ISSEMessage;
				if (data.type === "new-message") {
					const { message } = data.payload;
					setLocalMessages((prev) => [
						...prev,
						{
							id: message.id,
							text: message.text,
							difficulty: message.difficulty,
							sender: message.sender,
						},
					]);
				}
			};

			eventSource.onerror = () => {
				if (eventSource) {
					eventSource.close();
					eventSource = null;
				}
			};
		};

		connectSSE();

		return () => {
			if (eventSource) {
				eventSource.close();
				eventSource = null;
			}
		};
	}, [activeChat, setLocalMessages]);

	useEffect(() => {
		if (!containerRef.current) return;

		let scrollTimeout: NodeJS.Timeout;
		const handleResize = () => {
			clearTimeout(scrollTimeout);
			scrollTimeout = setTimeout(() => {
				endRef.current?.scrollIntoView({ behavior: "smooth" });
			}, 50);
		};

		const observer = new ResizeObserver(handleResize);
		observer.observe(containerRef.current);
		return () => {
			observer.disconnect();
			clearTimeout(scrollTimeout);
		};
	}, []);

	return (
		<div ref={containerRef} className="w-full flex justify-between  flex-col">
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
						message={message}
						isLast={idx === arr.length - 1}
					/>
				))
			)}
			<div ref={endRef} />
		</div>
	);
}
