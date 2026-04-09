import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY?.trim() });

const ARTICLE_SYSTEM_PROMPT = `你是一位專業的口述歷史文字工作者，擅長將訪問記錄整理成溫情、有文學感的人物故事文章。

你的文章風格：
- 以第三人稱敘述，充滿溫度
- 保留受訪者的真實說話語氣和用詞
- 有清晰的結構：開頭引人入勝，中間娓娓道來，結尾有感
- 文字流暢，但不失受訪者的個人色彩
- 篇幅大約 500-800 字
- 以繁體中文書寫，帶廣東話韻味

你收到的是一段訪問記錄，包括 AI 訪問員的問題和受訪者的回答。
請根據這些內容，寫一篇完整的人物故事文章，題目自擬。
只輸出文章本身（包括標題），不需要任何解釋。`;

interface Segment {
  ai_question: string | null;
  transcript: string | null;
  sequence_number: number;
}

export async function POST(req: NextRequest) {
  try {
    const { segments, subjectInfo } = await req.json() as {
      segments: Segment[];
      subjectInfo: { subject_name: string; subject_age?: number | null; village?: string | null };
    };

    if (!segments || segments.length === 0) {
      return NextResponse.json({ error: "No segments provided" }, { status: 400 });
    }

    // Build a readable transcript for the AI to work with
    const transcriptText = segments
      .map((seg) => {
        const parts: string[] = [];
        if (seg.ai_question) parts.push(`訪問員：${seg.ai_question}`);
        if (seg.transcript) parts.push(`${subjectInfo.subject_name}：${seg.transcript}`);
        return parts.join("\n");
      })
      .join("\n\n");

    const userPrompt = `受訪者資料：
姓名：${subjectInfo.subject_name}
年齡：${subjectInfo.subject_age ?? "不詳"}
來自：${subjectInfo.village ?? "不詳"}

以下是訪問記錄：

${transcriptText}

請根據以上內容寫一篇人物故事文章。`;

    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: ARTICLE_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    });

    const article = response.choices[0]?.message?.content ?? "";
    return NextResponse.json({ article });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
