export default function ErrorState({ message, onRetry }) {
  return (
    <div className="state-panel state-panel--error" role="alert">
      <h2 className="state-panel__title">The itinerary didn't come back clean</h2>
      <p className="state-panel__text">{message}</p>
      <button type="button" className="state-panel__retry" onClick={onRetry}>
        Try again
      </button>
    </div>
  );
}
