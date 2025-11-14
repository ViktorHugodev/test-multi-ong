import { HttpException, HttpStatus } from '@nestjs/common';

export interface StockError {
  productId: string;
  productName: string;
  requested: number;
  available: number;
}

export class InsufficientStockException extends HttpException {
  constructor(public readonly stockErrors: StockError[]) {
    super(
      {
        statusCode: HttpStatus.CONFLICT,
        error: 'INSUFFICIENT_STOCK',
        message: 'Estoque insuficiente para concluir o pedido',
        details: stockErrors,
      },
      HttpStatus.CONFLICT,
    );
  }
}
