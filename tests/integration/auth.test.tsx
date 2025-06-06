import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthGate } from "@components/AuthGate";
import { ReactNode } from "react";

// fetch 모킹
const mockFetch = vi.fn();
global.fetch = mockFetch;

// localStorage 모킹
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("AuthGate - 통합 테스트", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const TestComponent = () => <div data-testid="protected-content">보호된 콘텐츠</div>;

  describe("인증 상태 확인", () => {
    it("저장된 토큰이 없으면 로그인 폼을 표시해야 한다", async () => {
      // Arrange
      localStorageMock.getItem.mockReturnValue(null);

      // Act
      render(
        <AuthGate>
          <TestComponent />
        </AuthGate>
      );

      // Assert
      await waitFor(() => {
        expect(screen.getByPlaceholderText("접근 코드")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "확인" })).toBeInTheDocument();
        expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
      });
    });

    it("유효한 토큰이 있으면 보호된 콘텐츠를 바로 표시해야 한다", async () => {
      // Arrange
      localStorageMock.getItem.mockReturnValue("valid.jwt.token");
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          authenticated: true,
          expiresAt: Date.now() + 600000, // 10분 후
          timeRemaining: 600000
        })
      });

      // Act
      render(
        <AuthGate>
          <TestComponent />
        </AuthGate>
      );

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId("protected-content")).toBeInTheDocument();
        expect(screen.queryByPlaceholderText("접근 코드")).not.toBeInTheDocument();
      });

      expect(mockFetch).toHaveBeenCalledWith("/api/auth", {
        method: "GET",
        headers: {
          "Authorization": "Bearer valid.jwt.token"
        }
      });
    });

    it("만료된 토큰이 있으면 로그인 폼을 표시해야 한다", async () => {
      // Arrange
      localStorageMock.getItem.mockReturnValue("expired.jwt.token");
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "유효하지 않은 토큰입니다" })
      });

      // Act
      render(
        <AuthGate>
          <TestComponent />
        </AuthGate>
      );

      // Assert
      await waitFor(() => {
        expect(screen.getByPlaceholderText("접근 코드")).toBeInTheDocument();
        expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
      });

      expect(localStorageMock.removeItem).toHaveBeenCalledWith("auth_token");
    });
  });

  describe("로그인 프로세스", () => {
    it("올바른 접근 코드로 로그인 성공 시 보호된 콘텐츠를 표시해야 한다", async () => {
      // Arrange
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          token: "new.jwt.token",
          expiresIn: 600000
        })
      });

      // Act
      render(
        <AuthGate>
          <TestComponent />
        </AuthGate>
      );

      // 로그인 폼이 렌더링될 때까지 대기
      await waitFor(() => {
        expect(screen.getByPlaceholderText("접근 코드")).toBeInTheDocument();
      });

      // 접근 코드 입력
      const input = screen.getByPlaceholderText("접근 코드");
      await user.type(input, "Dev@1234");

      // 로그인 버튼 클릭
      const submitButton = screen.getByRole("button", { name: "확인" });
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId("protected-content")).toBeInTheDocument();
        expect(screen.queryByPlaceholderText("접근 코드")).not.toBeInTheDocument();
      });

      expect(mockFetch).toHaveBeenCalledWith("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ accessCode: "Dev@1234" })
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith("auth_token", "new.jwt.token");
    });

    it("잘못된 접근 코드로 로그인 실패 시 에러 메시지를 표시해야 한다", async () => {
      // Arrange
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "올바르지 않은 접근 코드입니다" })
      });

      // Act
      render(
        <AuthGate>
          <TestComponent />
        </AuthGate>
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText("접근 코드")).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText("접근 코드");
      await user.type(input, "WrongCode");

      const submitButton = screen.getByRole("button", { name: "확인" });
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText("올바르지 않은 접근 코드입니다")).toBeInTheDocument();
        expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
      });

      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });

    it("네트워크 오류 시 적절한 에러 메시지를 표시해야 한다", async () => {
      // Arrange
      const user = userEvent.setup();
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      // Act
      render(
        <AuthGate>
          <TestComponent />
        </AuthGate>
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText("접근 코드")).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText("접근 코드");
      await user.type(input, "Dev@1234");

      const submitButton = screen.getByRole("button", { name: "확인" });
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.")).toBeInTheDocument();
      });
    });

    it("로딩 중에는 버튼이 비활성화되어야 한다", async () => {
      // Arrange
      const user = userEvent.setup();
      let resolvePromise: (value: any) => void;
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      mockFetch.mockReturnValue(pendingPromise);

      // Act
      render(
        <AuthGate>
          <TestComponent />
        </AuthGate>
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText("접근 코드")).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText("접근 코드");
      await user.type(input, "Dev@1234");

      const submitButton = screen.getByRole("button", { name: "확인" });
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByRole("button", { name: "인증 중..." })).toBeDisabled();
      });

      // Clean up
      resolvePromise!({
        ok: true,
        json: async () => ({ success: true, token: "token", expiresIn: 600000 })
      });
    });

    it("빈 접근 코드로 제출 시 버튼이 비활성화되어야 한다", () => {
      // Act
      render(
        <AuthGate>
          <TestComponent />
        </AuthGate>
      );

      // Assert
      expect(screen.getByRole("button", { name: "확인" })).toBeDisabled();
    });
  });

  describe("UI 렌더링", () => {
    it("로그인 폼이 올바른 스타일로 렌더링되어야 한다", async () => {
      // Act
      render(
        <AuthGate>
          <TestComponent />
        </AuthGate>
      );

      // Assert
      await waitFor(() => {
        const container = screen.getByText("🔐 접근 제한 구역").closest("div");
        expect(container).toHaveClass("min-h-screen", "bg-gradient-to-br");
        
        const card = screen.getByPlaceholderText("접근 코드").closest("div")?.parentElement?.parentElement;
        expect(card).toHaveClass("bg-white", "rounded-2xl", "shadow-xl");
      });
    });

    it("세션 만료 시간이 표시되어야 한다", async () => {
      // Arrange
      localStorageMock.getItem.mockReturnValue("valid.jwt.token");
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          authenticated: true,
          expiresAt: Date.now() + 300000, // 5분 후
          timeRemaining: 300000
        })
      });

      // Act
      render(
        <AuthGate>
          <TestComponent />
        </AuthGate>
      );

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId("protected-content")).toBeInTheDocument();
        expect(screen.getByText(/세션 만료:/)).toBeInTheDocument();
      });
    });
  });
}); 