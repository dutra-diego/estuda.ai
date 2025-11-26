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
			const serverIds = new Set();
			for (let i = 0; i < flattenedMessages.length; i++) {
				serverIds.add(flattenedMessages[i].id);
			}

			const optimisticMessages = [];
			for (let i = 0; i < prev.length; i++) {
				const m = prev[i];
				if (!m.isOptimistic) continue;

				let found = false;
				for (let j = 0; j < flattenedMessages.length; j++) {
					const sm = flattenedMessages[j];
					if (
						sm.text === m.text &&
						sm.sender === m.sender &&
						sm.difficulty === m.difficulty
					) {
						found = true;
						break;
					}
				}

				if (!found) optimisticMessages.push(m);
			}

			return flattenedMessages.concat(optimisticMessages);
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
