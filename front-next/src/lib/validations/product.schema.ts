import { z } from 'zod';

// Schema de validação para criação de produto
export const createProductSchema = z.object({
  name: z
    .string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  description: z
    .string()
    .min(10, 'Descrição deve ter no mínimo 10 caracteres')
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres')
    .optional(),
  price: z
    .number({ message: 'Preço deve ser um número' })
    .positive('Preço deve ser maior que zero')
    .max(999999, 'Preço muito alto'),
  category: z
    .string()
    .min(1, 'Categoria é obrigatória')
    .max(50, 'Categoria deve ter no máximo 50 caracteres'),
  imageUrl: z
    .string()
    .url('URL da imagem inválida')
    .optional()
    .or(z.literal('')),
  stockQty: z
    .number({ message: 'Quantidade deve ser um número' })
    .int('Quantidade deve ser um número inteiro')
    .min(0, 'Estoque não pode ser negativo')
    .max(999999, 'Quantidade em estoque muito alta'),
  weightGrams: z
    .number({ message: 'Peso deve ser um número' })
    .positive('Peso deve ser maior que zero')
    .max(999999, 'Peso muito alto'),
  sku: z
    .string()
    .max(50, 'SKU deve ter no máximo 50 caracteres')
    .optional(),
  isActive: z.boolean().optional().default(true),
});

// Schema de validação para atualização de produto
export const updateProductSchema = createProductSchema.partial();

// DTOs derivados dos schemas
export type CreateProductDto = z.infer<typeof createProductSchema>;
export type UpdateProductDto = z.infer<typeof updateProductSchema>;
