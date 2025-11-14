import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '@/lib/api/products';
import { ProductFilters } from '@/types/product.types';
import { CreateProductDto, UpdateProductDto } from '@/lib/validations/product.schema';
import { toast } from 'sonner';
import axios from 'axios';

// Query keys
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters?: ProductFilters) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};

// Hook para listar produtos da ONG
export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => productsApi.getMyProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para obter um produto específico
export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productsApi.getMyProductById(id),
    enabled: !!id,
  });
}

// Hook para criar produto
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProductDto) => {
      try {
        return await productsApi.createProduct(data);
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 400) {
            throw new Error('Dados inválidos. Verifique o formulário.');
          }
          if (error.response?.status === 409) {
            throw new Error('Produto com este nome já existe.');
          }
          if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
          }
        }
        throw new Error('Erro ao criar produto. Tente novamente.');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      toast.success('Produto criado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Hook para atualizar produto
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateProductDto }) => {
      try {
        return await productsApi.updateProduct(id, data);
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 400) {
            throw new Error('Dados inválidos. Verifique o formulário.');
          }
          if (error.response?.status === 404) {
            throw new Error('Produto não encontrado.');
          }
          if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
          }
        }
        throw new Error('Erro ao atualizar produto. Tente novamente.');
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.id) });
      toast.success('Produto atualizado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Hook para deletar produto
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        return await productsApi.deleteProduct(id);
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 404) {
            throw new Error('Produto não encontrado.');
          }
          if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
          }
        }
        throw new Error('Erro ao deletar produto. Tente novamente.');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      toast.success('Produto deletado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
