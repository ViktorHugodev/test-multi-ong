export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  status: 'pending' | 'payment_processing' | 'confirmed' | 'failed' | 'cancelled';
  totalAmount: string | number;
  shippingCost?: string | number;
  shippingDetails: ShippingDetails;
  paymentMethod: string;
  transactionId?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  customer?: {
    id: string;
    email: string;
    fullName: string;
  };
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  organizationId: string;
  productName: string;
  productPrice: string | number;
  quantity: number;
  subtotal: string | number;
  weightGrams: number;
  product?: {
    id: string;
    name: string;
    imageUrl?: string;
  };
}

export interface ShippingDetails {
  recipientName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
}

export interface CreateOrderDto {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  shippingDetails: ShippingDetails;
  paymentMethod: string;
  idempotencyKey?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
