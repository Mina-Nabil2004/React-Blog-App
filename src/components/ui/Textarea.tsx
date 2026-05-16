import { forwardRef, type TextareaHTMLAttributes } from 'react';

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, Props>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-content-primary">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={`w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-content-primary placeholder:text-content-tertiary transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none ${
            error ? 'border-danger-500' : 'border-surface-border'
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-danger-500">{error}</p>}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
export default Textarea;
