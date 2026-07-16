function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface MockUserProfile {
  name: string;
  email: string;
  designation: 'student' | 'teacher' | 'staff';
  idNumber: string;
}

export const MOCK_PROFILE: MockUserProfile = {
  name: 'Rafi Ahmed',
  email: 'rafi.ahmed@bubt.edu.bd',
  designation: 'student',
  idNumber: '2023001',
};

export async function mockGetProfile(): Promise<MockUserProfile> {
  await delay(300);
  return MOCK_PROFILE;
}

export async function mockUpdateProfile(input: Partial<MockUserProfile>): Promise<MockUserProfile> {
  await delay(500);
  return { ...MOCK_PROFILE, ...input };
}

export interface MockNotification {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export const MOCK_NOTIFICATIONS: MockNotification[] = [
  {
    id: 'notif-1',
    title: 'Buriganga has started',
    body: 'The bus will depart in approximately five minutes.',
    isRead: false,
    createdAt: new Date(Date.now() - 20 * 60_000).toISOString(),
  },
  {
    id: 'notif-2',
    title: 'Reminder: Padma departs soon',
    body: 'Your 1:30 PM trip departs in 15 minutes.',
    isRead: false,
    createdAt: new Date(Date.now() - 3 * 3600_000).toISOString(),
  },
  {
    id: 'notif-3',
    title: 'New notice published',
    body: 'Mid-term exam week bus schedule has been posted.',
    isRead: true,
    createdAt: new Date(Date.now() - 2 * 86_400_000).toISOString(),
  },
];

export async function mockGetNotifications(): Promise<MockNotification[]> {
  await delay(300);
  return MOCK_NOTIFICATIONS;
}

export const MOCK_FAVORITE_BUS_IDS = new Set<string>(['bus-2']);

export async function mockToggleFavorite(busId: string): Promise<boolean> {
  await delay(250);
  if (MOCK_FAVORITE_BUS_IDS.has(busId)) {
    MOCK_FAVORITE_BUS_IDS.delete(busId);
    return false;
  }
  MOCK_FAVORITE_BUS_IDS.add(busId);
  return true;
}

export const MOCK_REMINDER_TRIP_IDS = new Set<string>();

export async function mockToggleReminder(tripId: string): Promise<boolean> {
  await delay(250);
  if (MOCK_REMINDER_TRIP_IDS.has(tripId)) {
    MOCK_REMINDER_TRIP_IDS.delete(tripId);
    return false;
  }
  MOCK_REMINDER_TRIP_IDS.add(tripId);
  return true;
}

export async function mockSubmitComplaint(subject: string, message: string): Promise<void> {
  await delay(500);
  if (!subject.trim() || !message.trim()) {
    throw new Error('Please fill in both fields.');
  }
}
