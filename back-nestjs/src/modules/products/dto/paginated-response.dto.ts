export class PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export class PaginatedResponseDto<T> {
  items: T[];
  meta: PaginationMeta;

  constructor(items: T[], page: number, pageSize: number, total: number) {
    this.items = items;
    this.meta = {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}
