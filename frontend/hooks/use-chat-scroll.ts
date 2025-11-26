import { useEffect, useRef } from "react";
import type { IChatMessage } from "@/types/message";

export function useChatScroll({
    scrollContainerRef,
    contentRef,
    localMessages,
    liveMessageId,
    isFetchingNextPage,
    initialLoad,
}: {
    scrollContainerRef: React.RefObject<HTMLDivElement | null>;
    contentRef: React.RefObject<HTMLDivElement | null>;
    localMessages: IChatMessage[];
    liveMessageId: string | null;
    isFetchingNextPage: boolean;
    initialLoad: boolean;
}) {
    const observerRef = useRef<ResizeObserver | null>(null);

    const isTyping =
        localMessages.length > 0 &&
        localMessages[localMessages.length - 1].sender === "ai" &&
        localMessages[localMessages.length - 1].id === liveMessageId;

    useEffect(() => {
        if (initialLoad && localMessages.length > 0) {
            setTimeout(() => {
                const container = scrollContainerRef.current;
                if (container) {
                    container.scrollTop = container.scrollHeight;
                }
            }, 100);
        }
    }, [initialLoad, localMessages.length, scrollContainerRef]);

    useEffect(() => {
        if (liveMessageId) {
            const container = scrollContainerRef.current;
            if (container) {
                container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
            }
        }
    }, [liveMessageId, scrollContainerRef]);

    useEffect(() => {
        const container = scrollContainerRef.current;
        const content = contentRef.current;
        if (!container || !content || !isTyping) {
            observerRef.current?.disconnect();
            observerRef.current = null;
            return;
        }

        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        observerRef.current = new ResizeObserver(() => {
            if (isFetchingNextPage) return;

            requestAnimationFrame(() => {
                const distanceToBottom =
                    container.scrollHeight - container.scrollTop - container.clientHeight;

                if (distanceToBottom < 100) {
                    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
                }
            });
        });

        observerRef.current.observe(content);

        return () => {
            observerRef.current?.disconnect();
            observerRef.current = null;
        };
    }, [isTyping, isFetchingNextPage, scrollContainerRef, contentRef]);
}
