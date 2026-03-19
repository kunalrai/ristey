import { useQuery } from "convex/react";
import { useNavigate } from "react-router-dom";
import { api } from "../../convex/_generated/api";

const CRIMSON = "#800020";
const GOLD    = "#C5A059";
const STONE   = "#F5F0E6";
const CARD_BG = "#EDE8DC";
const TEXT    = "#1a140e";
const MUTED   = "#7a6e60";
const SERIF   = "'Noto Serif', Georgia, serif";
const SANS    = "'Inter', system-ui, sans-serif";

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60000);
  if (mins < 1)   return "just now";
  if (mins < 60)  return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

export default function MessagesPage() {
  const conversations = useQuery(api.chat.getConversations);
  const navigate      = useNavigate();

  return (
    <div style={{ minHeight: "100vh", background: STONE, fontFamily: SERIF, paddingBottom: 80 }}>

      {/* Header */}
      <div style={{ padding: "24px 20px 16px" }}>
        <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 600, color: GOLD, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 6 }}>
          Your Conversations
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: TEXT, lineHeight: 1.1 }}>Messages</h1>
      </div>

      {/* List */}
      <div style={{ padding: "0 16px" }}>
        {conversations === undefined && (
          <div style={{ textAlign: "center", paddingTop: 60, color: MUTED, fontStyle: "italic" }}>
            Loading…
          </div>
        )}

        {conversations?.length === 0 && (
          <div style={{ textAlign: "center", paddingTop: 80 }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>💬</div>
            <div style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 700, color: TEXT, marginBottom: 8 }}>No messages yet</div>
            <p style={{ fontFamily: SANS, fontSize: 13, color: MUTED }}>
              Start a conversation from a match's profile.
            </p>
          </div>
        )}

        {conversations?.map((convo) => {
          const initials = convo.other.displayName.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
          return (
            <div
              key={convo.conversationId}
              onClick={() => navigate(`/chat/${convo.conversationId}`)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 16px",
                background: CARD_BG,
                borderRadius: 14,
                marginBottom: 10,
                cursor: "pointer",
              }}
            >
              {/* Avatar */}
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div style={{
                  width: 50, height: 50, borderRadius: "50%",
                  background: convo.other.avatarUrl ? `url(${convo.other.avatarUrl}) center/cover` : `linear-gradient(135deg, ${CRIMSON}, #3a0010)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, fontWeight: 700, color: "#fff",
                }}>
                  {!convo.other.avatarUrl && initials}
                </div>
                {convo.unread > 0 && (
                  <div style={{
                    position: "absolute", top: -2, right: -2,
                    width: 18, height: 18, borderRadius: "50%",
                    background: CRIMSON, border: `2px solid ${STONE}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: SANS, fontSize: 10, fontWeight: 800, color: "#fff",
                  }}>
                    {convo.unread > 9 ? "9+" : convo.unread}
                  </div>
                )}
              </div>

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                  <span style={{ fontFamily: SERIF, fontSize: 15, fontWeight: convo.unread > 0 ? 700 : 600, color: TEXT }}>
                    {convo.other.displayName}
                  </span>
                  <span style={{ fontFamily: SANS, fontSize: 11, color: MUTED }}>
                    {timeAgo(convo.lastMessageAt)}
                  </span>
                </div>
                <div style={{
                  fontFamily: SANS, fontSize: 13,
                  color: convo.unread > 0 ? TEXT : MUTED,
                  fontWeight: convo.unread > 0 ? 500 : 400,
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>
                  {convo.isMine ? "You: " : ""}{convo.lastMessage ?? "Start the conversation"}
                </div>
              </div>

              <span style={{ color: MUTED, fontSize: 16, flexShrink: 0 }}>›</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
