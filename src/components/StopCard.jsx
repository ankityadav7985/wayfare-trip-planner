import { IconChevron, IconTrash, IconArrow } from './icons.jsx';

export default function StopCard({ stop, index, total, expanded, onToggle, onRemove, onMove }) {
  return (
    <li className="stop">
      <div className="stop__order">
        <button
          type="button"
          className="stop__move"
          onClick={() => onMove(-1)}
          disabled={index === 0}
          aria-label="Move stop earlier"
        >
          <IconArrow direction="up" />
        </button>
        <button
          type="button"
          className="stop__move"
          onClick={() => onMove(1)}
          disabled={index === total - 1}
          aria-label="Move stop later"
        >
          <IconArrow direction="down" />
        </button>
      </div>

      <div className="stop__body">
        <button type="button" className="stop__header" onClick={onToggle} aria-expanded={expanded}>
          {stop.time && <span className="stop__time">{stop.time}</span>}
          <span className="stop__name">{stop.name}</span>
          {stop.description && (
            <span className="stop__chevron">
              <IconChevron direction={expanded ? 'up' : 'down'} />
            </span>
          )}
        </button>
        {expanded && stop.description && <p className="stop__description">{stop.description}</p>}
      </div>

      <button type="button" className="stop__remove" onClick={onRemove} aria-label={`Remove ${stop.name}`}>
        <IconTrash />
      </button>
    </li>
  );
}
