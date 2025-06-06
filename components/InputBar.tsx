"use client";

import { useState, useRef } from "react";
import { UI_CONSTANTS } from "@lib/constants";

interface InputBarProps {
  onSend: (message: string) => void;
  disabled: boolean;
}

export default function InputBar({ onSend, disabled }: InputBarProps) {
  const [input, setInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const message = input.trim();
    if (message && !disabled) {
      onSend(message);
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = input.trim().length > 0 && !disabled;

  return (
    <div className="bg-white p-4">
      <div className="max-w-4xl mx-auto">
        <div
          data-testid="input-container"
          className={`flex items-center h-[98px] bg-gray-200 rounded-2xl transition-all duration-200 ${
            isFocused ? "ring-2 ring-blue-500" : ""
          }`}
        >
          {/* 클립 아이콘 버튼 */}
          <button
            aria-label="파일 첨부"
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            disabled={disabled}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          </button>

          {/* 텍스트 입력창 */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={UI_CONSTANTS.INPUT_PLACEHOLDER}
            className="flex-1 bg-transparent border-none outline-none resize-none px-3 py-1 text-gray-900 placeholder-gray-500"
            disabled={disabled}
            rows={1}
          />

          {/* 전송 버튼 */}
          <button
            onClick={handleSend}
            disabled={!canSend}
            className={`p-2 mr-1 rounded-full transition-all duration-200 ${
              canSend
                ? "bg-blue-500 text-white hover:bg-blue-600 active:scale-95"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
            aria-label="메시지 전송"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
} 