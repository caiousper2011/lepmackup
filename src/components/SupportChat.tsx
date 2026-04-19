"use client";

import { useState, useEffect, useRef } from "react";

interface Message {
  id: string;
  message: string;
  senderType: "USER" | "ADMIN";
  createdAt: string;
  user: { name: string };
}

export default function SupportChat({
  orderId,
  userId,
}: {
  orderId: string;
  userId: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [orderId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/support/messages?orderId=${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch("/api/support/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          userId,
          message: newMessage,
        }),
      });

      if (res.ok) {
        setNewMessage("");
        await fetchMessages();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <div className="animate-pulse h-64 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col h-96">
      <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
        💬 Suporte ao Pedido
      </h2>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-3 bg-gray-50 rounded-xl p-3">
        {messages.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            Nenhuma mensagem ainda. Envie uma dúvida ou reclamação!
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.senderType === "USER" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                  msg.senderType === "USER"
                    ? "bg-rose-600 text-white"
                    : "bg-white border border-gray-200 text-gray-800"
                }`}
              >
                {msg.senderType === "ADMIN" && (
                  <p className="text-xs font-semibold text-gray-500 mb-1">
                    👨‍💼 Suporte
                  </p>
                )}
                <p>{msg.message}</p>
                <p
                  className={`text-xs mt-1 ${
                    msg.senderType === "USER"
                      ? "text-rose-100"
                      : "text-gray-400"
                  }`}
                >
                  {new Date(msg.createdAt).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Descreva sua dúvida ou reclamação..."
          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-600"
          disabled={sending}
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || sending}
          className="px-4 py-2 bg-rose-600 text-white rounded-lg font-medium text-sm hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {sending ? "..." : "Enviar"}
        </button>
      </form>
    </div>
  );
}
