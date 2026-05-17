import type { Blog } from '../../types';
import BlogCard from './BlogCard';
import EmptyState from '../ui/EmptyState';
import type { ReactNode } from 'react';

interface Props {
  blogs: Blog[];
  showActions?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  onDelete?: (blog: Blog) => void;
  onPublish?: (blog: Blog) => void;
  onUnpublish?: (blog: Blog) => void;
  onApprove?: (blog: Blog) => void;
}

export default function BlogGrid({
  blogs,
  showActions,
  emptyTitle = 'No blogs yet',
  emptyDescription,
  emptyAction,
  onDelete,
  onPublish,
  onUnpublish,
  onApprove,
}: Props) {
  if (blogs.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  return (
    <div className={`grid grid-cols-1 gap-6 ${showActions ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
      {blogs.map((blog) => (
        <BlogCard
          key={blog.blogID}
          blog={blog}
          showActions={showActions}
          onDelete={onDelete}
          onPublish={onPublish}
          onUnpublish={onUnpublish}
          onApprove={onApprove}
        />
      ))}
    </div>
  );
}
