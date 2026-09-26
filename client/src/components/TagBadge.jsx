/**
 * High-contrast, responsive tag badge component.
 * Prevents text overflow, guarantees WCAG AA contrast, and differentiates Teach vs Learn tags clearly.
 */
export const TagBadge = ({
  tag,
  type = 'neutral', // 'teach' | 'learn' | 'neutral'
  onRemove,
  size = 'md', // 'sm' | 'md'
  className = '',
}) => {
  const tagName = typeof tag === 'string' ? tag : tag?.name || '';

  const typeStyles = {
    teach: 'bg-indigo-50 text-indigo-900 border-indigo-200 hover:border-indigo-300 hover:bg-indigo-100/70',
    learn: 'bg-teal-50 text-teal-900 border-teal-200 hover:border-teal-300 hover:bg-teal-100/70',
    neutral: 'bg-slate-100 text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-200/70',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2.5 py-0.5',
    md: 'text-xs px-3 py-1',
  };

  return (
    <span
      title={tagName}
      className={`inline-flex items-center gap-1.5 max-w-full font-medium rounded-full border transition-colors shadow-2xs ${
        typeStyles[type] || typeStyles.neutral
      } ${sizeStyles[size] || sizeStyles.md} ${className}`}
    >
      <span className="truncate max-w-[220px] sm:max-w-[300px]">
        {tagName}
      </span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 -mr-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full hover:bg-black/10 active:scale-90 transition-transform"
          aria-label={`Remove ${tagName}`}
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
};

export default TagBadge;
