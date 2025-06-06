import { describe, it, expect } from "vitest";
import { convertMarkdownToHtml, createSafeHtmlProps } from "@lib/markdownUtils";

describe("markdownUtils", () => {
  describe("convertMarkdownToHtml", () => {
    it("**텍스트**를 <b>태그로 변환한다", () => {
      const input = "**강조된 텍스트**입니다.";
      const expected = "<b>강조된 텍스트</b>입니다.";
      
      expect(convertMarkdownToHtml(input)).toBe(expected);
    });

    it("여러 개의 **강조** 텍스트를 모두 변환한다", () => {
      const input = "**첫 번째** 강조와 **두 번째** 강조";
      const expected = "<b>첫 번째</b> 강조와 <b>두 번째</b> 강조";
      
      expect(convertMarkdownToHtml(input)).toBe(expected);
    });

    it("* 리스트를 - 리스트로 변환한다", () => {
      const input = "* 첫 번째 항목\n* 두 번째 항목";
      const expected = "- 첫 번째 항목\n- 두 번째 항목";
      
      expect(convertMarkdownToHtml(input)).toBe(expected);
    });

    it("**강조**와 * 리스트를 함께 변환한다", () => {
      const input = "**중요한 팁들:**\n* 첫 번째 팁\n* 두 번째 팁";
      const expected = "<b>중요한 팁들:</b>\n- 첫 번째 팁\n- 두 번째 팁";
      
      expect(convertMarkdownToHtml(input)).toBe(expected);
    });

    it("빈 문자열이나 null을 안전하게 처리한다", () => {
      expect(convertMarkdownToHtml("")).toBe("");
      expect(convertMarkdownToHtml(null as any)).toBe(null);
      expect(convertMarkdownToHtml(undefined as any)).toBe(undefined);
    });

    it("마크다운이 없는 일반 텍스트는 그대로 반환한다", () => {
      const input = "일반 텍스트입니다.";
      expect(convertMarkdownToHtml(input)).toBe(input);
    });
  });

  describe("createSafeHtmlProps", () => {
    it("dangerouslySetInnerHTML 프로퍼티를 올바르게 생성한다", () => {
      const html = "<b>테스트</b>";
      const props = createSafeHtmlProps(html);
      
      expect(props).toEqual({
        dangerouslySetInnerHTML: { __html: html }
      });
    });
  });
}); 