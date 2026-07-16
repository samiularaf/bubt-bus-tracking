import type { ReactNode } from 'react';

export interface DataTableColumn<T> {
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  emptyMessage?: string;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  emptyMessage = 'No records yet.',
}: DataTableProps<T>) {
  if (rows.length === 0) {
    return <p className="text-sm text-textSecondary text-center py-10">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-card border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-background text-left">
            {columns.map((col) => (
              <th key={col.header} className="px-4 py-2.5 font-semibold text-textSecondary text-xs">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)} className="border-t border-border hover:bg-background/60">
              {columns.map((col) => (
                <td
                  key={col.header}
                  className={`px-4 py-3 text-textPrimary ${col.className ?? ''}`}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
