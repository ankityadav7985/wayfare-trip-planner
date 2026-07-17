import { useState, useEffect } from 'react';
import DayTabs from './DayTabs.jsx';
import StopCard from './StopCard.jsx';
import AddStopForm from './AddStopForm.jsx';
import { makeId } from '../utils/parseItinerary.js';

export default function ItineraryView({ itinerary, expanded, onToggleExpand, onRemoveStop, onMoveStop, onAddStop }) {
  const [activeDayId, setActiveDayId] = useState(itinerary.days[0]?.id);

  // If the active day was removed (e.g. a regenerate produced fewer days),
  // fall back to the first day instead of rendering nothing.
  useEffect(() => {
    if (!itinerary.days.some((d) => d.id === activeDayId)) {
      setActiveDayId(itinerary.days[0]?.id);
    }
  }, [itinerary, activeDayId]);

  const activeDay = itinerary.days.find((d) => d.id === activeDayId) || itinerary.days[0];

  return (
    <section className="itinerary">
      <header className="itinerary__header">
        <h1 className="itinerary__title">{itinerary.title}</h1>
        {itinerary.summary && <p className="itinerary__summary">{itinerary.summary}</p>}
      </header>

      <DayTabs days={itinerary.days} activeId={activeDay?.id} onSelect={setActiveDayId} />

      <div className="itinerary__tear" aria-hidden="true" />

      {activeDay && (
        <>
          {activeDay.stops.length === 0 ? (
            <p className="itinerary__empty-day">No stops on this day yet. Add one below.</p>
          ) : (
            <ul className="stop-list">
              {activeDay.stops.map((stop, index) => (
                <StopCard
                  key={stop.id}
                  stop={stop}
                  index={index}
                  total={activeDay.stops.length}
                  expanded={!!expanded[stop.id]}
                  onToggle={() => onToggleExpand(stop.id)}
                  onRemove={() => onRemoveStop(activeDay.id, stop.id)}
                  onMove={(direction) => onMoveStop(activeDay.id, stop.id, direction)}
                />
              ))}
            </ul>
          )}

          <AddStopForm
            onAdd={(stop) =>
              onAddStop(activeDay.id, { id: makeId(), time: stop.time, name: stop.name, description: stop.description })
            }
          />
        </>
      )}
    </section>
  );
}
