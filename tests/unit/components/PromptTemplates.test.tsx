import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import '@testing-library/jest-dom'
import userEvent from "@testing-library/user-event";
import PromptTemplates from "@components/PromptTemplates";

describe("PromptTemplates 컴포넌트", () => {
  const mockOnSelectTemplate = vi.fn();

  beforeEach(() => {
    mockOnSelectTemplate.mockClear();
  });

  it("PromptTemplates가 렌더링되어야 한다", () => {
    render(<PromptTemplates onSelectTemplate={mockOnSelectTemplate} />);
    expect(screen.getByTestId("templates-grid")).toBeInTheDocument();
  });

  it("2x2 그리드 레이아웃이 적용되어야 한다", () => {
    render(<PromptTemplates onSelectTemplate={mockOnSelectTemplate} />);
    const grid = screen.getByTestId("templates-grid");
    expect(grid).toHaveClass("grid", "grid-cols-2", "gap-3");
  });

  it("4개의 템플릿 버튼이 모두 렌더링되어야 한다", () => {
    render(<PromptTemplates onSelectTemplate={mockOnSelectTemplate} />);
    
    expect(screen.getByText(/밤중 수유 팁이 궁금해요/)).toBeInTheDocument();
    expect(screen.getByText(/수면 훈련 어떻게 시작하나요/)).toBeInTheDocument();
    expect(screen.getByText(/이유식 시기와 방법 알려주세요/)).toBeInTheDocument();
    expect(screen.getByText(/신생아 목욕 방법을 알려주세요/)).toBeInTheDocument();
  });

  it("마우스 호버 시 회색 효과가 적용되어야 한다", async () => {
    render(<PromptTemplates onSelectTemplate={mockOnSelectTemplate} />);
    const firstButton = screen.getByTestId("template-button-0");
    
    await userEvent.hover(firstButton);
    expect(firstButton).toHaveClass("hover:bg-gray-100");
  });

  it("템플릿 선택 시 콜백이 호출되어야 한다", async () => {
    render(<PromptTemplates onSelectTemplate={mockOnSelectTemplate} />);
    const firstButton = screen.getByTestId("template-button-0");

    await userEvent.click(firstButton);
    expect(mockOnSelectTemplate).toHaveBeenCalledWith("밤중 수유 팁이 궁금해요 🍼");
  });

  it("비활성화 상태에서는 클릭이 불가능해야 한다", () => {
    render(<PromptTemplates onSelectTemplate={mockOnSelectTemplate} disabled={true} />);
    const buttons = screen.getAllByTestId(/template-button-/);

    buttons.forEach(button => {
      expect(button).toHaveClass("cursor-not-allowed", "opacity-50");
    });
  });

  // 기존 테스트들
  it("템플릿 버튼들이 렌더링되어야 한다", () => {
    render(<PromptTemplates onSelectTemplate={mockOnSelectTemplate} />);
    
    expect(screen.getByTestId("template-button-0")).toBeInTheDocument();
    expect(screen.getByTestId("template-button-1")).toBeInTheDocument();
    expect(screen.getByTestId("template-button-2")).toBeInTheDocument();
    expect(screen.getByTestId("template-button-3")).toBeInTheDocument();
  });

  it("템플릿 버튼 클릭 시 onSelectTemplate이 호출되어야 한다", async () => {
    const user = userEvent.setup();
    render(<PromptTemplates onSelectTemplate={mockOnSelectTemplate} />);
    
    const templateButton = screen.getByText(/밤중 수유 팁이 궁금해요/);
    await user.click(templateButton);
    
    expect(mockOnSelectTemplate).toHaveBeenCalledWith("밤중 수유 팁이 궁금해요 🍼");
  });

  it("disabled 상태일 때 버튼들이 비활성화되어야 한다", () => {
    render(<PromptTemplates onSelectTemplate={mockOnSelectTemplate} disabled={true} />);
    
    const firstButton = screen.getByTestId("template-button-0");
    expect(firstButton).toBeDisabled();
  });

  it("disabled 상태에서 클릭해도 onSelectTemplate이 호출되지 않아야 한다", async () => {
    const user = userEvent.setup();
    render(<PromptTemplates onSelectTemplate={mockOnSelectTemplate} disabled={true} />);
    
    const templateButton = screen.getByText(/밤중 수유 팁이 궁금해요/);
    await user.click(templateButton);
    
    expect(mockOnSelectTemplate).not.toHaveBeenCalled();
  });
}); 