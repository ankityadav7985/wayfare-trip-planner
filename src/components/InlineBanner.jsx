export default function InlineBanner({ tone, children, onRetry }) {
  return (
    <div className={`inline-banner inline-banner--${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      <span className="inline-banner__text">{children}</span>
      {onRetry && (
        <button type="button" className="inline-banner__retry" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
