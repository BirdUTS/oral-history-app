import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY?.trim() });

const EVAL_SYSTEM_PROMPT = `你係一個廣東話口述歷史轉寫評估員。
你的任務係分析語音轉寫文字，找出可能被聽錯嘅專有名詞。

只需要標記以下類型：
- 人名（如：陳大文、李婆婆）
- 地名（如：牛頭角、觀塘、廈村）
- 機構名（如：香港青少年服務處、村委會）
- 廣東話特有詞彙或古語地名

唔需要標記：普通字詞、動詞、形容詞、數字、常見地方（香港、九龍）

以JSON格式輸出（唔要任何其他文字）：
{
  "uncertainTerms": [
    {
      "original": "原文中嘅字詞",
      "context": "包含該字詞嘅短句（10-15字）",
      "reason": "為何不確定（一句話）"
    }
  ]
}

若無不確定字詞，返回 {"uncertainTerms": []}`;

export async function POST(req: NextRequest) {
  try {
    const { transcript } = await req.json() as { transcript: string };

    if (!transcript || transcript.trim().length < 5) {
      return NextResponse.json({ uncertainTerms: [] });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: EVAL_SYSTEM_PROMPT },
        { role: "user", content: `請評估以下轉寫文字：\n\n${transcript}` },
      ],
    });

    const raw = response.choices[0]?.message?.content ?? '{"uncertainTerms":[]}';
    const result = JSON.parse(raw);
    // Cap at 5 terms to avoid overwhelming the user
    if (Array.isArray(result.uncertainTerms)) {
      result.uncertainTerms = result.uncertainTerms.slice(0, 5);
    }
    return NextResponse.json(result);
  } catch (err) {
    // Evaluation is non-critical — fail silently with empty result
    console.error("evaluate-transcript error:", err);
    return NextResponse.json({ uncertainTerms: [] });
  }
}
