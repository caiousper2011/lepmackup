import { z } from "zod";

// ============================================
// AUTH
// ============================================

export const sendCodeSchema = z.object({
  email: z.string().email("E-mail inválido").max(255).toLowerCase().trim(),
});

export const verifyCodeSchema = z.object({
  email: z.string().email("E-mail inválido").max(255).toLowerCase().trim(),
  code: z
    .string()
    .length(6, "Código deve ter 6 dígitos")
    .regex(/^\d{6}$/),
});

export const adminLoginSchema = z.object({
  email: z.string().email("E-mail inválido").max(255).toLowerCase().trim(),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres").max(128),
});

export const changePasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, "Mínimo 8 caracteres")
    .max(128)
    .regex(/[A-Z]/, "Deve conter ao menos uma letra maiúscula")
    .regex(/[a-z]/, "Deve conter ao menos uma letra minúscula")
    .regex(/[0-9]/, "Deve conter ao menos um número")
    .regex(/[^A-Za-z0-9]/, "Deve conter ao menos um caractere especial"),
});

// ============================================
// ADDRESS
// ============================================

export const addressSchema = z.object({
  label: z.string().min(1).max(50).default("Casa"),
  street: z.string().min(1, "Rua obrigatória").max(255),
  number: z.string().min(1, "Número obrigatório").max(20),
  complement: z.string().max(255).optional(),
  neighborhood: z.string().min(1, "Bairro obrigatório").max(100),
  city: z.string().min(1, "Cidade obrigatória").max(100),
  state: z.string().length(2, "Use a sigla do estado (ex: SP)").toUpperCase(),
  cep: z.string().regex(/^\d{5}-?\d{3}$/, "CEP inválido"),
  isDefault: z.boolean().optional(),
});

// ============================================
// PRODUCT (admin)
// ============================================

export const productSchema = z.object({
  name: z.string().min(1, "Nome obrigatório").max(255),
  shortName: z.string().min(1).max(100),
  brand: z.string().min(1).max(100),
  category: z.string().min(1).max(100),
  description: z.string().min(1).max(2000),
  details: z.array(z.string().min(1).max(255)).min(1).max(10),
  originalPrice: z.number().positive("Preço deve ser positivo"),
  promoPrice: z.number().positive("Preço promo deve ser positivo"),
  bulkPrice: z.number().positive("Preço atacado deve ser positivo"),
  stockQuantity: z.number().int("Estoque deve ser inteiro").min(0),
  shippingWeightGrams: z
    .number()
    .int("Peso deve ser inteiro em gramas")
    .min(1, "Peso mínimo de 1g")
    .default(50),
  images: z.array(z.string().min(1)).min(1, "Pelo menos 1 imagem"),
  imageExtension: z.string().min(1).max(10),
  tags: z.array(z.string().min(1).max(50)).min(1).max(20),
  active: z.boolean().optional(),
});

export const shippingPackageRuleSchema = z.object({
  name: z.string().min(1, "Nome obrigatório").max(80),
  maxItems: z.number().int("Use número inteiro").min(1),
  widthCm: z.number().int("Use número inteiro").min(1),
  heightCm: z.number().int("Use número inteiro").min(1),
  lengthCm: z.number().int("Use número inteiro").min(1),
  active: z.boolean().optional(),
});

export const shippingSettingsSchema = z.object({
  pickupEnabled: z.boolean(),
  pickupAddress: z.string().min(5, "Endereço de retirada obrigatório").max(255),
  pickupInstructions: z.string().max(500).optional().nullable(),
});

// ============================================
// COUPON (admin)
// ============================================

export const couponSchema = z.object({
  code: z.string().min(3).max(30).toUpperCase().trim(),
  type: z.enum(["PERCENT", "FIXED"]),
  value: z.number().positive(),
  minItems: z.number().int().min(0).default(0),
  minValue: z.number().min(0).default(0),
  maxUses: z.number().int().positive().nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  active: z.boolean().default(true),
});

// ============================================
// ORDER / CHECKOUT
// ============================================

export const checkoutSchema = z
  .object({
    addressId: z.string().min(1, "Endereço obrigatório").optional(),
    shippingMethod: z.string().min(1),
    shippingPrice: z.number().min(0),
    couponCode: z.string().max(30).optional(),
    items: z
      .array(
        z.object({
          productId: z.string().min(1),
          quantity: z.number().int().positive().max(100),
        }),
      )
      .min(1, "Carrinho vazio"),
  })
  .superRefine((data, ctx) => {
    const isPickup = data.shippingMethod === "PICKUP_STORE";

    if (!isPickup && !data.addressId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Endereço obrigatório",
        path: ["addressId"],
      });
    }
  });

// ============================================
// SHIPPING
// ============================================

export const shippingCalcSchema = z.object({
  cep: z.string().regex(/^\d{5}-?\d{3}$/, "CEP inválido"),
  addressId: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive().max(100),
      }),
    )
    .min(1, "Carrinho vazio"),
});

export const couponValidateSchema = z.object({
  code: z.string().min(1).max(30).toUpperCase().trim(),
  itemCount: z.number().int().positive(),
  subtotal: z.number().positive(),
});
