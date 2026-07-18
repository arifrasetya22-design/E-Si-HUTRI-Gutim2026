/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles, User, HelpCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
}

export const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Halo! Saya Asisten AI SI-HUT RI 81 Gunung Timang. 🇮🇩\n\nAda yang bisa saya bantu mengenai pendaftaran, ketentuan teknis (Juknis) lomba, atau kontak panitia?",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const quickQuestions = [
    { label: "Berapa peserta Paduan Suara?", query: "Berapa jumlah peserta untuk lomba Paduan Suara?" },
    { label: "Apa lagu wajib Vocal Solo SD?", query: "Apa saja lagu wajib dan pilihan untuk Vocal Solo tingkat SD/MI?" },
    { label: "Syarat Lagu Tradisional?", query: "Apa ketentuan dan cabang lomba Lagu Tradisional?" },
    { label: "Siapa narahubung Tari?", query: "Siapa saja kontak panitia untuk seksi tari dan karaoke?" },
  ];

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: "user",
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.map((m) => ({ sender: m.sender, text: m.text })),
          userMessage: textToSend,
        }),
      });
      const data = await response.json();
      
      const aiMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: "ai",
        text: data.reply || "Maaf, saya sedang mengalami kendala jaringan. Silakan coba kembali.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const aiMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: "ai",
        text: "Koneksi ke server terputus. Namun secara umum:\n\n• Batas Akhir: 10 Agustus 2026\n• Pendaftaran: 100% GRATIS\n• Silakan cek halaman Juknis untuk detail lengkap tiap lomba!",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 p-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full shadow-[0_4px_20px_rgba(239,68,68,0.4)] hover:shadow-[0_6px_25px_rgba(239,68,68,0.6)] cursor-pointer flex items-center justify-center border border-red-500/50"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        <span className="absolute -top-1 -right-1 flex h-3.3 w-3.3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.3 w-3.3 bg-amber-500"></span>
        </span>
      </motion.button>

      {/* Chat Window Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-40 w-[90vw] sm:w-[380px] h-[500px] bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-800"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-red-600 to-red-800 border-b border-red-700/15 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/20 text-white rounded-lg">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Asisten AI SI-HUT RI 81</h3>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                    <span className="text-xxs text-red-100">Merdeka Berprestasi • Online</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-red-100 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-200">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-2.5 ${m.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div className={`p-1.5 rounded-lg shrink-0 w-8 h-8 flex items-center justify-center ${m.sender === "user" ? "bg-red-50 text-red-600 border border-red-100" : "bg-slate-100 text-slate-700 border border-slate-200"}`}>
                    {m.sender === "user" ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                  </div>
                  <div
                    className={`max-w-[75%] p-3 rounded-xl text-xs leading-relaxed whitespace-pre-wrap ${
                      m.sender === "user"
                        ? "bg-red-600 text-white rounded-tr-none"
                        : "bg-slate-100 text-slate-800 border border-slate-200/60 rounded-tl-none"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-2.5">
                  <div className="p-1.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg shrink-0 w-8 h-8 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="bg-slate-100 text-slate-500 border border-slate-200 p-3 rounded-xl rounded-tl-none text-xs flex items-center gap-2">
                    Mengetik...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Questions suggestion chip */}
            {messages.length === 1 && (
              <div className="p-3 bg-slate-50 border-t border-slate-100">
                <p className="text-xxs font-bold text-slate-500 mb-2 flex items-center gap-1">
                  <HelpCircle className="w-3 h-3 text-red-600" /> Pertanyaan Populer:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {quickQuestions.map((qq, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(qq.query)}
                      className="text-xxs px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-red-600 rounded-lg transition-colors cursor-pointer text-left"
                    >
                      {qq.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Footer */}
            <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend(inputText)}
                placeholder="Tulis pesan Anda di sini..."
                className="flex-1 bg-slate-50 border border-slate-200 focus:border-red-500/50 focus:outline-hidden text-xs rounded-xl px-3 py-2 text-slate-950 placeholder-slate-400"
                disabled={loading}
              />
              <button
                onClick={() => handleSend(inputText)}
                disabled={loading || !inputText.trim()}
                className="p-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:hover:bg-red-600 text-white rounded-xl transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
