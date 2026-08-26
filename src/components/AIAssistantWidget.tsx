import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User as UserIcon,
  HelpCircle,
  FileText,
  ShieldAlert,
  ArrowRight,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const SAMPLE_PROMPTS = [
  'How do I file a broken village road grievance?',
  'What are my rights under Jal Jeevan Mission?',
  'How do community petitions lead to official action?',
  'How to check the status of complaint #GV-10482?',
];

export const AIAssistantWidget: React.FC = () => {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Namaste ${currentUser?.fullName ? currentUser.fullName : 'Citizen'}! 🙏 I am **GramVikas Saathi**, your AI rural grievance assistant.\n\nI can help you:\n- **Draft formal complaints** in any Indian language\n- **Explain your rights** under government welfare schemes\n- **Track grievance resolution steps**\n- **Understand how to start a village petition**\n\nHow can I help your village today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: Message = {
      role: 'user',
      content: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/assistant-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          userContext: currentUser,
        }),
      });
      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I apologize, I am temporarily having trouble connecting to the network. Please try asking again in a moment.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          id="open-ai-assistant-btn"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 px-4 py-3 bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 hover:from-emerald-800 hover:to-teal-600 text-white rounded-full shadow-2xl hover:scale-105 transition-all flex items-center gap-2.5 font-bold text-xs cursor-pointer group"
        >
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-emerald-200 group-hover:rotate-12 transition" />
          </div>
          <span className="pr-1">Ask GramVikas AI</span>
          <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] h-[520px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 duration-200">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-extrabold flex items-center gap-1.5">
                  <span>GramVikas Saathi</span>
                  <span className="bg-emerald-400/20 text-emerald-300 text-[9px] px-1.5 py-0.2 rounded-full border border-emerald-400/30">
                    AI Assistant
                  </span>
                </div>
                <div className="text-[10px] text-slate-300">Rural Grievance & Petition Guide</div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50 text-xs">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-1">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`p-3 rounded-2xl max-w-[82%] leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-xs shadow-xs'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs shadow-2xs'
                  }`}
                >
                  <div className="whitespace-pre-line text-xs font-normal">
                    {msg.content}
                  </div>
                  <div
                    className={`text-[9px] mt-1 ${
                      msg.role === 'user' ? 'text-emerald-200 text-right' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div className="w-6 h-6 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 mt-1">
                    <UserIcon className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 items-center text-slate-500 text-xs py-1">
                <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 animate-spin" />
                </div>
                <span className="text-[11px] italic text-slate-500">GramVikas AI is formulating response...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-3 py-1.5 bg-slate-100/90 border-t border-slate-200 flex gap-1.5 overflow-x-auto no-scrollbar">
            {SAMPLE_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                className="text-[10px] font-medium bg-white hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 border border-slate-200 rounded-lg px-2.5 py-1 whitespace-nowrap transition cursor-pointer shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              id="ai-assistant-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask anything in English, Hindi, or your dialect..."
              className="flex-1 text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <button
              id="ai-assistant-send-btn"
              onClick={() => handleSendMessage()}
              disabled={loading || !input.trim()}
              className="w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition disabled:opacity-50 cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
