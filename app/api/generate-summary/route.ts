import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY?.trim() });

const SUMMARY_SYSTEM_PROMPT = `你是一位口述歷史項目的記錄員。
根據一次訪問的對話記錄，生成一份簡短的訪談摘要，以JSON格式輸出。

輸出格式如下（嚴格按此JSON結構，不要加其他文字）：
{
  "topics": ["已討論的主要話題，每項一句話，最多5項"],
  "keyDetails": ["受訪者提到的重要人名、地名、事件，最多5項"],
  "followUps": ["建議下次深入追問的方向，最多3項"]
}`;

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

    const transcriptText = segments
      .map((seg) => {
        const parts: string[] = [];
        if (seg.ai_question) parts.push(`訪問員：${seg.ai_question}`);
        if (seg.transcript) parts.push(`${subjectInfo.subject_name}：${seg.transcript}`);
        return parts.join("\n");
      })
      .join("\n\n");

    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SUMMARY_SYSTEM_PROMPT },
        {
          role: "user",
          content: `受訪者：${subjectInfo.subject_name}（${subjectInfo.subject_age ?? "年齡不詳"}，${subjectInfo.village ?? "地區不詳"}）\n\n訪問記錄：\n\n${transcriptText}`,
        },
      ],
    });

    const raw = response.choices[0]?.message?.content ?? "{}";
    const summary = JSON.parse(raw);
    return NextResponse.json(summary);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
