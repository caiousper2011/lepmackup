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

      if (res.ok) {
        setSuccess(true);
        setEmail("");
        setQuestion("");
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError("Erro ao enviar. Tente novamente.");
      }
    } catch {
      setError("Erro ao enviar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 bg-gradient-to-b from-white to-rose-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3 font-[family-name:var(--font-heading)]">
            Tem uma Dúvida? ✨
          </h2>
          <p className="text-gray-600 text-base">
            Envie sua pergunta para nosso time. Responderemos o mais rápido possível!
          </p>
        </div>

        <div className="bg-white rounded-2xl border-2 border-rose-200 p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Seu Email 📧
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-600 focus:border-transparent text-sm"
                disabled={loading}
              />
            </div>

            {/* Question */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Sua Dúvida 💭
              </label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Descreva sua dúvida de forma clara e detalhada..."
                rows={5}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-600 focus:border-transparent text-sm resize-none"
                disabled={loading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="p-3 bg-green-100 border border-green-300 rounded-lg text-green-700 text-sm font-medium">
                ✓ Dúvida enviada com sucesso! Responderemos em breve.
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {loading ? "Enviando..." : "Enviar Dúvida"}
            </button>

            <p className="text-xs text-gray-500 text-center">
              Sua pergunta será enviada para lepmakeup3@gmail.com. Responderemos no seu email! 💌
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
