'use client'

import { useState, useEffect, useRef } from 'react'
import { track } from '@vercel/analytics'
import ChatContainer from './ChatContainer'
import InputBar from './InputBar'
import PromptTemplates from './PromptTemplates'
import type { Message } from '@lib/types'
import { UI_CONSTANTS, ERROR_MESSAGES } from '@lib/constants'
import { convertMarkdownToHtml } from '@lib/markdownUtils'
import { logger } from '@lib/logger'

export default function ChatLayout() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showTemplates, setShowTemplates] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  // 자동 스크롤
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return

    const userMessage: Message = { role: 'user', content: message }
    
    // 이전 히스토리를 포함하여 메시지 목록 업데이트
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setShowTemplates(false)
    setIsLoading(true)

    // Analytics 이벤트 추적
    track('chat_message_sent', {
      message_length: message.length,
      is_first_message: messages.length === 0,
      conversation_turn: Math.floor((messages.length + 1) / 2) + 1
    })

    try {
      // 세션 토큰 생성 (간단한 인증용)
      const sessionToken = localStorage.getItem('auth_session') || 'anonymous';
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ 
          history: messages, // userMessage를 제외한 이전 히스토리 전송
          message 
        }),
      })

      if (!response.ok) {
        throw new Error('API 호출에 실패했습니다.')
      }

      const { text } = await response.json()
      const convertedText = convertMarkdownToHtml(text)
      const assistantMessage: Message = { role: 'assistant', content: convertedText }
      setMessages(prev => [...prev, assistantMessage])

      // 성공적인 응답 이벤트 추적
      track('chat_response_received', {
        response_length: text.length,
        conversation_turn: Math.floor((messages.length + 2) / 2) + 1
      })

    } catch (error) {
      logger.error('Chat API 호출 실패:', error)
      const errorMessage: Message = {
        role: 'assistant',
        content: ERROR_MESSAGES.GENERIC_ERROR
      }
      setMessages(prev => [...prev, errorMessage])

      // 에러 이벤트 추적
      track('chat_error', {
        error_type: 'api_call_failed',
        message_length: message.length
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleSelectTemplate = (template: string) => {
    // 템플릿 선택 이벤트 추적
    track('template_selected', {
      template: template.substring(0, 50) // 처음 50자만 추적
    })
    handleSendMessage(template)
  }

  return (
    <main className="flex flex-col h-screen bg-gray-50" data-testid="chat-layout">
      {/* 채팅 영역 */}
      <div className="flex-1 overflow-y-auto">
        {messages.length > 0 ? (
          <ChatContainer messages={messages} isLoading={isLoading} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="max-w-4xl mx-auto w-full">
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">
                  {UI_CONSTANTS.WELCOME_TITLE}
                </h1>
                <p className="text-lg text-gray-600">
                  {UI_CONSTANTS.WELCOME_SUBTITLE}
                </p>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      
      {/* 템플릿 버튼들 (메시지가 없을 때만 표시) */}
      {showTemplates && messages.length === 0 && (
        <PromptTemplates 
          onSelectTemplate={handleSelectTemplate} 
          disabled={isLoading}
        />
      )}
      
      {/* 입력창 */}
      <InputBar onSend={handleSendMessage} disabled={isLoading} />
    </main>
  )
} 