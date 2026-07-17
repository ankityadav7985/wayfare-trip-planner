export default function DayTabs({ days, activeId, onSelect }) {
  return (
    <div className="day-tabs" role="tablist" aria-label="Trip days">
      {days.map((day) => (
        <button
          key={day.id}
          type="button"
          role="tab"
          aria-selected={day.id === activeId}
          className={`day-tabs__tab${day.id === activeId ? ' day-tabs__tab--active' : ''}`}
          onClick={() => onSelect(day.id)}
        >
          <span className="day-tabs__num">{String(day.day).padStart(2, '0')}</span>
          <span className="day-tabs__label">{day.label}</span>
        </button>
      ))}
    </div>
  );
}
