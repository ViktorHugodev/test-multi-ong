import { z } from 'zod';

export const checkoutSchema = z.object({
  recipientName: z
    .string()
    .min(3, 'Nome deve ter ao menos 3 caracteres')
    .max(100, 'Nome muito longo'),

  address: z
    .string()
    .min(5, 'Endereço deve ter ao menos 5 caracteres')
    .max(200, 'Endereço muito longo'),

  city: z
    .string()
    .min(2, 'Cidade deve ter ao menos 2 caracteres')
    .max(100, 'Cidade muito longa'),

  state: z
    .string()
    .length(2, 'Estado deve ter 2 caracteres (ex: SP)')
    .toUpperCase(),

  zipCode: z
    .string()
    .regex(/^\d{5}-?\d{3}$/, 'CEP inválido (ex: 12345-678)')
    .transform((val) => val.replace('-', '')),

  phone: z
    .string()
    .min(10, 'Telefone deve ter ao menos 10 dígitos')
    .regex(/^[\d\s\(\)\-]+$/, 'Telefone inválido (use apenas números, parênteses, espaços e traço)')
    .transform((val) => val.replace(/\D/g, ''))
    .refine((val) => val.length === 10 || val.length === 11, {
      message: 'Telefone deve ter 10 ou 11 dígitos',
    }),

  paymentMethod: z
    .enum(['pix', 'credit_card', 'debit_card', 'boleto'], {
      errorMap: () => ({ message: 'Selecione um método de pagamento' }),
    }),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
