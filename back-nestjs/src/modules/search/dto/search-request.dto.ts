import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para requisições POST de busca
 * Permite queries mais complexas e maior privacidade
 */
export class SearchRequestDto {
  /**
   * Query de busca do usuário
   * Exemplo: "doces baratos abaixo de 10 reais"
   */
  @IsString()
  query: string;

  /**
   * Número da página (começa em 1)
   * @default 1
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  /**
   * Itens por página
   * @default 20
   * @max 100
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;
}
