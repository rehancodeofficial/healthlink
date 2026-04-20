import { useState, useEffect, useRef } from "react";
import { FaRobot, FaPaperPlane, FaTimes, FaUserMd, FaCommentMedical } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";

export default function Chatbot() {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I am your AI Medical Assistant. I can help you find specialists and answer general health questions based on your symptoms. How can I assist you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // Direct call to Python backend
      // Note: We are using fetch here to avoid needing to import axios if it's not already imported,
      // but let's stick to the plan and standard practice.
      // Actually, let's use the existing 'api' if we can, but 'api' likely has a baseURL set to the Node backend.
      // So detailed fetch is safer.
      const chatbotUrl = import.meta.env.DEV
        ? "https://curevirtual-2-production-ee33.up.railway.app/api/chatbot/chat"
        : import.meta.env.VITE_CHATBOT_URL ||
          "https://curevirtual-2-production-ee33.up.railway.app/api/chatbot/chat";
      const response = await fetch(chatbotUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMsg.text }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const botMsg = {
        sender: "bot",
        text: data.reply,
        isEmergency: data.isEmergency,
        doctors: data.doctors || [], // Python backend currently doesn't return doctors, handle gracefully
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("Chatbot error:", err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "I am sorry, I encountered an error connecting to the AI service. Please try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      {/* Chat Window */}
      <div
        className={`pointer-events-auto w-[350px] sm:w-[380px] h-[500px] rounded-2xl overflow-hidden flex flex-col transition-all duration-300 origin-bottom-right mb-4 ${
          theme === "dark"
            ? "bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-xl border border-gray-700/50 shadow-[0_8px_32px_0_rgba(59,130,246,0.2)]"
            : "bg-white border border-gray-200 shadow-2xl"
        } ${
          isOpen
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-10 pointer-events-none h-0 invisible"
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[var(--brand-blue)] to-[var(--brand-green)] p-4 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
              <FaRobot className="text-xl" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Medical Assistant</h3>
              <div className="flex items-center gap-1.5 opacity-90">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-medium tracking-wide">ONLINE</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* Messages Area */}
        <div
          className={`flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar ${
            theme === "dark" ? "bg-gray-900/50" : "bg-gray-50"
          }`}
        >
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm relative ${
                  msg.sender === "user"
                    ? "bg-[var(--brand-blue)] text-white rounded-tr-sm"
                    : theme === "dark"
                      ? "bg-gradient-to-br from-gray-800/80 to-gray-700/80 backdrop-blur-md text-white border border-gray-600/50 rounded-tl-sm"
                      : "bg-white text-gray-800 border border-gray-200 rounded-tl-sm"
                }`}
              >
                <div className="whitespace-pre-wrap">
                  {msg.isEmergency && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-600 p-2 rounded-lg mb-2 flex items-center gap-2 font-bold animate-pulse">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      EMERGENCY WARNING
                    </div>
                  )}
                  {msg.text}
                </div>
              </div>

              {/* Recommended Doctors Cards */}
              {msg.doctors && msg.doctors.length > 0 && (
                <div className="mt-3 space-y-2 w-full max-w-[90%]">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                    Recommended Specialists
                  </p>
                  {msg.doctors.map((doc) => (
                    <div
                      key={doc.id}
                      className={`p-3 rounded-xl shadow-sm flex items-center gap-3 hover:border-[var(--brand-blue)] transition-all cursor-pointer group ${
                        theme === "dark"
                          ? "bg-gray-800/60 backdrop-blur-md border border-gray-600/50"
                          : "bg-white border border-gray-200"
                      }`}
                    >
                      <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-[var(--brand-blue)] shrink-0 group-hover:bg-[var(--brand-blue)] group-hover:text-white transition-colors">
                        <FaUserMd />
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-bold text-sm text-[var(--text-main)] group-hover:text-[var(--brand-blue)] transition-colors">
                          Dr. {doc.user?.firstName} {doc.user?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{doc.specialization}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 text-gray-400 text-xs ml-2">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
              Bot is typing...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div
          className={`p-3 border-t shrink-0 ${
            theme === "dark"
              ? "bg-gray-900/50 backdrop-blur-md border-gray-700/50"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="relative flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Describe your symptoms..."
              className={`w-full pl-4 pr-12 py-3 rounded-xl border-none focus:ring-2 focus:ring-[var(--brand-blue)]/50 text-sm transition-all shadow-inner ${
                theme === "dark"
                  ? "bg-gray-800/80 backdrop-blur-md text-white placeholder-gray-400"
                  : "bg-gray-100 text-gray-800 placeholder-gray-500"
              }`}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 p-2 bg-gradient-to-r from-[var(--brand-blue)] to-[var(--brand-green)] text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:shadow-none transition-all transform hover:scale-105 active:scale-95"
            >
              <FaPaperPlane className="text-sm" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`pointer-events-auto h-12 w-12 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.15)] flex items-center justify-center text-xl transition-all duration-300 transform hover:scale-110 active:scale-95 ${
          isOpen
            ? "rotate-90 bg-gray-400 hover:bg-gray-500"
            : "bg-gradient-to-r from-[var(--brand-blue)] to-[var(--brand-green)] hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] animate-bounce-slow"
        }`}
      >
        {isOpen ? <FaTimes /> : <FaCommentMedical />}
      </button>
    </div>
  );
}
