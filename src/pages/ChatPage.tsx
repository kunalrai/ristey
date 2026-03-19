import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

const CRIMSON = "#800020";
const STONE   = "#F5F0E6";
const CARD_BG = "#EDE8DC";
const TEXT    = "#1a140e";
const MUTED   = "#7a6e60";
const SERIF   = "'Noto Serif', Georgia, serif";
const SANS    = "'Inter', system-ui, sans-serif";

function formatTime(ms: number): string {
  return new Date(ms).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate           = useNavigate();
  const me                 = useQuery(api.users.getCurrentUser);
  const messages           = useQuery(api.chat.getMessages, {
    conversationId: conversationId as Id<"conversations">,
  });
  const conversations      = useQuery(api.chat.getConversations);
  const sendMessage        = useMutation(api.chat.sendMessage);
  const markRead           = useMutation(api.chat.markRead);

  const [text, setText]    = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef          = useRef<HTMLDivElement>(null);
  const inputRef           = useRef<HTMLInputElement>(null);

  // Find the other user from conversations list
  const convo = conversations?.find(c => c.conversationId === conversationId);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length]);

  // Mark as read when opened
  useEffect(() => {
    if (!conversationId) return;
    markRead({ conversationId: conversationId as Id<"conversations"> }).catch(() => {});
  }, [conversationId, messages?.length]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending || !conversationId) return;
    setSending(true);
    setText("");
    try {
      await sendMessage({ conversationId: conversationId as Id<"conversations">, text: trimmed });
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const initials = convo?.other.displayName.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2) ?? "?";

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: STONE, fontFamily: SERIF }}>

      {/* ── Header ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 16px",
        background: STONE, borderBottom: `1px solid ${CARD_BG}`,
        flexShrink: 0,
      }}>
        <button onClick={() => navigate("/messages")} style={{ fontSize: 20, color: CRIMSON, lineHeight: 1, padding: "4px 8px 4px 0" }}>
          ←
        </button>

        {/* Avatar */}
        <div style={{
          width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
          background: convo?.other.avatarUrl ? `url(${convo.other.avatarUrl}) center/cover` : `linear-gradient(135deg, ${CRIMSON}, #3a0010)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, fontWeight: 700, color: "#fff",
        }}>
          {!convo?.other.avatarUrl && initials}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 700, color: TEXT }}>
            {convo?.other.displayName ?? "…"}
          </div>
          <div style={{ fontFamily: SANS, fontSize: 11, color: MUTED }}>Heritage Curator match</div>
        </div>
      </div>

      {/* ── Messages ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px" }}>
        {messages === undefined && (
          <div style={{ textAlign: "center", paddingTop: 40, color: MUTED, fontStyle: "italic" }}>Loading…</div>
        )}

        {messages?.length === 0 && (
          <div style={{ textAlign: "center", paddingTop: 60 }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>✦</div>
            <div style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 700, color: TEXT, marginBottom: 6 }}>
              Begin the conversation
            </div>
            <p style={{ fontFamily: SANS, fontSize: 13, color: MUTED, maxWidth: 220, margin: "0 auto" }}>
              A thoughtful first message goes a long way.
            </p>
          </div>
        )}

        {/* Group messages by date */}
        {messages?.map((msg, i) => {
          const isMine = msg.senderId === me?._id;
          const prevMsg = messages[i - 1];
          const showDate = !prevMsg || new Date(prevMsg.sentAt).toDateString() !== new Date(msg.sentAt).toDateString();

          return (
            <div key={msg._id}>
              {showDate && (
                <div style={{ textAlign: "center", margin: "12px 0 8px", fontFamily: SANS, fontSize: 11, color: MUTED, letterSpacing: "0.04em" }}>
                  {new Date(msg.sentAt).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
                </div>
              )}
              <div style={{
                display: "flex",
                justifyContent: isMine ? "flex-end" : "flex-start",
                marginBottom: 6,
              }}>
                <div style={{
                  maxWidth: "72%",
                  padding: "10px 14px",
                  borderRadius: isMine ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  background: isMine ? CRIMSON : CARD_BG,
                  color: isMine ? "#fff" : TEXT,
                  fontFamily: SANS,
                  fontSize: 14,
                  lineHeight: 1.5,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                }}>
                  <div>{msg.text}</div>
                  <div style={{
                    fontSize: 10, marginTop: 4, textAlign: "right",
                    color: isMine ? "rgba(255,255,255,0.6)" : MUTED,
                  }}>
                    {formatTime(msg.sentAt)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 16px",
        background: STONE,
        borderTop: `1px solid ${CARD_BG}`,
        paddingBottom: "calc(10px + env(safe-area-inset-bottom, 0px))",
        flexShrink: 0,
      }}>
        <input
          ref={inputRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Write a message…"
          style={{
            flex: 1,
            padding: "12px 16px",
            background: CARD_BG,
            border: "none",
            borderRadius: 24,
            fontFamily: SANS,
            fontSize: 14,
            color: TEXT,
            outline: "none",
          }}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          style={{
            width: 44, height: 44, borderRadius: "50%",
            background: text.trim() ? CRIMSON : CARD_BG,
            border: "none", cursor: text.trim() ? "pointer" : "default",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, color: text.trim() ? "#fff" : MUTED,
            transition: "background 0.2s",
            flexShrink: 0,
          }}
        >
          ➤
        </button>
      </div>
    </div>
  );
}
