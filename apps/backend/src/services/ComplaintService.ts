import { prisma } from '../config/prisma.js';
import type { CreateComplaintInput, PaginationQuery } from '../validation/misc.js';

export class ComplaintService {
  async submit(userId: string, input: CreateComplaintInput) {
    return prisma.complaint.create({ data: { ...input, userId } });
  }

  async list(pagination: PaginationQuery) {
    const [items, total] = await Promise.all([
      prisma.complaint.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        include: { user: { select: { name: true } } },
      }),
      prisma.complaint.count(),
    ]);
    return { items, page: pagination.page, limit: pagination.limit, total };
  }
}

export const complaintService = new ComplaintService();
