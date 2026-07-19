import { useState, useEffect, useRef } from "react";
import { FaRobot, FaPaperPlane, FaTimes, FaUserMd, FaCommentMedical, FaMinus } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";
import api from "../Lib/api";

export default function Chatbot() {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  
  const initialMessage = {
    sender: "bot",
    text: "Hi! I'm Healbot, your virtual health assistant. Tell me your symptoms and I'll help you find the right doctor.",
  };

  const [messages, setMessages] = useState([initialMessage]);
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
      const response = await api.post("/chatbot/chat", { message: userMsg.text });
      const data = response.data;

      const botMsg = {
        sender: "bot",
        text: data.reply,
        isEmergency: data.isEmergency,
        doctors: data.doctors || [],
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

  const handleMinimize = () => {
    setIsOpen(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setMessages([initialMessage]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end pointer-events-none">
      {/* Chat Window */}
      <div
        className={`pointer-events-auto w-[calc(100vw-3rem)] sm:w-[380px] h-[calc(100vh-8rem)] sm:h-[500px] max-h-[600px] rounded-2xl overflow-hidden flex flex-col transition-all duration-300 origin-bottom-right mb-4 ${
          theme === "dark"
            ? "bg-gradient-to-br from-[#14172a]/95 via-[#1c2036]/95 to-[#14172a]/95 backdrop-blur-xl border border-gray-700/50 shadow-[0_8px_32px_0_rgba(178,59,46,0.2)]"
            : "bg-[var(--hb-cream)] border border-[var(--border)] shadow-2xl"
        } ${
          isOpen
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-10 pointer-events-none h-0 invisible"
        }`}
      >
        {/* Header */}
        <div className="bg-[var(--hb-ink)] p-4 flex items-center justify-between text-white shrink-0 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="bg-[var(--hb-red)]/10 p-2 rounded-xl border border-[var(--hb-red)]/20 text-[var(--hb-red)]">
              <FaRobot className="text-xl" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[var(--hb-white)]">Healbot</h3>
              <div className="flex items-center gap-1.5 opacity-90">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-semibold tracking-wider text-emerald-400">ONLINE</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleMinimize}
              title="Minimize chat"
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
            >
              <FaMinus className="text-xs" />
            </button>
            <button
              onClick={handleClose}
              title="Close & Reset Chat"
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
            >
              <FaTimes className="text-sm" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div
          className={`flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar ${
            theme === "dark" ? "bg-[#14172a]/30" : "bg-[#efeae0]/30"
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
                    ? "bg-[var(--hb-red)] text-white rounded-tr-sm"
                    : theme === "dark"
                      ? "bg-gradient-to-br from-[#1c2036] to-[#14172a] backdrop-blur-md text-[var(--hb-ink)] border border-[var(--border)] rounded-tl-sm"
                      : "bg-[var(--hb-white)] text-[var(--hb-ink)] border border-[var(--border)] rounded-tl-sm"
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
                  <p className="text-[10px] font-bold text-[var(--hb-ink-soft)] uppercase tracking-wider mb-1.5 ml-1">
                    Recommended Specialists
                  </p>
                  {msg.doctors.map((doc) => (
                    <div
                      key={doc.id}
                      className={`p-3 rounded-xl shadow-sm flex items-center gap-3 hover:border-[var(--hb-red)] transition-all cursor-pointer group ${
                        theme === "dark"
                          ? "bg-[#1c2036]/60 backdrop-blur-md border border-[var(--border)]"
                          : "bg-[var(--hb-white)] border border-[var(--border)]"
                      }`}
                    >
                      <div className="h-10 w-10 rounded-full bg-[var(--hb-red)]/10 flex items-center justify-center text-[var(--hb-red)] shrink-0 group-hover:bg-[var(--hb-red)] group-hover:text-white transition-colors">
                        <FaUserMd />
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-bold text-sm text-[var(--hb-ink)] group-hover:text-[var(--hb-red)] transition-colors">
                          Dr. {doc.user?.firstName} {doc.user?.lastName}
                        </p>
                        <p className="text-xs text-[var(--hb-ink-soft)]">{doc.specialization}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 text-[var(--hb-ink-soft)] text-xs ml-2">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-[var(--hb-ink-soft)] rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-[var(--hb-ink-soft)] rounded-full animate-bounce delay-70"></div>
                <div className="w-1.5 h-1.5 bg-[var(--hb-ink-soft)] rounded-full animate-bounce delay-150"></div>
              </div>
              Healbot is thinking...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div
          className={`p-3 border-t shrink-0 ${
            theme === "dark"
              ? "bg-[#14172a]/50 backdrop-blur-md border-gray-700/50"
              : "bg-[var(--hb-white)] border-[var(--border)]"
          }`}
        >
          <div className="relative flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Describe your symptoms..."
              className={`w-full pl-4 pr-12 py-3 rounded-xl border border-[var(--border)] focus:ring-2 focus:ring-[var(--hb-red)]/50 focus:outline-none text-sm transition-all shadow-inner ${
                theme === "dark"
                  ? "bg-[#1c2036]/80 text-white placeholder-gray-400"
                  : "bg-[var(--hb-cream-deep)] text-[var(--hb-ink)] placeholder-[var(--hb-ink-soft)]"
              }`}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 p-2 bg-[var(--hb-red)] text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:shadow-none transition-all transform hover:scale-105 active:scale-95"
            >
              <FaPaperPlane className="text-sm" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`pointer-events-auto h-12 w-12 rounded-full shadow-[0_4px_20px_rgba(178,59,46,0.35)] flex items-center justify-center text-xl transition-all duration-300 transform hover:scale-110 active:scale-95 ${
          isOpen
            ? "rotate-90 bg-[var(--hb-ink)] text-white hover:bg-[var(--hb-ink)]"
            : "bg-[var(--hb-red)] text-white hover:bg-[var(--hb-red-deep)] hover:shadow-[0_0_20px_var(--hb-red-glow)] animate-bounce-slow"
        }`}
      >
        {isOpen ? <FaTimes /> : <FaCommentMedical />}
      </button>
    </div>
  );
}
