import type { ReactNode } from 'react';
import { FileText } from 'lucide-react';

interface Props {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({ icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-muted text-content-tertiary">
        {icon ?? <FileText size={28} />}
      </div>
      <h3 className="text-lg font-semibold text-content-primary">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-content-secondary">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
