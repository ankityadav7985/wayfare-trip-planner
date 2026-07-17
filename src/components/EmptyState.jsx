export default function EmptyState() {
  return (
    <div className="state-panel state-panel--empty">
      <div className="state-panel__mark" aria-hidden="true">
        ✦
      </div>
      <h2 className="state-panel__title">No trip charted yet</h2>
      <p className="state-panel__text">
        Describe where you're headed above and Wayfare lays out a day-by-day plan you can edit, reorder, and check off.
      </p>
    </div>
  );
}
