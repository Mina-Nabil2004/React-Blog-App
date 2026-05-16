interface Props {
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
}

const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' };

export default function LoadingSpinner({ size = 'md', fullPage }: Props) {
  const spinner = (
    <svg
      className={`${sizes[size]} animate-spin text-primary-500`}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );

  if (fullPage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-muted">
        {spinner}
      </div>
    );
  }

  return spinner;
}
