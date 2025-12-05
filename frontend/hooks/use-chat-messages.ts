import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { getMessages } from "@/services/get-messages";
import type { IChatMessage } from "@/types/message";
import type { IUser } from "@/types/user";

export function useChatMessages(
	slug: string,
	user: IUser | null,
	setLocalMessages: React.Dispatch<React.SetStateAction<IChatMessage[]>>,
) {
	const [initialLoad, setInitialLoad] = useState(false);
	const [isReadyToLoadMore, setIsReadyToLoadMore] = useState(false);

	const {
		data: messagesData,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading: messagesLoading,
	} = useInfiniteQuery({
		queryKey: ["getmessages", slug],
		queryFn: ({ pageParam }) => getMessages(slug, pageParam),
		initialPageParam: 0,
		getNextPageParam: (lastPage, allPages) => {
			if (!Array.isArray(lastPage) || lastPage.length < 20) return undefined;
			return allPages.flat().length;
		},
		enabled: !!user,
		refetchOnWindowFocus: false,
		retry: false,
		refetchOnMount: false,
		staleTime: 1000 * 60,
	});

	const flattenedMessages = useMemo(() => {
		if (!messagesData) return [];

		const total = messagesData.pages.reduce(
			(sum, page) => sum + page.length,
			0,
		);
		const result = new Array(total);
		let idx = 0;

		for (let i = messagesData.pages.length - 1; i >= 0; i--) {
			const page = messagesData.pages[i];
			for (let j = page.length - 1; j >= 0; j--) {
				result[idx++] = page[j];
			}
		}

		return result;
	}, [messagesData]);

	useEffect(() => {
		if (messagesData) {
			setInitialLoad(messagesData.pages.length === 1);
		}
	}, [messagesData]);

	useEffect(() => {
		if (flattenedMessages.length === 0) {
			setLocalMessages([]);
			return;
		}

		setLocalMessages((prev) => {
			const serverMessageKeys = new Set(
				flattenedMessages.map(
					(m) => `${m.text}|${m.sender}|${m.difficulty}`,
				),
			);

			const optimisticMessages = prev.filter((m) => {
				if (!m.isOptimistic) return false;
				const key = `${m.text}|${m.sender}|${m.difficulty}`;
				return !serverMessageKeys.has(key);
			});

			return [...flattenedMessages, ...optimisticMessages];
		});
	}, [flattenedMessages, setLocalMessages]);

	useEffect(() => {
		setIsReadyToLoadMore(false);
		const timer = setTimeout(() => {
			setIsReadyToLoadMore(true);
		}, 2000);
		return () => clearTimeout(timer);
	}, []);

	return {
		messagesData,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		messagesLoading,
		initialLoad,
		isReadyToLoadMore,
	};
}
