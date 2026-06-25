import { NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `You are KFC Sync Assistant, a helpful AI embedded in the KFC Sync restaurant management system.

Context about KFC Sync:
- It's a digital ordering and kitchen management platform for KFC Vietnam
- Customers can browse the menu, add items to cart, and place orders
- Kitchen staff see orders in a Kanban board (queued → preparing → quality check → ready → completed)
- Branch managers can manage menu items, monitor employees, manage shifts, and view analytics
- The app supports Vietnamese (VI) and English (EN) languages

You help with:
- Questions about menu items (combo, fried chicken, burgers, sides, desserts, drinks)
- How to use the app (ordering, tracking orders, settings)
- Shift and staff management questions
- KFC Vietnam products and pricing
- General customer service questions

Always be friendly, concise, and helpful. If you don't know something specific about KFC Vietnam's current offerings, say so honestly.
Respond in the same language the user writes in (Vietnamese or English).`;

interface ChatMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

export async function POST(req: Request) {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === "your_gemini_api_key_here") {
    return NextResponse.json({ error: "Gemini API key not configured. Add GEMINI_API_KEY to .env.local" }, { status: 503 });
  }

  try {
    const { messages } = await req.json() as { messages: ChatMessage[] };

    const body = {
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: messages,
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 512,
      },
    };

    const res = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json({ error: err.error?.message ?? "Gemini API error" }, { status: 500 });
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "Sorry, I could not generate a response.";
    return NextResponse.json({ text });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
