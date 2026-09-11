import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("MISSING API KEY: Please check your .env.local file");
      return NextResponse.json({ error: "API key missing" }, { status: 500 });
    }

    // Initialize the standard Google Gen AI SDK
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" }); // Highly stable and fast model

    const { message, subjectName } = await req.json();

    // The Persona Prompt
    // The Persona Prompt & Strict Guardrails
    const prompt = `You are a professional, highly intelligent accounting tutor for ICAN and ATSWA students in Nigeria. 
    The student is currently studying the subject: ${subjectName}. 
    Answer their question clearly, concisely, and use official accounting standards (IFRS/IAS/ISA) where applicable. 

    CRITICAL INSTRUCTIONS:
    1. DO NOT use LaTeX formatting (e.g. avoid $\\text{IR}$ or similar math blocks). Use plain text or standard markdown only.
    2. Keep your responses concise and scannable. Limit answers to 2-3 short paragraphs or a quick bulleted list so they fit perfectly inside a small chat window.
    
    Student's question: ${message}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return NextResponse.json({ reply: responseText });
  } catch (error: any) {
    console.error("Gemini API Error details:", error.message || error);
    return NextResponse.json(
      { error: "Failed to connect to the AI Tutor." },
      { status: 500 },
    );
  }
}
