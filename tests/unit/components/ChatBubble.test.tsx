import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ChatBubble from '@components/ChatBubble'

describe('ChatBubble', () => {
  it('사용자 메시지는 우측 정렬과 파란색 배경을 가져야 한다', () => {
    render(<ChatBubble role="user" content="안녕하세요" />)
    
    const bubble = screen.getByTestId('chat-bubble')
    expect(bubble).toBeInTheDocument()
    expect(bubble).toHaveClass('justify-end') // 우측 정렬
    
    const messageContent = screen.getByTestId('message-content')
    expect(messageContent).toHaveClass('bg-blue-50') // 파란색 배경 (#E0F7FA와 유사)
    expect(messageContent).toHaveClass('text-teal-800') // 짙은 텍스트 (#00796B와 유사)
    expect(messageContent.textContent).toBe('안녕하세요')
  })

  it('AI 메시지는 좌측 정렬과 핑크색 배경을 가져야 한다', () => {
    render(<ChatBubble role="assistant" content="안녕! 어떻게 도와드릴까요? 😊" />)
    
    const bubble = screen.getByTestId('chat-bubble')
    expect(bubble).toBeInTheDocument()
    expect(bubble).toHaveClass('justify-start') // 좌측 정렬
    
    const messageContent = screen.getByTestId('message-content')
    expect(messageContent).toHaveClass('bg-pink-50') // 핑크색 배경 (#FCE4EC와 유사)
    expect(messageContent).toHaveClass('text-pink-900') // 짙은 텍스트 (#C2185B와 유사)
    expect(messageContent.textContent).toBe('안녕! 어떻게 도와드릴까요? 😊')
  })

  it('메시지 버블은 올바른 스타일을 가져야 한다', () => {
    render(<ChatBubble role="user" content="테스트 메시지" />)
    
    const messageContent = screen.getByTestId('message-content')
    expect(messageContent).toHaveClass('rounded-lg') // 16px 모서리 반경
    expect(messageContent).toHaveClass('p-3') // 패딩
    expect(messageContent).toHaveClass('text-sm') // 14px 폰트 크기
    expect(messageContent).toHaveClass('max-w-[75%]') // 최대 너비 제한
  })

  it('긴 메시지도 올바르게 표시되어야 한다', () => {
    const longMessage = "이것은 매우 긴 메시지입니다. ".repeat(10)
    render(<ChatBubble role="assistant" content={longMessage} />)
    
    const messageContent = screen.getByTestId('message-content')
    expect(messageContent.textContent).toBe(longMessage)
    expect(messageContent).toHaveClass('whitespace-pre-wrap') // 줄바꿈 유지
  })

  it('이모티콘이 포함된 메시지를 올바르게 렌더링해야 한다', () => {
    render(<ChatBubble role="assistant" content="안녕하세요! 😊❤️👶" />)
    
    const messageContent = screen.getByTestId('message-content')
    expect(messageContent.textContent).toContain('😊')
    expect(messageContent.textContent).toContain('❤️')
    expect(messageContent.textContent).toContain('👶')
  })
}) 