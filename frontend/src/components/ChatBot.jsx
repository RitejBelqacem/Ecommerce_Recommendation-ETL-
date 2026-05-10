import { useState, useRef, useEffect } from "react";

const API = "http://127.0.0.1:5000";

const SUGGESTIONS = [
  "CA total ?",
  "Top produits favoris ?",
  "Taux d'abandon ?",
  "Nouveaux users ?",
];

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 3, alignItems: "center", padding: "2px 0" }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 5, height: 5, borderRadius: "50%",
          background: "#a8a3c9",
          animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
    </div>
  );
}

export default function ChatBot() {
  const [open,     setOpen]     = useState(false);
  const [input,    setInput]    = useState("");
  const [messages, setMessages] = useState([
    {
      role:    "assistant",
      content: "Bonjour 👋 Posez-moi vos questions sur les données.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const sendMessage = async (text) => {
    const question = (text ?? input).trim();
    if (!question || loading) return;
    setInput("");

    const newMessages = [...messages, { role: "user", content: question }];
    setMessages(newMessages);
    setLoading(true);
    setMessages(prev => [...prev, { role: "assistant", content: "..." }]);

    try {
      const history = newMessages.map(m => ({
        role:    m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      }));

      const res = await fetch(`${API}/chat`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ messages: history }),
      });

      const data = await res.json();
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: "assistant", content: data.reply ?? "Désolé, erreur de réponse." },
      ]);
    } catch {
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: "assistant", content: "❌ Impossible de contacter le serveur." },
      ]);
    }
    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
return (
  <div
    style={{
      position: "fixed",
      bottom: 20,
      right: 20,
      zIndex: 9999,
      width: open ? 340 : 180,
      transition: "all 0.25s ease",
      fontFamily: "Arial, sans-serif",
    }}
  >

    {/* Bouton chatbot */}
    <div
      onClick={() => setOpen(v => !v)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 14px",
        cursor: "pointer",
        borderRadius: open ? "12px 12px 0 0" : 50,
        background: "#2d2856",
        color: "#fff",
        boxShadow: "0 4px 15px rgba(0,0,0,0.25)",
      }}
    >
      <span style={{ fontSize: 16 }}>🤖</span>

      <span style={{
        fontSize: 13,
        fontWeight: 600,
        flex: 1,
      }}>
        Assistant IA
      </span>

      <span style={{
        fontSize: 10,
        background: "#05966920",
        color: "#22c55e",
        padding: "2px 6px",
        borderRadius: 10,
      }}>
        LIVE
      </span>
    </div>

    {/* Fenêtre chat */}
    {open && (
      <div
        style={{
          background: "#16133a",
          borderRadius: "0 0 12px 12px",
          border: "1px solid #2d2856",
          overflow: "hidden",
          boxShadow: "0 8px 30px rgba(0,0,0,0.35)",
        }}
      >

        {/* Messages */}
        <div
          style={{
            height: 320,
            overflowY: "auto",
            padding: "10px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {messages.map((msg, i) => {
            const isUser = msg.role === "user";

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: isUser ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "82%",
                    background: isUser ? "#573ff5" : "#2d2856",
                    color: "#fff",
                    borderRadius: isUser
                      ? "12px 12px 4px 12px"
                      : "12px 12px 12px 4px",
                    padding: "8px 10px",
                    fontSize: 12,
                    lineHeight: 1.5,
                  }}
                >
                  {msg.content === "..." ? <TypingDots /> : msg.content}
                </div>
              </div>
            );
          })}

          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 2 && (
          <div
            style={{
              padding: "0 10px 10px",
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
            }}
          >
            {SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                onClick={() => sendMessage(s)}
                style={{
                  fontSize: 11,
                  padding: "5px 9px",
                  borderRadius: 12,
                  background: "#573ff520",
                  border: "1px solid #573ff550",
                  color: "#a89df5",
                  cursor: "pointer",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div
          style={{
            display: "flex",
            gap: 6,
            padding: 10,
            borderTop: "1px solid #2d2856",
          }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Votre question..."
            style={{
              flex: 1,
              background: "#2d2856",
              border: "1px solid #3d3870",
              borderRadius: 8,
              padding: "8px 10px",
              color: "#fff",
              outline: "none",
              fontSize: 12,
            }}
          />

          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "none",
              background:
                !loading && input.trim()
                  ? "#573ff5"
                  : "#2d2856",
              cursor:
                !loading && input.trim()
                  ? "pointer"
                  : "not-allowed",
              color: "#fff",
            }}
          >
            ➤
          </button>
        </div>
      </div>
    )}

    <style>{`
      @keyframes bounce {
        0%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-4px); }
      }
    `}</style>
  </div>
);
}