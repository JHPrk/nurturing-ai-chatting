import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import InputBar from '@components/InputBar'

describe('InputBar 컴포넌트', () => {
  const mockOnSend = vi.fn()

  beforeEach(() => {
    mockOnSend.mockClear()
  })

  it('InputBar가 렌더링되어야 한다', () => {
    render(<InputBar onSend={mockOnSend} disabled={false} />)
    expect(screen.getByPlaceholderText('메시지를 입력하세요...')).toBeInTheDocument()
  })

  it('둥근 모서리와 회색 배경이 적용되어야 한다', () => {
    render(<InputBar onSend={mockOnSend} disabled={false} />)
    const container = screen.getByTestId('input-container')
    expect(container).toHaveClass('bg-gray-200', 'rounded-2xl')
  })

  it('클립 아이콘 버튼이 렌더링되어야 한다', () => {
    render(<InputBar onSend={mockOnSend} disabled={false} />)
    const clipButton = screen.getByLabelText('파일 첨부')
    expect(clipButton).toBeInTheDocument()
  })

  it('포커스 시 강조 효과가 적용되어야 한다', async () => {
    render(<InputBar onSend={mockOnSend} disabled={false} />)
    const textarea = screen.getByPlaceholderText('메시지를 입력하세요...')
    const container = screen.getByTestId('input-container')
    
    await userEvent.click(textarea)
    expect(container).toHaveClass('ring-2', 'ring-blue-500')
  })

  it('메시지 입력 시 전송 버튼이 활성화되어야 한다', async () => {
    render(<InputBar onSend={mockOnSend} disabled={false} />)
    const textarea = screen.getByPlaceholderText('메시지를 입력하세요...')
    const sendButton = screen.getByLabelText('메시지 전송')

    expect(sendButton).toHaveClass('bg-gray-200')
    
    await userEvent.type(textarea, '테스트 메시지')
    expect(sendButton).toHaveClass('bg-blue-500')
  })

  it('전송 버튼 클릭 시 메시지가 전송되어야 한다', async () => {
    render(<InputBar onSend={mockOnSend} disabled={false} />)
    const textarea = screen.getByPlaceholderText('메시지를 입력하세요...')
    const sendButton = screen.getByLabelText('메시지 전송')

    await userEvent.type(textarea, '안녕하세요')
    await userEvent.click(sendButton)

    expect(mockOnSend).toHaveBeenCalledWith('안녕하세요')
    expect((textarea as HTMLTextAreaElement).value).toBe('')
  })

  it('Enter 키 입력 시 메시지가 전송되어야 한다', async () => {
    render(<InputBar onSend={mockOnSend} disabled={false} />)
    const textarea = screen.getByPlaceholderText('메시지를 입력하세요...')

    await userEvent.type(textarea, 'Enter 테스트')
    await userEvent.keyboard('{Enter}')

    expect(mockOnSend).toHaveBeenCalledWith('Enter 테스트')
  })

  it('Shift+Enter 입력 시 줄바꿈이 되어야 한다', async () => {
    render(<InputBar onSend={mockOnSend} disabled={false} />)
    const textarea = screen.getByPlaceholderText('메시지를 입력하세요...')

    await userEvent.type(textarea, '첫 번째 줄')
    await userEvent.keyboard('{Shift>}{Enter}{/Shift}')
    await userEvent.type(textarea, '두 번째 줄')

    expect((textarea as HTMLTextAreaElement).value).toBe('첫 번째 줄\n두 번째 줄')
    expect(mockOnSend).not.toHaveBeenCalled()
  })

  it('비활성화 상태에서는 입력과 전송이 불가능해야 한다', () => {
    render(<InputBar onSend={mockOnSend} disabled={true} />)
    const textarea = screen.getByPlaceholderText('메시지를 입력하세요...')
    const sendButton = screen.getByLabelText('메시지 전송')

    expect(textarea).toBeDisabled()
    expect(sendButton).toBeDisabled()
  })

  it('빈 메시지는 전송되지 않아야 한다', async () => {
    render(<InputBar onSend={mockOnSend} disabled={false} />)
    const textarea = screen.getByPlaceholderText('메시지를 입력하세요...')
    const sendButton = screen.getByLabelText('메시지 전송')

    await userEvent.type(textarea, '   ')
    await userEvent.click(sendButton)

    expect(mockOnSend).not.toHaveBeenCalled()
  })

  it('메시지 전송 후 입력창이 초기화되어야 한다', async () => {
    render(<InputBar onSend={mockOnSend} disabled={false} />)
    const textarea = screen.getByPlaceholderText('메시지를 입력하세요...')
    const sendButton = screen.getByLabelText('메시지 전송')

    await userEvent.type(textarea, '테스트')
    await userEvent.click(sendButton)

    expect((textarea as HTMLTextAreaElement).value).toBe('')
  })

  it('전송 버튼이 렌더링되어야 한다', () => {
    render(<InputBar onSend={mockOnSend} disabled={false} />)
    const sendButton = screen.getByLabelText('메시지 전송')
    expect(sendButton).toBeInTheDocument()
  })

  it('비활성화 상태에서 전송 버튼이 비활성화되어야 한다', () => {
    render(<InputBar onSend={mockOnSend} disabled={true} />)
    const sendButton = screen.getByLabelText('메시지 전송')
    expect(sendButton).toBeDisabled()
  })

  it('빈 문자열일 때 전송 버튼이 비활성화되어야 한다', () => {
    render(<InputBar onSend={mockOnSend} disabled={false} />)
    const sendButton = screen.getByLabelText('메시지 전송')
    expect(sendButton).toBeDisabled()
  })

  it('텍스트 입력 시 전송 버튼이 활성화되어야 한다', async () => {
    const user = userEvent.setup()
    render(<InputBar onSend={mockOnSend} disabled={false} />)
    
    const textarea = screen.getByPlaceholderText('메시지를 입력하세요...')
    const sendButton = screen.getByLabelText('메시지 전송')
    
    await user.type(textarea, '테스트')
    expect(sendButton).not.toBeDisabled()
  })

  it('Enter 키로 메시지를 전송할 수 있어야 한다', async () => {
    const user = userEvent.setup()
    render(<InputBar onSend={mockOnSend} disabled={false} />)
    
    const textarea = screen.getByPlaceholderText('메시지를 입력하세요...')
    
    await user.type(textarea, 'Enter로 전송')
    await user.keyboard('{Enter}')
    
    expect(mockOnSend).toHaveBeenCalledWith('Enter로 전송')
  })

  it('메시지 전송 후 입력창이 비워져야 한다', async () => {
    const user = userEvent.setup()
    render(<InputBar onSend={mockOnSend} disabled={false} />)
    
    const textarea = screen.getByPlaceholderText('메시지를 입력하세요...')
    const sendButton = screen.getByLabelText('메시지 전송')
    
    await user.type(textarea, '전송할 메시지')
    await user.click(sendButton)
    
    expect((textarea as HTMLTextAreaElement).value).toBe('')
  })

  it('포커스 시 컨테이너에 강조 효과가 적용되어야 한다', async () => {
    const user = userEvent.setup()
    render(<InputBar onSend={mockOnSend} disabled={false} />)
    
    const input = screen.getByPlaceholderText('메시지를 입력하세요...')
    const container = screen.getByTestId('input-container')
    await user.click(input)
    
    expect(container).toHaveClass('ring-2', 'ring-blue-500')
  })
}) 