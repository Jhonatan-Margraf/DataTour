import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Send, Bot, User, Sparkles } from "lucide-react";

interface Message {
  id: number;
  role: "assistant" | "user";
  text: string;
  time: string;
}

const DEMO_SCRIPT: { trigger: string; response: string }[] = [
  {
    trigger: "__init__",
    response:
      "Olá! Sou o assistente do Data Tour. Posso te ajudar a interpretar dados de fluxo, feedbacks de visitantes e tendências de turismo em Foz do Iguaçu. Como posso ajudar?",
  },
  {
    trigger: "fluxo",
    response:
      "Com base nos dados de 2025, o fluxo anual total foi de ~4,1 milhões de visitantes (Itaipu + Aeroporto + Rodoviária). O Aeroporto foi a fonte com maior crescimento, subindo 12% em relação a 2024. Para 2026, a projeção indica ~3,87 milhões.",
  },
  {
    trigger: "feedback",
    response:
      "A nota média geral é 4.3★ com NPS positivo. O Refúgio Biológico lidera em volume de avaliações. Os principais tópicos críticos são: filas no embarque, sinalização e horários de visita.",
  },
  {
    trigger: "itaipu",
    response:
      "Itaipu Binacional registrou 765.445 visitantes em 2025, uma alta de 11% sobre 2024. O pico ocorreu em julho durante as férias de inverno. A projeção 2026 é de 712.000 (YTD: 178.206 até abril).",
  },
  {
    trigger: "nps",
    response:
      "O NPS Global calculado é positivo. A Itaipu Iluminada se destaca com os maiores índices de promotores. Para elevar o NPS, as análises de tópicos sugerem melhorias em: tempo de espera, infraestrutura e guias bilíngues.",
  },
  {
    trigger: "aeroporto",
    response:
      "O Aeroporto Internacional de Foz do Iguaçu foi a fonte de maior crescimento com 2.284.517 passageiros em 2025 (+12% vs 2024). A projeção para 2026 é de 1.870.000 (YTD: 467.379 até abril).",
  },
];

function getTime(): string {
  return new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getResponse(text: string): string {
  const lower = text.toLowerCase();
  const match = DEMO_SCRIPT.slice(1).find((s) => lower.includes(s.trigger));
  return (
    match?.response ??
    "Entendi sua pergunta! Com base nos dados disponíveis no sistema, posso analisar fluxo, feedbacks, NPS e tendências de turismo. Tente perguntar sobre: fluxo anual, feedback, Itaipu, Aeroporto ou NPS."
  );
}

export function AiChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(1);

  // Init message when first opened
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          id: nextId.current++,
          role: "assistant",
          text: DEMO_SCRIPT[0].response,
          time: getTime(),
        },
      ]);
    }
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  function send() {
    const text = input.trim();
    if (!text) return;
    setInput("");

    const userMsg: Message = {
      id: nextId.current++,
      role: "user",
      text,
      time: getTime(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setTyping(true);

    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: nextId.current++,
          role: "assistant",
          text: getResponse(text),
          time: getTime(),
        },
      ]);
    }, 1200 + Math.random() * 600);
  }

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            key="fab"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white"
            style={{ background: "linear-gradient(135deg, #0082C4 0%, #005fa3 100%)" }}
            title="Assistente IA"
          >
            <Bot className="w-6 h-6" />
            {/* Pulse ring */}
            <span className="absolute w-14 h-14 rounded-full border-2 border-[#0082C4] animate-ping opacity-30" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", damping: 22, stiffness: 260 }}
            className="fixed bottom-6 right-6 z-50 w-[360px] max-h-[580px] flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-zinc-200 bg-white"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 text-white"
              style={{ background: "linear-gradient(135deg, #0082C4 0%, #005fa3 100%)" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-sm leading-tight">Assistente Data Tour</p>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] inline-block" />
                    <p className="text-xs text-white/80">Online · demonstração</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Suggestion pills */}
            {messages.length <= 1 && (
              <div className="flex flex-wrap gap-2 px-4 py-3 border-b border-zinc-100 bg-zinc-50">
                <p className="text-xs text-zinc-500 w-full mb-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Sugestões
                </p>
                {["Fluxo 2025", "Feedback NPS", "Itaipu Binacional", "Aeroporto"].map((s) => (
                  <button
                    key={s}
                    onClick={() => { setInput(s); setTimeout(send, 50); }}
                    className="px-3 py-1 text-xs rounded-full border border-[#0082C4]/30 text-[#0082C4] hover:bg-[#0082C4]/10 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      msg.role === "assistant"
                        ? "bg-[#0082C4] text-white"
                        : "bg-zinc-200 text-zinc-600"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <Bot className="w-4 h-4" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>
                  {/* Bubble */}
                  <div className={`max-w-[75%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
                    <div
                      className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                        msg.role === "assistant"
                          ? "bg-zinc-100 text-zinc-800 rounded-tl-sm"
                          : "bg-[#0082C4] text-white rounded-tr-sm"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-zinc-400 px-1">{msg.time}</span>
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              <AnimatePresence>
                {typing && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex gap-2 items-center"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#0082C4] text-white flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="px-3 py-2.5 bg-zinc-100 rounded-2xl rounded-tl-sm flex gap-1 items-center">
                      {[0, 0.2, 0.4].map((delay) => (
                        <motion.span
                          key={delay}
                          className="w-1.5 h-1.5 bg-zinc-400 rounded-full"
                          animate={{ y: [0, -4, 0] }}
                          transition={{ repeat: Infinity, duration: 0.7, delay, ease: "easeInOut" }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-3 py-3 border-t border-zinc-100 flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Pergunte sobre os dados..."
                className="flex-1 text-sm px-3 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#0082C4]/40 focus:border-[#0082C4] transition-colors"
              />
              <button
                onClick={send}
                disabled={!input.trim() || typing}
                className="w-10 h-10 rounded-xl bg-[#0082C4] text-white flex items-center justify-center hover:bg-[#006a9e] disabled:opacity-40 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
