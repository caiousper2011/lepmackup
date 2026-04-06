"use client";

import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { LoginModalProvider } from "@/components/LoginModal";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import LoginModal from "@/components/LoginModal";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <LoginModalProvider>
        <CartProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
          <LoginModal />
        </CartProvider>
      </LoginModalProvider>
    </AuthProvider>
  );
}
