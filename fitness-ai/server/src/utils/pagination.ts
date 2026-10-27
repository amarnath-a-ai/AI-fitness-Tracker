import { Request } from 'express';

interface PaginationResult {
  page: number;
  limit: number;
  skip: number;
  sort: Record<string, 1 | -1>;
  filter: Record<string, any>;
}

export const getPagination = (query: any): PaginationResult => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit) || 10));
  const skip = (page - 1) * limit;

  // Sorting
  const sort: Record<string, 1 | -1> = {};
  if (query.sortBy) {
    const order = query.order === 'asc' ? 1 : -1;
    sort[query.sortBy] = order;
  } else {
    sort.createdAt = -1;
  }

  // Basic filtering
  const filter: Record<string, any> = {};
  if (query.search) {
    filter.$text = { $search: query.search };
  }

  return { page, limit, skip, sort, filter };
};

export const createPaginatedResponse = (
  data: any[],
  total: number,
  page: number,
  limit: number
) => {
  return {
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
};
