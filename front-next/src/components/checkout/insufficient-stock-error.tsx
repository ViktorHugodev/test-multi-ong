import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface StockError {
  productId: string;
  productName: string;
  requested: number;
  available: number;
}

interface Props {
  errors: StockError[];
  onRemoveItems: () => void;
  onAdjustQuantities: () => void;
  onCancel: () => void;
}

export function InsufficientStockError({
  errors,
  onRemoveItems,
  onAdjustQuantities,
  onCancel,
}: Props) {
  return (
    <Card className="border-destructive">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <CardTitle>Estoque Insuficiente</CardTitle>
        </div>
        <CardDescription>
          Alguns produtos não têm estoque disponível para a quantidade solicitada
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {errors.map((error) => (
          <Alert key={error.productId} variant="destructive">
            <AlertTitle>{error.productName}</AlertTitle>
            <AlertDescription>
              Solicitado: {error.requested} | Disponível: {error.available}
            </AlertDescription>
          </Alert>
        ))}
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="outline" onClick={onCancel}>
          Voltar ao Carrinho
        </Button>
        <Button variant="secondary" onClick={onAdjustQuantities}>
          Ajustar Quantidades
        </Button>
        <Button variant="destructive" onClick={onRemoveItems}>
          Remover Itens
        </Button>
      </CardFooter>
    </Card>
  );
}
