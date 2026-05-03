"use client";

import { useState } from "react";

export default function ContactFormSection() {
  const [email, setEmail] = useState("");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!email || !question) {
      setError("Por favor, preencha todos os campos");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/contact-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, question }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setEmail("");
        setQuestion("");
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError(data.error || "Erro ao enviar. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro:", error);
      setError("Erro ao enviar. Verifique sua conexão e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 lg:py-20 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-[11px] font-black tracking-[0.18em] uppercase text-gold-500 mb-2.5">
            Fale com a gente
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-gray-900 mb-3 font-heading tracking-tight">
            Tem uma{" "}
            <em className="italic font-medium bg-linear-to-r from-berry-600 to-rose-500 bg-clip-text text-transparent">
              Dúvida
            </em>
            ? ✨
          </h2>
          <p className="text-gray-600 text-base">
            Envie sua pergunta para nosso time. Respondemos no seu email em
            minutos. 💌
          </p>
        </div>

        <div className="lp-panel-soft rounded-4xl p-1.5 sm:p-2 shadow-[0_12px_28px_-8px_rgba(155,27,90,0.15)]">
          <div className="bg-white rounded-[28px] border border-white/70 p-7 sm:p-9">
            <div className="flex flex-wrap justify-center gap-2.5 mb-6">
              <span className="lp-badge-verified">💬 Resposta rápida</span>
              <span className="lp-badge-gold">📍 Loja física em SP</span>
              <span className="lp-badge-glass">💕 Atendimento com carinho</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[13px] font-semibold text-gray-900 mb-2">
                  Seu email 📧
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  className="lp-input"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-900 mb-2">
                  Sua dúvida 💭
                </label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Descreva sua dúvida de forma clara e detalhada..."
                  rows={5}
                  className="lp-textarea resize-none"
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium">
                  ✓ Dúvida enviada com sucesso! Responderemos em breve.
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="lp-btn-primary w-full text-base disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Enviando..." : "Enviar Dúvida"}
              </button>

              <p className="text-[11px] text-gray-400 text-center">
                Sua pergunta vai para lepmakeup3@gmail.com. Respondemos no seu
                email com carinho 💕
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
