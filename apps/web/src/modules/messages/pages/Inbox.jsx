import { useEffect, useState } from "react";
import { getInbox } from "../services/messageService";
import { useNavigate } from "react-router-dom";
import { InboxListSkeleton } from "../components/ChartSkeleton";

export default function Inbox() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInbox();
  }, []);

  const fetchInbox = async () => {
    setLoading(true);
    const res = await getInbox();
    if (res.success) {
      setConversations(res.data);
    }
    setLoading(false);
  };

  return (
    <div>
      <h2>Inbox</h2>

      {loading ? (
        <InboxListSkeleton count={6} />
      ) : (
        conversations.map((conv) => (
          <div
            key={conv.user.id}
            onClick={() => navigate(`/messages/${conv.user.id}`)}
            style={{ cursor: "pointer", marginBottom: "10px" }}
          >
            <p>
              <b>{conv.user.username}</b>
            </p>
            <p>{conv.last_message}</p>
            <small>Unread: {conv.unread_count}</small>
          </div>
        ))
      )}
    </div>
  );
}
