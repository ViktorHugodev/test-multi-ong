// DTOs para criação e atualização de produtos
export interface CreateProductDto {
  name: string;
  description?: string;
  price: number | string;
  category: string;
  imageUrl?: string;
  stockQty: number;
  weightGrams: number;
  sku?: string;
  isActive?: boolean;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number | string;
  category?: string;
  imageUrl?: string;
  stockQty?: number;
  weightGrams?: number;
  sku?: string;
  isActive?: boolean;
}
