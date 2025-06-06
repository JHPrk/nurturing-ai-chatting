interface ChatBubbleProps {
  role: "user" | "assistant" | "system";
  content: string;
}

export default function ChatBubble({ role, content }: ChatBubbleProps) {
  const isUser = role === "user";
  
  // AI 메시지는 HTML 태그가 포함될 수 있으므로 dangerouslySetInnerHTML 사용
  const shouldRenderHtml = role === "assistant" && content.includes("<");

  return (
    <div
      data-testid="chat-bubble"
      className={`flex mb-2 ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        data-testid="message-content"
        className={`
          max-w-[75%] p-3 rounded-lg text-sm leading-relaxed whitespace-pre-wrap
          ${
            isUser
              ? "bg-blue-50 text-teal-800" // 사용자 메시지: 파란색 배경 (#E0F7FA와 유사), 짙은 텍스트 (#00796B와 유사)
              : "bg-pink-50 text-pink-900" // AI 메시지: 핑크색 배경 (#FCE4EC와 유사), 짙은 텍스트 (#C2185B와 유사)
          }
        `}
      >
        {shouldRenderHtml ? (
          <span dangerouslySetInnerHTML={{ __html: content }} />
        ) : (
          content
        )}
      </div>
    </div>
  );
} 