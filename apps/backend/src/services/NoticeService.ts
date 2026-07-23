import { prisma } from '../config/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import type { CreateNoticeInput, UpdateNoticeInput } from '../validation/misc.js';
import type { NoticeCategory } from '@prisma/client';
import type { PaginationQuery } from '../validation/misc.js';

export class NoticeService {
  async list(pagination: PaginationQuery, category?: NoticeCategory) {
    const where = category ? { category } : {};
    const [items, total] = await Promise.all([
      prisma.notice.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      prisma.notice.count({ where }),
    ]);
    return { items, page: pagination.page, limit: pagination.limit, total };
  }

  async get(noticeId: string) {
    const notice = await prisma.notice.findUnique({ where: { id: noticeId } });
    if (!notice) throw new AppError('NOT_FOUND', 'Notice not found.', 404);
    return notice;
  }

  /** Publishing triggers a push + in-app notification to all users — wired up in Phase 10. */
  async publish(adminUserId: string, input: CreateNoticeInput) {
    return prisma.notice.create({ data: { ...input, createdBy: adminUserId } });
  }

  async update(noticeId: string, input: UpdateNoticeInput) {
    const notice = await prisma.notice.findUnique({ where: { id: noticeId } });
    if (!notice) throw new AppError('NOT_FOUND', 'Notice not found.', 404);
    return prisma.notice.update({ where: { id: noticeId }, data: input });
  }

  async delete(noticeId: string): Promise<void> {
    const notice = await prisma.notice.findUnique({ where: { id: noticeId } });
    if (!notice) throw new AppError('NOT_FOUND', 'Notice not found.', 404);
    await prisma.notice.delete({ where: { id: noticeId } });
  }
}

export const noticeService = new NoticeService();
