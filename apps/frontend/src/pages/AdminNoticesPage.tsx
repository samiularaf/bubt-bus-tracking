import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { FormField } from '../components/FormField';
import { useToast } from '../components/Toast';
import { mockGetAdminNotices, mockCreateNotice, mockDeleteNotice } from '../features/admin/api';
import type { Notice, NoticeCategory } from '@bubt/shared-types';

const CATEGORIES: NoticeCategory[] = [
  'general',
  'holiday',
  'ramadan',
  'exam',
  'delay',
  'cancellation',
  'emergency',
  'maintenance',
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function AdminNoticesPage() {
  const { showToast } = useToast();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<NoticeCategory>('general');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function refresh() {
    setNotices(await mockGetAdminNotices());
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    await mockCreateNotice(title, body, category);
    setIsSubmitting(false);
    setIsModalOpen(false);
    setTitle('');
    setBody('');
    showToast('Notice published to all users.', 'success');
    refresh();
  }

  async function handleDelete(noticeId: string) {
    await mockDeleteNotice(noticeId);
    showToast('Notice removed.', 'info');
    refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-textPrimary">Notices</h1>
        <Button className="w-auto px-4" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} /> Publish notice
        </Button>
      </div>

      <DataTable
        rows={notices}
        rowKey={(n) => n.id}
        columns={[
          { header: 'Title', render: (n) => <span className="font-semibold">{n.title}</span> },
          { header: 'Category', render: (n) => <span className="capitalize">{n.category}</span> },
          { header: 'Published', render: (n) => formatDate(n.publishedAt) },
          {
            header: '',
            render: (n) => (
              <button
                onClick={() => handleDelete(n.id)}
                aria-label="Delete notice"
                className="text-danger"
              >
                <Trash2 size={15} />
              </button>
            ),
          },
        ]}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Publish a notice">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <FormField
            label="Title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="body" className="text-sm font-medium text-textPrimary">
              Body
            </label>
            <textarea
              id="body"
              required
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="rounded-card border border-border px-4 py-3 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="category" className="text-sm font-medium text-textPrimary">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as NoticeCategory)}
              className="h-12 rounded-card border border-border px-4 text-sm text-textPrimary capitalize focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" isLoading={isSubmitting}>
            Publish to all users
          </Button>
        </form>
      </Modal>
    </div>
  );
}
