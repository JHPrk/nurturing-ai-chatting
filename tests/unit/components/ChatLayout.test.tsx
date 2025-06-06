import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import ChatLayout from '@components/ChatLayout'

// fetch 모킹
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('ChatLayout 컴포넌트', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('ChatLayout이 렌더링되어야 한다', () => {
    render(<ChatLayout />)
    expect(screen.getByTestId('chat-layout')).toBeInTheDocument()
  })

  it('초기 상태에서 환영 메시지가 표시되어야 한다', () => {
    render(<ChatLayout />)
    expect(screen.getByText('안녕하세요!')).toBeInTheDocument()
    expect(screen.getByText('육아에 대해 궁금한 점이 있으시면 언제든 물어보세요 😊')).toBeInTheDocument()
  })

  it('초기 상태에서 프롬프트 템플릿이 표시되어야 한다', () => {
    render(<ChatLayout />)
    
    expect(screen.getByTestId('templates-grid')).toBeInTheDocument()
    expect(screen.getByText(/밤중 수유 팁이 궁금해요/)).toBeInTheDocument()
  })

  it('InputBar가 렌더링되어야 한다', () => {
    render(<ChatLayout />)
    
    const input = screen.getByPlaceholderText('메시지를 입력하세요...')
    const sendButton = screen.getByLabelText('메시지 전송')
    
    expect(input).toBeInTheDocument()
    expect(sendButton).toBeInTheDocument()
  })

  it('메시지 전송 시 API가 호출되어야 한다', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ text: '테스트 응답' }),
    })

    render(<ChatLayout />)
    
    const textarea = screen.getByPlaceholderText('메시지를 입력하세요...')
    const sendButton = screen.getByLabelText('메시지 전송')

    await userEvent.type(textarea, '테스트 메시지')
    await userEvent.click(sendButton)
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer anonymous'
        },
        body: JSON.stringify({
          history: [],
          message: '테스트 메시지'
        })
      })
    })
  })

  it('메시지 전송 후 응답이 표시되어야 한다', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ text: 'AI 응답' }),
    })

    render(<ChatLayout />)
    
    const textarea = screen.getByPlaceholderText('메시지를 입력하세요...')
    const sendButton = screen.getByLabelText('메시지 전송')

    await userEvent.type(textarea, '질문')
    await userEvent.click(sendButton)
    
    await waitFor(() => {
      expect(screen.getByText('질문')).toBeInTheDocument()
      expect(screen.getByText('AI 응답')).toBeInTheDocument()
    })
  })

  it('API 오류 시 에러 메시지가 표시되어야 한다', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    render(<ChatLayout />)
    
    const textarea = screen.getByPlaceholderText('메시지를 입력하세요...')
    const sendButton = screen.getByLabelText('메시지 전송')

    await userEvent.type(textarea, '테스트')
    await userEvent.click(sendButton)
    
    await waitFor(() => {
      expect(screen.getByText('죄송해요, 답변을 생성하는 데 문제가 발생했어요. 잠시 후 다시 시도해주세요. 😥')).toBeInTheDocument()
    })

    consoleSpy.mockRestore()
  })

  it('로딩 중에는 스피너가 표시되어야 한다', async () => {
    mockFetch.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    render(<ChatLayout />)
    
    const textarea = screen.getByPlaceholderText('메시지를 입력하세요...')
    const sendButton = screen.getByLabelText('메시지 전송')

    await userEvent.type(textarea, '테스트')
    await userEvent.click(sendButton)

    expect(screen.getByText('멘토가 생각 중이에요...')).toBeInTheDocument()
  })

  it('메시지가 있을 때는 템플릿이 숨겨져야 한다', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ text: '응답' }),
    })

    render(<ChatLayout />)
    
    expect(screen.getByTestId('templates-grid')).toBeInTheDocument()
    
    const textarea = screen.getByPlaceholderText('메시지를 입력하세요...')
    await userEvent.type(textarea, '테스트')
    await userEvent.click(screen.getByLabelText('메시지 전송'))

    await waitFor(() => {
      expect(screen.queryByTestId('templates-grid')).not.toBeInTheDocument()
    })
  })

  it('템플릿 선택 시 메시지가 전송되어야 한다', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ text: '응답' }),
    })

    render(<ChatLayout />)
    
    const templateButton = screen.getByTestId('template-button-0')
    await userEvent.click(templateButton)

    expect(mockFetch).toHaveBeenCalledWith('/api/chat', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer anonymous'
      },
      body: JSON.stringify({
        history: [],
        message: '밤중 수유 팁이 궁금해요 🍼'
      })
    })
  })

  it('레이아웃이 올바른 클래스를 가져야 한다', () => {
    render(<ChatLayout />)
    
    const mainContainer = screen.getByTestId('chat-layout')
    expect(mainContainer).toHaveClass('flex', 'flex-col', 'h-screen')
    expect(mainContainer).toHaveClass('bg-gray-50')
  })
}) 