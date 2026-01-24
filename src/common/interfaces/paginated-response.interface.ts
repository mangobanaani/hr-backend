export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface CursorPaginationMeta {
  nextCursor: string | null;
  prevCursor: string | null;
  hasNext: boolean;
  hasPrev: boolean;
  limit: number;
}

export interface CursorPaginatedResponse<T> {
  data: T[];
  pagination: CursorPaginationMeta;
}

export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

export function createCursorPaginatedResponse<T extends { id: string }>(
  data: T[],
  limit: number,
  cursor?: string,
): CursorPaginatedResponse<T> {
  const hasNext = data.length > limit;
  const actualData = hasNext ? data.slice(0, -1) : data;

  return {
    data: actualData,
    pagination: {
      nextCursor: hasNext && actualData.length > 0 ? actualData[actualData.length - 1].id : null,
      prevCursor: cursor || null,
      hasNext,
      hasPrev: !!cursor,
      limit,
    },
  };
}
