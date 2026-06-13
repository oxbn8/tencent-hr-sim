/** 将 AI 回复渲染为更易读的纯文本（去掉 ### 等原始 Markdown） */
export function formatChatContent(text: string): string {
  return text
    .split("\n")
    .map((line) => {
      const t = line.trim();
      if (/^#{1,6}\s+/.test(t)) {
        return `【${t.replace(/^#{1,6}\s+/, "")}】`;
      }
      if (t === "---" || t === "***") return "";
      return line.replace(/\*\*(.+?)\*\*/g, "$1").replace(/`([^`]+)`/g, "$1");
    })
    .filter((line, i, arr) => !(line === "" && arr[i - 1] === ""))
    .join("\n")
    .trim();
}
