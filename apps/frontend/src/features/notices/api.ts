import type { Notice, NoticeCategory } from '@bubt/shared-types';

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const MOCK_NOTICES: Notice[] = [
  {
    id: 'notice-1',
    title: 'Eid-ul-Fitr Bus Schedule',
    body: 'All bus routes will remain suspended from 09 March to 26 March for Eid-ul-Fitr. Regular schedule resumes 27 March, with separate Sun-Thu and Friday timings. Saturday remains a no-service day.',
    category: 'holiday' as NoticeCategory,
    createdBy: 'admin-1',
    publishedAt: '2026-03-09T08:00:00.000Z',
  },
  {
    id: 'notice-2',
    title: 'Padma bus running 10 minutes late',
    body: 'Due to traffic congestion near Agargaon, the Padma bus is running approximately 10 minutes behind schedule on its afternoon trip. We apologize for the inconvenience.',
    category: 'delay' as NoticeCategory,
    createdBy: 'admin-1',
    publishedAt: new Date(Date.now() - 3 * 3600_000).toISOString(),
  },
  {
    id: 'notice-3',
    title: 'Mid-term exam week bus schedule',
    body: 'During mid-term exam week, all buses will run an additional midday trip at 11:30 AM to accommodate exam schedules. Check individual bus pages for updated times.',
    category: 'exam' as NoticeCategory,
    createdBy: 'admin-1',
    publishedAt: new Date(Date.now() - 2 * 86_400_000).toISOString(),
  },
];

export async function mockGetNotices(): Promise<Notice[]> {
  await delay(350);
  return MOCK_NOTICES;
}

export async function mockGetNotice(id: string): Promise<Notice | undefined> {
  await delay(250);
  return MOCK_NOTICES.find((n) => n.id === id);
}
