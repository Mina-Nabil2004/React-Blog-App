import type { Blog } from '../../types';

type Props = Pick<Blog, 'published' | 'approved'>;

export default function BlogStatusBadge({ published, approved }: Props) {
  if (published && approved) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-success-500/10 px-2.5 py-0.5 text-xs font-medium text-success-500">
        <span className="h-1.5 w-1.5 rounded-full bg-success-500" />
        Published
      </span>
    );
  }
  if (published && !approved) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-warning-500/10 px-2.5 py-0.5 text-xs font-medium text-warning-500">
        <span className="h-1.5 w-1.5 rounded-full bg-warning-500" />
        Pending Approval
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-medium text-content-tertiary">
      <span className="h-1.5 w-1.5 rounded-full bg-content-tertiary" />
      Draft
    </span>
  );
}
