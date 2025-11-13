import ReactMarkdown from "react-markdown";

interface ReportProps {
	content: string;
}

export function Report({ content }: ReportProps) {
	return <ReactMarkdown>{content}</ReactMarkdown>;
}
