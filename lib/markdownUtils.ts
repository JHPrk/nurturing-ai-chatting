/**
 * 간단한 마크다운을 HTML로 변환하는 유틸리티 함수
 */
export function convertMarkdownToHtml(text: string): string {
  if (!text) return text;

  let result = text;

  // **텍스트** → <b>텍스트</b> (굵게)
  result = result.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');

  // * 리스트 아이템 → - 리스트 아이템
  result = result.replace(/^\* /gm, '- ');

  return result;
}

/**
 * HTML 태그가 포함된 텍스트를 안전하게 렌더링하기 위한 props 생성
 */
export function createSafeHtmlProps(htmlContent: string) {
  return {
    dangerouslySetInnerHTML: { __html: htmlContent }
  };
} 