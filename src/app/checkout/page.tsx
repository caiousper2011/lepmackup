"use client";

import { useState, useEffect, useCallback } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/data/products";
import Image from "next/image";
import Link from "next/link";

interface Address {
  id: string;
  label: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  cep: string;
  isDefault: boolean;
}

interface ShippingOption {
  serviceId: number | null;
  method: string;
  name: string;
  price: number;
  estimatedDays: string;
  companyId: number | null;
  companyName: string | null;
}

interface PickupSettings {
  pickupEnabled: boolean;
  pickupAddress: string;
  pickupInstructions?: string | null;
}

interface CouponResult {
  valid: boolean;
  discount: number;
  appliesTo?: string;
  message?: string;
}

function normalizeCpfCnpj(value: string): string {
  return value.replace(/\D/g, "");
}

function formatCpfCnpj(value: string): string {
  const digits = normalizeCpfCnpj(value);

  if (digits.length <= 11) {
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }

  return digits
    .slice(0, 14)
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

export default function CheckoutPage() {
  const { items, totalQuantity, totalPrice, getItemUnitPrice } = useCart();
  const { user, refresh } = useAuth();

  const [guestEmail, setGuestEmail] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: "Casa",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "SP",
    cep: "",
  });

  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<string>("");
  const [selectedShippingServiceId, setSelectedShippingServiceId] = useState<
    number | null
  >(null);
  const [selectedShippingCompanyId, setSelectedShippingCompanyId] = useState<
    number | null
  >(null);
  const [selectedShippingDescription, setSelectedShippingDescription] =
    useState<string>("");
  const [shippingPrice, setShippingPrice] = useState(0);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [pickupSettings, setPickupSettings] = useState<PickupSettings | null>(
    null,
  );

  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] = useState<CouponResult | null>(null);
  const [loadingCoupon, setLoadingCoupon] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch addresses
  useEffect(() => {
    async function fetchAddresses() {
      try {
        const res = await fetch("/api/addresses");
        if (res.ok) {
          const data = await res.json();
          setAddresses(data.addresses);
          const defaultAddr = data.addresses.find((a: Address) => a.isDefault);
          if (defaultAddr) setSelectedAddress(defaultAddr.id);
        }
      } catch {
        // ignore
      }
    }
    fetchAddresses();
  }, []);

  useEffect(() => {
    async function prefillFromPreviousOrder() {
      if (!user) return;

      try {
        const res = await fetch("/api/orders", { cache: "no-store" });
        if (!res.ok) return;

        const data = await res.json();
        const orders = Array.isArray(data.orders) ? data.orders : [];

        const previousWithDocument = orders.find(
          (order: { addressSnapshot?: { cpfCnpj?: unknown } }) =>
            typeof order?.addressSnapshot?.cpfCnpj === "string" &&
            order.addressSnapshot.cpfCnpj.trim().length > 0,
        );

        if (
          previousWithDocument?.addressSnapshot?.cpfCnpj &&
          normalizeCpfCnpj(cpfCnpj).length === 0
        ) {
          setCpfCnpj(
            formatCpfCnpj(previousWithDocument.addressSnapshot.cpfCnpj),
          );
        }

        if (
          previousWithDocument?.addressSnapshot?.customerName &&
          customerName.trim().length === 0
        ) {
          setCustomerName(previousWithDocument.addressSnapshot.customerName);
        }
      } catch {
        // ignore prefill errors
      }
    }

    prefillFromPreviousOrder();
  }, [user, cpfCnpj, customerName]);

  // Calculate shipping when address changes
  const calcShipping = useCallback(
    async (cep: string) => {
      if (!cep || cep.replace(/\D/g, "").length < 8) return;
      setLoadingShipping(true);
      setShippingOptions([]);
      setSelectedShippingServiceId(null);
      setSelectedShippingCompanyId(null);
      setSelectedShippingDescription("");
      setError("");
      try {
        const res = await fetch("/api/shipping/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cep: cep.replace(/\D/g, ""),
            items: items.map((item) => ({
              productId: item.product.id,
              quantity: item.quantity,
            })),
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Erro ao calcular frete. Verifique o CEP.");
          setShippingOptions([]);
          return;
        }

        const options: ShippingOption[] = Array.isArray(data.quotes)
          ? data.quotes.map(
              (quote: {
                serviceId: number | null;
                method: string;
                description: string;
                price: number;
                estimatedDays: number;
                companyId: number | null;
                companyName: string | null;
              }) => ({
                serviceId: quote.serviceId ?? null,
                method: quote.method,
                name: quote.description,
                price: quote.price,
                companyId: quote.companyId ?? null,
                companyName: quote.companyName ?? null,
                estimatedDays:
                  quote.method === "LOCAL_FREE"
                    ? "Entrega em até 1 dia útil"
                    : quote.estimatedDays > 0
                      ? `${quote.estimatedDays} dias úteis`
                      : "Retirada combinada após confirmação",
              }),
            )
          : [];

        if (options.length === 0) {
          setError("Nenhuma opção de frete disponível para este CEP.");
          return;
        }

        setShippingOptions(options);
        if (options.length > 0) {
          const current = options.find(
            (option) => option.method === selectedShipping,
          );

          if (current) {
            setSelectedShippingServiceId(current.serviceId);
            setSelectedShippingCompanyId(current.companyId);
            setSelectedShippingDescription(current.name);
            setShippingPrice(current.price);
          } else {
            setSelectedShipping(options[0].method);
            setSelectedShippingServiceId(options[0].serviceId);
            setSelectedShippingCompanyId(options[0].companyId);
            setSelectedShippingDescription(options[0].name);
            setShippingPrice(options[0].price);
          }
        }

        // Save pickup settings from response
        if (data.settings) {
          setPickupSettings(data.settings);
        }
      } catch {
        setError("Erro de conexão ao calcular frete. Tente novamente.");
        setShippingOptions([]);
      } finally {
        setLoadingShipping(false);
      }
    },
    [items, selectedShipping],
  );

  const lookupCepInCheckout = async (cep: string) => {
    const cleaned = cep.replace(/\D/g, "");
    if (cleaned.length !== 8) return;

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
      const data = await res.json();

      if (!data.erro) {
        setNewAddress((prev) => ({
          ...prev,
          street: data.logradouro || prev.street,
          neighborhood: data.bairro || prev.neighborhood,
          city: data.localidade || prev.city,
          state: data.uf || prev.state,
        }));
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (selectedAddress) {
      const addr = addresses.find((a) => a.id === selectedAddress);
      if (addr) calcShipping(addr.cep);
    }
  }, [selectedAddress, addresses, calcShipping]);

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) return;
    setLoadingCoupon(true);
    setCouponResult(null);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode.trim(),
          itemCount: totalQuantity,
          subtotal: totalPrice,
          shippingPrice,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCouponResult({
          valid: true,
          discount: data.discount,
          appliesTo: data.coupon?.appliesTo,
        });
      } else {
        setCouponResult({ valid: false, discount: 0, message: data.error });
      }
    } catch {
      setCouponResult({
        valid: false,
        discount: 0,
        message: "Erro ao validar cupom.",
      });
    } finally {
      setLoadingCoupon(false);
    }
  };

  const handleSaveAddress = async () => {
    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAddress),
      });
      if (res.ok) {
        const data = await res.json();
        setAddresses((prev) => [...prev, data.address]);
        setSelectedAddress(data.address.id);
        setShowNewAddress(false);
        setNewAddress({
          label: "Casa",
          street: "",
          number: "",
          complement: "",
          neighborhood: "",
          city: "",
          state: "SP",
          cep: "",
        });
      }
    } catch {
      setError("Erro ao salvar endereço.");
    }
  };

  const handleCheckout = async () => {
    const isPickup = selectedShipping === "PICKUP_STORE";

    if (!isPickup && !selectedAddress) {
      setError("Selecione um endereço de entrega.");
      return;
    }
    if (!selectedShipping) {
      setError("Selecione um método de envio.");
      return;
    }

    if (
      selectedShipping.startsWith("MELHOR_ENVIO_") &&
      !selectedShippingServiceId
    ) {
      setError(
        "Service ID do frete inválido. Recalcule e selecione o frete novamente.",
      );
      return;
    }

    const normalizedDocument = normalizeCpfCnpj(cpfCnpj);
    if (![11, 14].includes(normalizedDocument.length)) {
      setError("Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido.");
      return;
    }

    if (!customerName.trim() || customerName.trim().length < 2) {
      setError("Informe o nome completo do destinatário.");
      return;
    }

    setLoading(true);
    setError("");

    // If not logged in, authenticate with email first
    if (!user) {
      if (!guestEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
        setError("Informe um e-mail válido para continuar.");
        setLoading(false);
        return;
      }

      setAuthLoading(true);
      try {
        const authRes = await fetch("/api/auth/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: guestEmail }),
        });

        if (!authRes.ok) {
          const authData = await authRes.json();
          setError(authData.error || "Erro ao processar e-mail.");
          setLoading(false);
          setAuthLoading(false);
          return;
        }

        await refresh();
      } catch {
        setError("Erro de conexão. Tente novamente.");
        setLoading(false);
        setAuthLoading(false);
        return;
      }
      setAuthLoading(false);
    }

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addressId: isPickup ? undefined : selectedAddress,
          shippingMethod: selectedShipping,
          melhorEnvioServiceId: selectedShippingServiceId ?? undefined,
          melhorEnvioCompanyId: selectedShippingCompanyId ?? undefined,
          shippingDescription: selectedShippingDescription || undefined,
          shippingPrice: isPickup ? 0 : shippingPrice,
          cpfCnpj: normalizedDocument,
          customerName: customerName.trim(),
          couponCode: couponResult?.valid ? couponCode : undefined,
          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao criar pedido.");
        setLoading(false);
        return;
      }

      // Redirect to Mercado Pago
      if (data.initPoint) {
        window.location.href = data.initPoint;
      } else {
        setError("Erro ao iniciar pagamento. Tente novamente.");
        setLoading(false);
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
      setLoading(false);
    }
  };

  const discount = couponResult?.valid ? couponResult.discount : 0;
  const finalTotal = Math.max(0, totalPrice + shippingPrice - discount);

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-10 h-10 text-rose-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Carrinho vazio</h1>
        <p className="text-gray-500 mb-6">
          Adicione produtos antes de ir ao checkout.
        </p>
        <Link
          href="/"
          className="inline-block bg-rose-600 hover:bg-rose-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          Ver Produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        Finalizar Compra
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Email section (guest checkout) */}
          {!user && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Seu E-mail
              </h2>
              <p className="text-xs text-gray-500 mb-4">
                Informe seu e-mail para receber a confirmação do pedido. Não é
                necessário criar conta.
              </p>
              <input
                type="email"
                placeholder="seu@email.com"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                autoComplete="email"
              />
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Dados do Destinatário
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Obrigatório para cálculo e emissão da etiqueta de frete.
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Nome completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nome do destinatário"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all ${
                    customerName.trim().length > 0 &&
                    customerName.trim().length < 2
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200"
                  }`}
                  autoComplete="name"
                />
                {customerName.trim().length > 0 &&
                  customerName.trim().length < 2 && (
                    <p className="text-xs text-red-500 mt-1">
                      Nome deve ter no mínimo 2 caracteres.
                    </p>
                  )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  CPF ou CNPJ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  value={cpfCnpj}
                  onChange={(e) => {
                    const digits = normalizeCpfCnpj(e.target.value).slice(
                      0,
                      14,
                    );
                    setCpfCnpj(formatCpfCnpj(digits));
                  }}
                  className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all ${
                    cpfCnpj.length > 0 &&
                    ![11, 14].includes(normalizeCpfCnpj(cpfCnpj).length)
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200"
                  }`}
                  autoComplete="off"
                  inputMode="numeric"
                />
                {cpfCnpj.length > 0 &&
                  ![11, 14].includes(normalizeCpfCnpj(cpfCnpj).length) && (
                    <p className="text-xs text-red-500 mt-1">
                      Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido.
                    </p>
                  )}
              </div>
            </div>
          </div>

          {/* Address section */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Endereço de Entrega
            </h2>

            {pickupSettings?.pickupEnabled && (
              <p className="text-xs text-gray-500 mb-3">
                Se preferir, você também pode escolher retirada no endereço da
                loja no método de envio.
              </p>
            )}

            {addresses.length > 0 && (
              <div className="space-y-2 mb-4">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedAddress === addr.id
                        ? "border-rose-500 bg-rose-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      value={addr.id}
                      checked={selectedAddress === addr.id}
                      onChange={() => setSelectedAddress(addr.id)}
                      className="mt-1 accent-rose-600"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {addr.label}{" "}
                        {addr.isDefault && (
                          <span className="text-xs text-rose-600">
                            (padrão)
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        {addr.street}, {addr.number}
                        {addr.complement ? ` - ${addr.complement}` : ""} —{" "}
                        {addr.neighborhood}, {addr.city}/{addr.state} — CEP{" "}
                        {addr.cep}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowNewAddress(!showNewAddress)}
              className="text-sm font-medium text-rose-600 hover:text-rose-700 transition-colors"
            >
              + Novo endereço
            </button>

            {showNewAddress && (
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Rótulo (ex: Casa)"
                    value={newAddress.label}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, label: e.target.value })
                    }
                    className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  <input
                    type="text"
                    placeholder="CEP"
                    value={newAddress.cep}
                    onChange={(e) =>
                      setNewAddress({
                        ...newAddress,
                        cep: e.target.value.replace(/\D/g, "").slice(0, 8),
                      })
                    }
                    onBlur={(e) => lookupCepInCheckout(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Rua"
                    value={newAddress.street}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, street: e.target.value })
                    }
                    className="col-span-2 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  <input
                    type="text"
                    placeholder="Nº"
                    value={newAddress.number}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, number: e.target.value })
                    }
                    className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Complemento"
                    value={newAddress.complement}
                    onChange={(e) =>
                      setNewAddress({
                        ...newAddress,
                        complement: e.target.value,
                      })
                    }
                    className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  <input
                    type="text"
                    placeholder="Bairro"
                    value={newAddress.neighborhood}
                    onChange={(e) =>
                      setNewAddress({
                        ...newAddress,
                        neighborhood: e.target.value,
                      })
                    }
                    className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Cidade"
                    value={newAddress.city}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, city: e.target.value })
                    }
                    className="col-span-2 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  <input
                    type="text"
                    placeholder="UF"
                    maxLength={2}
                    value={newAddress.state}
                    onChange={(e) =>
                      setNewAddress({
                        ...newAddress,
                        state: e.target.value.toUpperCase(),
                      })
                    }
                    className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <button
                  onClick={handleSaveAddress}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
                >
                  Salvar Endereço
                </button>
              </div>
            )}
          </div>

          {/* Shipping section */}
          {shippingOptions.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Método de Envio
              </h2>
              <div className="space-y-2">
                {shippingOptions.map((opt) => (
                  <label
                    key={opt.method}
                    className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedShipping === opt.method
                        ? "border-rose-500 bg-rose-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shipping"
                        value={opt.method}
                        checked={selectedShipping === opt.method}
                        onChange={() => {
                          setSelectedShipping(opt.method);
                          setSelectedShippingServiceId(opt.serviceId);
                          setSelectedShippingCompanyId(opt.companyId);
                          setSelectedShippingDescription(opt.name);
                          setShippingPrice(opt.price);
                        }}
                        className="accent-rose-600"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {opt.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {opt.estimatedDays}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-rose-600">
                      {opt.price === 0 ? "Grátis!" : formatPrice(opt.price)}
                    </span>
                  </label>
                ))}
              </div>
              {loadingShipping && (
                <p className="text-xs text-gray-400 mt-2">
                  Calculando frete...
                </p>
              )}

              {selectedShipping === "PICKUP_STORE" && pickupSettings && (
                <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                  <p className="text-sm font-medium text-emerald-800">
                    Retirada no endereço
                  </p>
                  <p className="text-xs text-emerald-700 mt-1">
                    {pickupSettings.pickupAddress}
                  </p>
                  {pickupSettings.pickupInstructions && (
                    <p className="text-xs text-emerald-700 mt-1">
                      {pickupSettings.pickupInstructions}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Coupon */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Cupom de Desconto
            </h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Código do cupom"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <button
                onClick={handleValidateCoupon}
                disabled={loadingCoupon || !couponCode.trim()}
                className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl text-sm transition-colors disabled:opacity-50"
              >
                {loadingCoupon ? "..." : "Aplicar"}
              </button>
            </div>
            {couponResult && (
              <p
                className={`text-sm mt-2 ${couponResult.valid ? "text-green-600" : "text-red-500"}`}
              >
                {couponResult.valid
                  ? `Cupom aplicado! Desconto de ${formatPrice(couponResult.discount)}`
                  : couponResult.message}
              </p>
            )}
          </div>
        </div>

        {/* Right column - Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-28">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Resumo do Pedido
            </h2>

            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 relative">
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.shortName}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.product.shortName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.quantity}x{" "}
                      {formatPrice(getItemUnitPrice(item.product))}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatPrice(
                      item.quantity * getItemUnitPrice(item.product),
                    )}
                  </span>
                </div>
              ))}
            </div>

            <hr className="border-gray-100 mb-4" />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">
                  Subtotal ({totalQuantity} itens)
                </span>
                <span className="text-gray-900">{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Frete</span>
                <span
                  className={
                    shippingPrice === 0
                      ? "text-green-600 font-medium"
                      : "text-gray-900"
                  }
                >
                  {shippingPrice === 0 ? "Grátis" : formatPrice(shippingPrice)}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Desconto</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <hr className="border-gray-100" />
              <div className="flex justify-between text-lg font-bold">
                <span className="text-gray-900">Total</span>
                <span className="text-rose-600">{formatPrice(finalTotal)}</span>
              </div>
            </div>

            {totalQuantity >= 4 && (
              <div className="mt-3 bg-green-50 border border-green-200 rounded-xl p-2 text-center">
                <p className="text-xs text-green-700 font-medium">
                  Desconto ativado! R$ 6,99 por item
                </p>
              </div>
            )}

            {error && (
              <div className="mt-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3">
                {error}
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={
                loading ||
                authLoading ||
                !selectedShipping ||
                (selectedShipping !== "PICKUP_STORE" && !selectedAddress) ||
                (!user && !guestEmail) ||
                ![11, 14].includes(normalizeCpfCnpj(cpfCnpj).length) ||
                customerName.trim().length < 2
              }
              className="w-full mt-4 bg-linear-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-base"
            >
              {authLoading
                ? "Verificando e-mail..."
                : loading
                  ? "Processando..."
                  : `Pagar ${formatPrice(finalTotal)}`}
            </button>

            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-400">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              Pagamento seguro via Mercado Pago
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
