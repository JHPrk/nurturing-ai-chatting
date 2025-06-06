import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthGate } from "@components/AuthGate";

// AuthManager 모킹
const mockAuthManager = {
  isAuthenticated: vi.fn(),
  authenticate: vi.fn(),
  clearSession: vi.fn(),
  getTimeUntilExpiry: vi.fn(),
};

vi.mock("@lib/auth", () => ({
  AuthManager: vi.fn().mockImplementation(() => mockAuthManager),
}));

describe("AuthGate", () => {
  const testChildren = <div>Protected Content</div>;
  
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthManager.getTimeUntilExpiry.mockReturnValue(300000); // 5분 남음
  });

  describe("인증되지 않은 상태", () => {
    beforeEach(() => {
      mockAuthManager.isAuthenticated.mockReturnValue(false);
    });

    it("접근 코드 입력 폼을 표시한다", () => {
      render(<AuthGate>{testChildren}</AuthGate>);

      expect(screen.getByText("접근 코드를 입력하세요")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("접근 코드")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "확인" })).toBeInTheDocument();
      expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    });

    it("올바른 코드 입력 시 인증이 성공하고 자식 컴포넌트를 표시한다", async () => {
      mockAuthManager.authenticate.mockReturnValue(true);
      
      render(<AuthGate>{testChildren}</AuthGate>);

      const input = screen.getByPlaceholderText("접근 코드");
      const submitBtn = screen.getByRole("button", { name: "확인" });

      await userEvent.type(input, "Test@123");
      await userEvent.click(submitBtn);

      expect(mockAuthManager.authenticate).toHaveBeenCalledWith("Test@123");
      expect(screen.getByText("Protected Content")).toBeInTheDocument();
      expect(screen.queryByPlaceholderText("접근 코드")).not.toBeInTheDocument();
    });

    it("잘못된 코드 입력 시 에러 메시지를 표시한다", async () => {
      mockAuthManager.authenticate.mockReturnValue(false);
      
      render(<AuthGate>{testChildren}</AuthGate>);

      const input = screen.getByPlaceholderText("접근 코드");
      const submitBtn = screen.getByRole("button", { name: "확인" });

      await userEvent.type(input, "wrong");
      await userEvent.click(submitBtn);

      expect(screen.getByText("올바르지 않은 접근 코드입니다")).toBeInTheDocument();
      expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    });

    it("빈 코드 제출 시 에러 메시지를 표시한다", async () => {
      render(<AuthGate>{testChildren}</AuthGate>);

      const submitBtn = screen.getByRole("button", { name: "확인" });
      await userEvent.click(submitBtn);

      expect(screen.getByText("접근 코드를 입력해주세요")).toBeInTheDocument();
    });

    it("Enter 키로 폼을 제출할 수 있다", async () => {
      mockAuthManager.authenticate.mockReturnValue(true);
      
      render(<AuthGate>{testChildren}</AuthGate>);

      const input = screen.getByPlaceholderText("접근 코드");
      await userEvent.type(input, "Test@123");
      await userEvent.keyboard("{Enter}");

      expect(mockAuthManager.authenticate).toHaveBeenCalledWith("Test@123");
    });
  });

  describe("인증된 상태", () => {
    beforeEach(() => {
      mockAuthManager.isAuthenticated.mockReturnValue(true);
    });

    it("자식 컴포넌트를 바로 표시한다", () => {
      render(<AuthGate>{testChildren}</AuthGate>);

      expect(screen.getByText("Protected Content")).toBeInTheDocument();
      expect(screen.queryByPlaceholderText("접근 코드")).not.toBeInTheDocument();
    });

    it("세션 만료 시간을 표시한다", () => {
      mockAuthManager.getTimeUntilExpiry.mockReturnValue(300000); // 5분
      
      render(<AuthGate>{testChildren}</AuthGate>);

      expect(screen.getByText(/세션 만료:/)).toBeInTheDocument();
      expect(screen.getByText(/5분/)).toBeInTheDocument();
    });

    it("로그아웃 버튼을 클릭하면 세션이 종료된다", async () => {
      render(<AuthGate>{testChildren}</AuthGate>);

      const logoutBtn = screen.getByRole("button", { name: "로그아웃" });
      await userEvent.click(logoutBtn);

      expect(mockAuthManager.clearSession).toHaveBeenCalled();
    });
  });
}); 