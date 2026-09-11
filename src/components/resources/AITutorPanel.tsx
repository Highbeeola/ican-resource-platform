"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Loader2, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown"; // Optional: if you don't have this, you can just render text normally, but markdown makes AI bolding look nice!

interface Props {
  subjectName: string;
}

export default function AITutorPanel({ subjectName }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<
    { role: "user" | "ai"; text: string }[]
  >([
    {
      role: "ai",
      text: `Hi! I am your AI Tutor for **${subjectName}**. What concept can I explain for you today?`,
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isTyping]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = message.trim();
    setMessage("");
    setChatHistory((prev) => [...prev, { role: "user", text: userMessage }]);
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, subjectName }),
      });

      const data = await res.json();

      if (res.ok) {
        setChatHistory((prev) => [...prev, { role: "ai", text: data.reply }]);
      } else {
        setChatHistory((prev) => [
          ...prev,
          {
            role: "ai",
            text: "Sorry, I'm having trouble connecting to the server right now.",
          },
        ]);
      }
    } catch (err) {
      setChatHistory((prev) => [
        ...prev,
        { role: "ai", text: "Network error occurred." },
      ]);
    } finally {
      setIsTyping(false);
    }
  }

  return (
    <>
      {/* FLOATING ACTION BUTTON */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 p-4 bg-[#1e3a8a] hover:bg-blue-800 text-white rounded-full shadow-2xl transition-transform hover:scale-105 z-50 flex items-center gap-2 group"
        >
          <Bot className="w-6 h-6" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap font-bold text-sm">
            Ask AI Tutor
          </span>
        </button>
      )}

      {/* CHAT WINDOW */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[90vw] sm:w-[400px] h-[500px] bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden">
          {/* HEADER */}
          <div className="bg-[#1e3a8a] p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <div className="bg-[#f59e0b] p-1.5 rounded-lg">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm">CA Prep AI Tutor</h3>
                <p className="text-[10px] text-blue-200">
                  Powered by Gemini Flash 2.5
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-blue-200 hover:text-white transition p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* CHAT AREA */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {chatHistory.map((chat, idx) => (
              <div
                key={idx}
                className={`flex ${chat.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    chat.role === "user"
                      ? "bg-[#1e3a8a] text-white rounded-tr-sm"
                      : "bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm"
                  }`}
                >
                  <div className="prose prose-sm prose-slate max-w-none text-current leading-relaxed">
                    <ReactMarkdown>{chat.text}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-sm flex items-center gap-2 shadow-sm">
                  <Sparkles className="w-4 h-4 text-[#f59e0b] animate-pulse" />
                  <span className="text-xs text-slate-500 font-medium">
                    AI is thinking...
                  </span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* INPUT AREA */}
          <form
            onSubmit={handleSend}
            className="p-3 bg-white border-t border-slate-100 flex gap-2"
          >
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about IAS 16, taxation..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#1e3a8a]"
            />
            <button
              type="submit"
              disabled={isTyping || !message.trim()}
              className="p-2.5 bg-[#f59e0b] hover:bg-[#d97706] text-white rounded-xl transition disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
