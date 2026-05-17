import { resolveImageUrl } from '../../utils/imageUrl';

interface Props {
  name: string;
  avatarUrl?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  xs: 'h-7 w-7 text-xs',
  sm: 'h-8 w-8 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-24 w-24 text-3xl',
};

export default function Avatar({ name, avatarUrl, size = 'sm', className = '' }: Props) {
  const url = resolveImageUrl(avatarUrl);
  const base = `${sizeMap[size]} rounded-full shrink-0 ${className}`;

  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className={`${base} object-cover border-2 border-surface-border`}
      />
    );
  }

  return (
    <div className={`${base} flex items-center justify-center bg-primary-100 font-semibold text-primary-600`}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
