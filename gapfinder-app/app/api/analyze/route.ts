


import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // 1. Read and validate the request
    let body: { text?: unknown };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request. Please upload your study material again." },
        { status: 400 }
      );
    }

    const text = body.text;

    if (typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { error: "Please provide readable study material." },
        { status: 400 }
      );
    }

    // 2. Check the API key
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("GEMINI_API_KEY is missing.");

      return NextResponse.json(
        { error: "Gemini API key is not configured. Check your .env.local file." },
        { status: 500 }
      );
    }

    // 3. Initialize Gemini
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are an AI study assistant. Analyze the following study notes.

Return your answer with these headings:

1. MAIN TOPICS
List the most important topics.

2. IMPORTANT SUBTOPICS
Briefly explain the key subtopics.

3. REVISION PRIORITIES
Identify topics the student should revise carefully.

4. FIVE QUIZ QUESTIONS
Create five short questions based only on the supplied notes.

Use clear, student-friendly language. Do not invent information absent from the notes.

STUDY NOTES:
${text.slice(0, 20000)}`;

    // 4. Retry temporary Gemini server errors up to 2 times
    let response;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
          contents: prompt,
        });

        break;
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : String(error);

        const isTemporary =
          /503|UNAVAILABLE|high demand|overloaded|temporarily unavailable|429|RESOURCE_EXHAUSTED/i.test(
            message
          );

        console.error(`Gemini attempt ${attempt} failed:`, message);

        if (!isTemporary || attempt === 3) {
          throw error;
        }

        // Wait 1 second, then 2 seconds before retrying
        await new Promise((resolve) =>
          setTimeout(resolve, attempt * 1000)
        );
      }
    }

    // 5. Validate Gemini's response
    const analysis = response?.text?.trim();

    if (!analysis) {
      console.error("Gemini returned an empty analysis.");

      return NextResponse.json(
        {
          error:
            "AI did not return any analysis. Please try again.",
        },
        { status: 502 }
      );
    }

    // 6. Return the analysis
    return NextResponse.json({ analysis });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : String(error);

    console.error("Analysis API error:", message);

    if (/api.?key|unauthorized|permission denied|forbidden|401/i.test(message)) {
      return NextResponse.json(
        {
          error:
            "Gemini authentication failed. Please check your API key configuration.",
        },
        { status: 401 }
      );
    }

    if (/quota|rate.?limit|resource.?exhausted|429/i.test(message)) {
      return NextResponse.json(
        {
          error:
            "Gemini API quota or rate limit reached. Please try again later.",
        },
        { status: 429 }
      );
    }

    if (/503|UNAVAILABLE|high demand|overloaded|temporarily unavailable/i.test(message)) {
      return NextResponse.json(
        {
          error:
            "Gemini is experiencing high demand. Please try again in a few minutes.",
        },
        { status: 503 }
      );
    }

    if (/not found|not supported|invalid model/i.test(message)) {
      return NextResponse.json(
        {
          error:
            "The Gemini model is unavailable. Check which model your API key supports.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        error:
          "AI analysis failed. Please try again. Check the server terminal for details.",
      },
      { status: 500 }
    );
  }
}
