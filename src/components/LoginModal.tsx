"use client";

import { useState, useRef, useEffect, createContext, useContext } from "react";
import { useAuth } from "@/context/AuthContext";

// Modal state context
interface LoginModalContextType {
  isOpen: boolean;
  open: (redirect?: string) => void;
  close: () => void;
  redirectTo: string | null;
}

const LoginModalContext = createContext<LoginModalContextType>({
  isOpen: false,
  open: () => {},
  close: () => {},
  redirectTo: null,
});

export function useLoginModal() {
  return useContext(LoginModalContext);
}

export function LoginModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);

  const open = (redirect?: string) => {
    setRedirectTo(redirect || null);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setRedirectTo(null);
  };

  return (
    <LoginModalContext.Provider value={{ isOpen, open, close, redirectTo }}>
      {children}
    </LoginModalContext.Provider>
  );
}

export default function LoginModal() {
  const { isOpen, close, redirectTo } = useLoginModal();
  const { login, verifyCode, user } = useAuth();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Close if user logged in
  useEffect(() => {
    if (user && isOpen) {
      close();
      if (redirectTo) {
        window.location.href = redirectTo;
      }
    }
  }, [user, isOpen, close, redirectTo]);

  // Countdown for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    const result = await login(email);
    setLoading(false);

    if (result.success) {
      if (result.message) setInfo(result.message);
      setStep("code");
      setCountdown(60);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } else {
      setError(result.error || "Erro ao enviar código.");
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits filled
    const fullCode = newCode.join("");
    if (fullCode.length === 6) {
      handleVerify(fullCode);
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted.length === 6) {
      const newCode = pasted.split("");
      setCode(newCode);
      handleVerify(pasted);
    }
  };

  const handleVerify = async (fullCode: string) => {
    setError("");
    setInfo("");
    setLoading(true);

    const result = await verifyCode(email, fullCode);
    setLoading(false);

    if (result.success) {
      // Close handled by useEffect watching user
    } else {
      setError(result.error || "Código inválido.");
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setError("");
    setInfo("");
    setLoading(true);
    const result = await login(email);
    setLoading(false);
    if (result.success) {
      if (result.message) setInfo(result.message);
      setCountdown(60);
    } else {
      setError(result.error || "Erro ao reenviar.");
    }
  };

  const handleClose = () => {
    close();
    // Reset state
    setTimeout(() => {
      setStep("email");
      setEmail("");
      setCode(["", "", "", "", "", ""]);
      setError("");
      setInfo("");
      setLoading(false);
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] transition-opacity"
        onClick={handleClose}
      />
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative animate-fade-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Fechar"
          >
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Logo */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-full gradient-berry flex items-center justify-center mx-auto mb-3 shadow-lg shadow-berry-600/20">
              <span className="text-white font-bold text-lg">L&P</span>
            </div>
            <h2 className="text-lg font-bold text-gray-900 font-[family-name:var(--font-heading)]">
              {step === "email" ? "Entrar na sua conta" : "Digite o código"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {step === "email"
                ? "Enviaremos um código para seu e-mail"
                : `Código enviado para ${email}`}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3 mb-4">
              {error}
            </div>
          )}

          {info && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm rounded-xl p-3 mb-4">
              {info}
            </div>
          )}

          {step === "email" ? (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  E-mail
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  autoFocus
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-berry-600 focus:border-transparent transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !email}
                className="w-full gradient-cta text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-berry-600/20"
              >
                {loading ? "Enviando..." : "Enviar Código"}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              {/* OTP inputs */}
              <div
                className="flex justify-center gap-2"
                onPaste={handleCodePaste}
              >
                {code.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      inputRefs.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(i, e.target.value)}
                    onKeyDown={(e) => handleCodeKeyDown(i, e)}
                    className="w-11 h-13 text-center text-xl font-bold border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-berry-600 focus:border-transparent transition-all"
                    disabled={loading}
                  />
                ))}
              </div>

              {/* Resend */}
              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-sm text-gray-400">
                    Reenviar em {countdown}s
                  </p>
                ) : (
                  <button
                    onClick={handleResend}
                    disabled={loading}
                    className="text-sm text-berry-600 hover:text-berry-700 font-medium transition-colors"
                  >
                    Reenviar código
                  </button>
                )}
              </div>

              {/* Back */}
              <button
                onClick={() => {
                  setStep("email");
                  setCode(["", "", "", "", "", ""]);
                  setError("");
                  setInfo("");
                }}
                className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                ← Usar outro e-mail
              </button>
            </div>
          )}

          <p className="text-[10px] text-gray-400 text-center mt-4">
            Ao continuar, você aceita nossos Termos de Uso e Política de
            Privacidade.
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-up {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-up {
          animation: fade-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
