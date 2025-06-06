"use client";

import { useEffect, useRef } from 'react'
import ChatBubble from './ChatBubble'
import Spinner from './Spinner'
import type { Message } from '@lib/types'

interface ChatContainerProps {
  messages: Message[]
  isLoading: boolean
}

export default function ChatContainer({ messages, isLoading }: ChatContainerProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  // 자동 스크롤
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  return (
    <div 
      className="flex flex-col h-full overflow-y-auto p-4"
      data-testid="chat-container"
    >
      {/* 메시지들을 InputBar와 동일한 최대 너비로 제한 */}
      <div className="max-w-4xl mx-auto w-full space-y-4">
        {/* 메시지 목록 */}
        {messages.map((message, index) => (
          <ChatBubble
            key={index}
            role={message.role}
            content={message.content}
          />
        ))}

        {/* 로딩 상태 */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-pink-50 rounded-lg p-3 max-w-xs">
              <Spinner />
            </div>
          </div>
        )}

        {/* 자동 스크롤을 위한 참조 */}
        <div ref={bottomRef} />
      </div>
    </div>
  )
} 