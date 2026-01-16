import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge"; // Use edge runtime for faster responses

export async function POST(req: NextRequest) {
  try {
    const { message, context } = await req.json();
    // Build system prompt with context
    const systemPrompt = `You are a helpful DeFi assistant for the StakeFlow staking platform.
    
Current user context:
${context ? JSON.stringify(context, null, 2) : "No context available"}
Platform details:
- Token: StakeFlow Token (SFT)
- Reward Rate: 10% APY
- Network: Sepolia testnet
- Actions available: stake, unstake, claim rewards
Keep answers concise, friendly, and helpful. If the user asks for calculations, show your work clearly.`;
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3-70b-8192",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message },
          ],
          stream: false,
          temperature: 0.7,
        }),
      }
    );
    if (!response.ok) {
      throw new Error(`Groq API error: ${response.statusText}`);
    }
    const data = await response.json();
    const aiMessage = data.choices[0].message.content;
    return NextResponse.json({ message: aiMessage });
  } catch (error) {
    console.error("AI API error:", error);
    return NextResponse.json(
      { error: "Failed to get AI response" },
      { status: 500 }
    );
  }
}
