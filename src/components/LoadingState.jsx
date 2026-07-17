export default function LoadingState() {
  return (
    <div className="state-panel state-panel--loading" role="status" aria-live="polite">
      <div className="loading-path" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
      <p className="state-panel__text">Charting your itinerary…</p>
    </div>
  );
}
