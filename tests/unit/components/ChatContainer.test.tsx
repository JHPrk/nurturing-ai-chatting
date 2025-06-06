import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import ChatContainer from '@components/ChatContainer'

const mockMessages = [
  { role: 'user' as const, content: '안녕하세요' },
  { role: 'assistant' as const, content: '안녕하세요! 😊' }
]

describe('ChatContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('빈 메시지 배열일 때 메시지가 표시되지 않아야 한다', () => {
    render(<ChatContainer messages={[]} isLoading={false} />)
    
    const container = screen.getByTestId('chat-container')
    expect(container).toBeInTheDocument()
    
    // 메시지가 없어야 함
    expect(screen.queryByTestId('chat-bubble')).not.toBeInTheDocument()
  })

  it('메시지 배열이 주어지면 모든 메시지가 표시되어야 한다', () => {
    render(<ChatContainer messages={mockMessages} isLoading={false} />)
    
    // 두 개의 메시지가 표시되어야 함
    expect(screen.getByText('안녕하세요')).toBeInTheDocument()
    expect(screen.getByText('안녕하세요! 😊')).toBeInTheDocument()
  })

  it('로딩 상태일 때 로딩 스피너가 표시되어야 한다', () => {
    render(<ChatContainer messages={mockMessages} isLoading={true} />)
    
    // 로딩 메시지 확인
    expect(screen.getByText('멘토가 생각 중이에요...')).toBeInTheDocument()
    
    // 스피너 애니메이션 확인
    const spinner = screen.getByTestId('spinner')
    expect(spinner).toBeInTheDocument()
  })

  it('로딩 상태가 아닐 때 로딩 스피너가 표시되지 않아야 한다', () => {
    render(<ChatContainer messages={mockMessages} isLoading={false} />)
    
    expect(screen.queryByText('멘토가 생각 중이에요...')).not.toBeInTheDocument()
  })

  it('사용자와 AI 메시지가 올바른 스타일로 구분되어야 한다', () => {
    render(<ChatContainer messages={mockMessages} isLoading={false} />)
    
    // 사용자 메시지 버블 확인
    const userBubbles = screen.getAllByTestId('chat-bubble').filter(bubble => 
      bubble.classList.contains('justify-end')
    )
    expect(userBubbles.length).toBeGreaterThan(0)
    
    // AI 메시지 버블 확인  
    const aiBubbles = screen.getAllByTestId('chat-bubble').filter(bubble => 
      bubble.classList.contains('justify-start')
    )
    expect(aiBubbles.length).toBeGreaterThan(0)
  })

  it('scrollIntoView가 호출되어야 한다', () => {
    const scrollIntoViewMock = vi.fn()
    Element.prototype.scrollIntoView = scrollIntoViewMock
    
    render(<ChatContainer messages={mockMessages} isLoading={false} />)
    
    // scrollIntoView가 한 번 호출되어야 함
    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' })
  })

  it('메시지나 로딩 상태 변경 시 자동 스크롤이 실행되어야 한다', () => {
    const scrollIntoViewMock = vi.fn()
    Element.prototype.scrollIntoView = scrollIntoViewMock
    
    const { rerender } = render(<ChatContainer messages={[]} isLoading={false} />)
    
    // 처음 렌더링 후
    expect(scrollIntoViewMock).toHaveBeenCalledTimes(1)
    
    // 메시지 추가 후
    rerender(<ChatContainer messages={mockMessages} isLoading={false} />)
    expect(scrollIntoViewMock).toHaveBeenCalledTimes(2)
    
    // 로딩 상태 변경 후
    rerender(<ChatContainer messages={mockMessages} isLoading={true} />)
    expect(scrollIntoViewMock).toHaveBeenCalledTimes(3)
  })
}) 