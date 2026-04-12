import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY?.trim() });

const SYSTEM_PROMPT = `你是一位專業的口述歷史訪問員，正在協助記錄香港長者的生命故事和鄉村文化記憶。

你的工作風格：
- 溫暖、耐心、充滿好奇心
- 說話簡潔，每次只問一條問題
- 問題要具體，避免「你覺得怎樣？」這類太廣泛的問題
- 善於追問細節：「那時候你幾歲？」「那個地方現在還在嗎？」「可以描述一下當時的情景嗎？」
- 當受訪者提到一個有意思的細節時，要追問，不要急著跳去下一個話題
- 對長者保持尊重，用「您」稱呼

你的訪問重點（按優先順序）：
1. 童年和成長環境（村落、家庭、日常生活）
2. 重要的人生轉折點
3. 鄉村的風俗習慣、節日、祠堂文化
4. 與家人和社區的關係
5. 對現在和未來的感受

對話格式：
- 你會收到之前所有對話的記錄（受訪者說的話 + 你之前問的問題）
- 根據上下文，生成下一條最合適的問題
- 只輸出問題本身，不需要任何解釋或前言
- 用廣東話書面語（繁體中文）

開場白（第一條問題）：
如果這是訪問的開始，先說一句簡短的歡迎語，然後問第一條問題。
例如：「多謝您今日願意同我分享您的故事。想請問您，可唔可以話俾我聽，您係邊度長大㗎？」`;

interface Message {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  const { history, subjectInfo, isContinuation, memoryContext } = await req.json() as {
    history: Message[];
    subjectInfo?: { subject_name?: string; village?: string; subject_age?: number };
    isContinuation?: boolean;
    memoryContext?: string; // pre-built background summary from memory files
  };

  let systemWithContext = subjectInfo
    ? `${SYSTEM_PROMPT}\n\n受訪者資料：姓名：${subjectInfo.subject_name ?? "不詳"}，年齡：${subjectInfo.subject_age ?? "不詳"}，來自：${subjectInfo.village ?? "不詳"}`
    : SYSTEM_PROMPT;

  if (memoryContext) {
    systemWithContext += `\n\n【受訪者背景資料（來自記憶檔案）】\n${memoryContext}`;
  }

  if (isContinuation && history.length > 0) {
    systemWithContext += `\n\n【重要提示】這是一次繼續訪問。上面的對話記錄是之前的訪問內容，請仔細閱讀並理解已討論過的話題，然後生成一條自然延續上次對話的問題。不要重複已問過的問題，要在已有內容的基礎上深入挖掘或開展新的話題。用一句簡短的話提示受訪者你記得上次的內容，然後問下一條問題。`;
  }

  const response = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      { role: "system", content: systemWithContext },
      ...history,
    ],
  });

  const question = response.choices[0]?.message?.content ?? "請問您可以繼續分享嗎？";

  return NextResponse.json({ question });
}
