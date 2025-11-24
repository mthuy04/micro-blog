import { useEffect, useState, useRef } from "react";
import MainLayout from "../components/layout/MainLayout";
import api from "../api/client"; // Import axios instance trực tiếp
import { getImageUrl } from "../utils/env";
import { getCurrentUser } from "../api/client";
import { Send } from "lucide-react";

export default function MessagesPage() {
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const currentUser = getCurrentUser();
  const scrollRef = useRef();

  // 1. Load danh sách user để chat
  useEffect(() => {
    api.get("/conversations").then(res => setConversations(res.data));
  }, []);

  // 2. Polling: Lấy tin nhắn mỗi 2 giây
  useEffect(() => {
    if (!activeChat) return;
    const fetchMsgs = () => {
        api.get(`/messages/${activeChat.id}`).then(res => setMessages(res.data));
    };
    fetchMsgs(); // Gọi ngay
    const interval = setInterval(fetchMsgs, 2000); // Gọi lặp lại
    return () => clearInterval(interval);
  }, [activeChat]);

  // 3. Scroll xuống cuối khi có tin nhắn mới
  useEffect(() => {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
      e.preventDefault();
      if(!text.trim()) return;
      await api.post("/messages", { receiver_id: activeChat.id, body: text });
      setText("");
      // Reload ngay lập tức để thấy tin nhắn
      const res = await api.get(`/messages/${activeChat.id}`);
      setMessages(res.data);
  };

  return (
    <MainLayout active="/messages">
      <div className="flex h-screen pt-0 w-full">
          {/* Sidebar Chat List */}
          <div className="w-80 border-r border-slate-200 bg-white overflow-y-auto pb-20 pt-20 lg:pt-0">
              <div className="p-4 font-bold text-xl border-b border-slate-100 sticky top-0 bg-white z-10">Messages</div>
              {conversations.map(c => (
                  <div key={c.id} onClick={() => setActiveChat(c)} className={`p-4 flex gap-3 cursor-pointer hover:bg-slate-50 ${activeChat?.id === c.id ? "bg-indigo-50" : ""}`}>
                      <img src={getImageUrl(c.avatar)} className="w-10 h-10 rounded-full object-cover" />
                      <div>
                          <div className="font-bold text-sm">{c.name}</div>
                          <div className="text-xs text-slate-500">Click to chat</div>
                      </div>
                  </div>
              ))}
          </div>

          {/* Chat Window */}
          <div className="flex-1 flex flex-col bg-white h-full pt-16 lg:pt-0 relative">
              {activeChat ? (
                  <>
                    {/* Header */}
                    <div className="p-4 border-b border-slate-100 flex items-center gap-3 shadow-sm z-10">
                        <img src={getImageUrl(activeChat.avatar)} className="w-8 h-8 rounded-full" />
                        <span className="font-bold">{activeChat.name}</span>
                    </div>
                    
                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
                        {messages.map(m => {
                            const isMe = m.sender_id === currentUser.id;
                            return (
                                <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                    <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${isMe ? "bg-indigo-600 text-white rounded-br-none" : "bg-slate-100 text-slate-800 rounded-bl-none"}`}>
                                        {m.body}
                                    </div>
                                </div>
                            )
                        })}
                        <div ref={scrollRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="p-4 border-t border-slate-100 absolute bottom-0 w-full bg-white lg:static lg:mb-0 mb-16">
                        <div className="flex gap-2">
                            <input value={text} onChange={e => setText(e.target.value)} className="flex-1 p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100" placeholder="Type a message..." />
                            <button type="submit" className="p-3 bg-indigo-600 text-white rounded-xl"><Send className="w-5 h-5" /></button>
                        </div>
                    </form>
                  </>
              ) : (
                  <div className="flex-1 flex items-center justify-center text-slate-400">Select a conversation</div>
              )}
          </div>
      </div>
    </MainLayout>
  );
}