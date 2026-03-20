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

function formatDateLabel(ms: number): string {
  const date = new Date(ms);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}

type ReplyTo = { id: Id<"messages">; text: string; senderName: string } | null;

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

  const [text, setText]       = useState("");
  const [sending, setSending] = useState(false);
  const [replyTo, setReplyTo] = useState<ReplyTo>(null);
  const [selectedMsgId, setSelectedMsgId] = useState<string | null>(null);

  const bottomRef       = useRef<HTMLDivElement>(null);
  const inputRef        = useRef<HTMLInputElement>(null);
  const longPressTimer  = useRef<ReturnType<typeof setTimeout>>();
  const longPressActive = useRef(false);

  const convo = conversations?.find(c => c.conversationId === conversationId);

  // ── Lock body scroll & scroll to bottom when keyboard opens ─────────────
  useEffect(() => {
    // Prevent the page from scrolling when keyboard opens (which would push
    // our position:fixed container partially off-screen)
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const vv = window.visualViewport;
    if (vv) {
      const scrollToBottom = () => {
        // Neutralise any scroll that Chrome applied trying to reveal the input
        window.scrollTo(0, 0);
        requestAnimationFrame(() => {
          bottomRef.current?.scrollIntoView({ behavior: "instant" });
        });
      };
      vv.addEventListener("resize", scrollToBottom);
      vv.addEventListener("scroll", scrollToBottom);
      return () => {
        document.body.style.overflow = prev;
        vv.removeEventListener("resize", scrollToBottom);
        vv.removeEventListener("scroll", scrollToBottom);
      };
    }

    return () => { document.body.style.overflow = prev; };
  }, []);

  // ── Scroll to bottom on new messages ───────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length]);

  // ── Mark as read ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!conversationId) return;
    markRead({ conversationId: conversationId as Id<"conversations"> }).catch(() => {});
  }, [conversationId, messages?.length]);

  // ── Send ───────────────────────────────────────────────────────────────
  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending || !conversationId) return;
    setSending(true);
    const currentReplyTo = replyTo;
    setText("");
    setReplyTo(null);
    try {
      await sendMessage({
        conversationId: conversationId as Id<"conversations">,
        text: trimmed,
        ...(currentReplyTo ? { replyToId: currentReplyTo.id } : {}),
      });
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // ── Long-press to select message ───────────────────────────────────────
  const handlePressStart = (msgId: string) => {
    longPressActive.current = false;
    longPressTimer.current = setTimeout(() => {
      longPressActive.current = true;
      setSelectedMsgId(msgId);
    }, 450);
  };

  const handlePressEnd = () => {
    clearTimeout(longPressTimer.current);
  };

  const handleReply = () => {
    if (!selectedMsgId) return;
    const msg = messages?.find(m => m._id === selectedMsgId);
    if (!msg) return;
    const senderName = msg.senderId === me?._id ? "You" : (convo?.other.displayName ?? "");
    setReplyTo({ id: selectedMsgId as Id<"messages">, text: msg.text, senderName });
    setSelectedMsgId(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const initials = convo?.other.displayName.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2) ?? "?";

  return (
    <div
      style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", flexDirection: "column",
        background: STONE, fontFamily: SERIF, overflow: "hidden",
      }}
      onClick={() => { if (!longPressActive.current) setSelectedMsgId(null); }}
    >

      {/* ── Selected-message action bar (overlays header) ── */}
      {selectedMsgId && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, zIndex: 200,
          display: "flex", alignItems: "center", gap: 8,
          padding: "12px 16px",
          background: "#2a1a10",
          boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
        }}>
          <button
            onClick={(e) => { e.stopPropagation(); setSelectedMsgId(null); }}
            style={{ fontSize: 18, color: "#fff", background: "none", border: "none", padding: "4px 8px 4px 0", cursor: "pointer" }}
          >
            ✕
          </button>
          <div style={{ flex: 1 }} />
          <button
            onClick={(e) => { e.stopPropagation(); handleReply(); }}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "rgba(255,255,255,0.12)", border: "none", borderRadius: 20,
              padding: "8px 16px", color: "#fff", fontFamily: SANS, fontSize: 14, cursor: "pointer",
            }}
          >
            ↩ Reply
          </button>
        </div>
      )}

      {/* ── Header ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 16px",
        background: STONE, borderBottom: `1px solid ${CARD_BG}`,
        flexShrink: 0,
      }}>
        <button onClick={() => navigate("/messages")} style={{ fontSize: 20, color: CRIMSON, lineHeight: 1, padding: "4px 8px 4px 0", background: "none", border: "none", cursor: "pointer" }}>
          ←
        </button>
        <div style={{
          width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
          background: convo?.other.avatarUrl ? `url(${convo.other.avatarUrl}) center/cover` : `linear-gradient(135deg, ${CRIMSON}, #3a0010)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, fontWeight: 700, color: "#fff",
        }}>
          {!convo?.other.avatarUrl && initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 700, color: TEXT }}>{convo?.other.displayName ?? "…"}</div>
          <div style={{ fontFamily: SANS, fontSize: 11, color: MUTED }}>Heritage Curator match</div>
        </div>
      </div>

      {/* ── Messages ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 12px 8px", WebkitOverflowScrolling: "touch" } as React.CSSProperties}>
        {messages === undefined && (
          <div style={{ textAlign: "center", paddingTop: 40, color: MUTED, fontStyle: "italic" }}>Loading…</div>
        )}

        {messages?.length === 0 && (
          <div style={{ textAlign: "center", paddingTop: 60 }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>✦</div>
            <div style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 700, color: TEXT, marginBottom: 6 }}>Begin the conversation</div>
            <p style={{ fontFamily: SANS, fontSize: 13, color: MUTED, maxWidth: 220, margin: "0 auto" }}>
              A thoughtful first message goes a long way.
            </p>
          </div>
        )}

        {messages?.map((msg, i) => {
          const isMine  = msg.senderId === me?._id;
          const prevMsg = messages[i - 1];
          const showDate = !prevMsg || new Date(prevMsg.sentAt).toDateString() !== new Date(msg.sentAt).toDateString();
          const isSelected = selectedMsgId === msg._id;

          return (
            <div key={msg._id}>
              {/* Date separator */}
              {showDate && (
                <div style={{
                  textAlign: "center", margin: "16px 0 10px",
                  fontFamily: SANS, fontSize: 11, color: MUTED,
                  letterSpacing: "0.04em",
                }}>
                  <span style={{
                    background: "rgba(122,110,96,0.15)", borderRadius: 12,
                    padding: "3px 10px",
                  }}>
                    {formatDateLabel(msg.sentAt)}
                  </span>
                </div>
              )}

              {/* Message row */}
              <div
                style={{
                  display: "flex",
                  justifyContent: isMine ? "flex-end" : "flex-start",
                  marginBottom: 4,
                  background: isSelected ? "rgba(128,0,32,0.08)" : "transparent",
                  borderRadius: 8,
                  padding: "2px 0",
                  transition: "background 0.15s",
                  userSelect: "none",
                }}
                onMouseDown={() => handlePressStart(msg._id)}
                onMouseUp={handlePressEnd}
                onMouseLeave={handlePressEnd}
                onTouchStart={() => handlePressStart(msg._id)}
                onTouchEnd={handlePressEnd}
                onTouchCancel={handlePressEnd}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{
                  maxWidth: "75%",
                  padding: "8px 12px",
                  borderRadius: isMine ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  background: isMine ? CRIMSON : CARD_BG,
                  color: isMine ? "#fff" : TEXT,
                  fontFamily: SANS,
                  fontSize: 14,
                  lineHeight: 1.5,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                }}>
                  {/* Reply quote */}
                  {msg.replyTo && (
                    <div style={{
                      borderLeft: `3px solid ${isMine ? "rgba(255,255,255,0.5)" : CRIMSON}`,
                      paddingLeft: 8,
                      marginBottom: 6,
                      opacity: 0.85,
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 2, color: isMine ? "rgba(255,255,255,0.9)" : CRIMSON }}>
                        {msg.replyTo.senderName}
                      </div>
                      <div style={{ fontSize: 12, color: isMine ? "rgba(255,255,255,0.75)" : MUTED, lineHeight: 1.3 }}>
                        {msg.replyTo.text.length > 80 ? msg.replyTo.text.slice(0, 80) + "…" : msg.replyTo.text}
                      </div>
                    </div>
                  )}

                  <div>{msg.text}</div>
                  <div style={{ fontSize: 10, marginTop: 4, textAlign: "right", color: isMine ? "rgba(255,255,255,0.6)" : MUTED }}>
                    {formatTime(msg.sentAt)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} style={{ height: 1 }} />
      </div>

      {/* ── Reply preview bar ── */}
      {replyTo && (
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "8px 16px",
          background: CARD_BG,
          borderTop: `2px solid ${CRIMSON}`,
          flexShrink: 0,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: CRIMSON, marginBottom: 2 }}>
              ↩ Replying to {replyTo.senderName}
            </div>
            <div style={{ fontFamily: SANS, fontSize: 12, color: MUTED, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
              {replyTo.text}
            </div>
          </div>
          <button
            onClick={() => setReplyTo(null)}
            style={{ background: "none", border: "none", fontSize: 16, color: MUTED, cursor: "pointer", padding: 4, flexShrink: 0 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Input bar ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 16px",
        paddingBottom: "calc(10px + env(safe-area-inset-bottom, 0px))",
        background: STONE,
        borderTop: `1px solid ${CARD_BG}`,
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
