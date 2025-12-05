import { useEffect, useState } from "react";
import type { IChatMessage, ISSEMessage } from "@/types/message";

export function useChatSSE(
	slug: string,
	setLocalMessages: React.Dispatch<React.SetStateAction<IChatMessage[]>>,
) {
	const [isNewMessage, setNewMessage] = useState<boolean>(false);

	useEffect(() => {
		if (!slug) return;

		let eventSource: EventSource | null = null;
		let isMounted = true;
		let reconnectTimeout: NodeJS.Timeout | null = null;
		let reconnectAttempts = 0;
		const MAX_RECONNECT_ATTEMPTS = 5;

		const connectSSE = () => {
			if (!isMounted) return;

			eventSource = new EventSource(
				`${process.env.NEXT_PUBLIC_API_URL}/sse/connect?chat=${slug}`,
				{ withCredentials: true },
			);

			eventSource.onmessage = (event) => {
				if (!isMounted) return;

				try {
					const data = JSON.parse(event.data) as ISSEMessage;
					if (data.type === "new-message") {
						const { message } = data.payload;

						setNewMessage(true);

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
					reconnectAttempts = 0;
				} catch (_error) {
				
				}
			};

			eventSource.onerror = (_error) => {
				if (!isMounted) return;
				eventSource?.close();

				if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
					const backoffDelay = Math.min(1000 * 2 ** reconnectAttempts, 30000);
					reconnectAttempts++;

					reconnectTimeout = setTimeout(() => {
						if (isMounted) connectSSE();
					}, backoffDelay);
				}
			};
		};

		connectSSE();

		return () => {
			isMounted = false;
			eventSource?.close();
			if (reconnectTimeout) clearTimeout(reconnectTimeout);
			setNewMessage(false);
		};
	}, [slug, setLocalMessages]);

	return { isNewMessage };
}
