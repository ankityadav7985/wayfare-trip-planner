import { useState, useCallback } from 'react';
import TripForm from './components/TripForm.jsx';
import ItineraryView from './components/ItineraryView.jsx';
import LoadingState from './components/LoadingState.jsx';
import ErrorState from './components/ErrorState.jsx';
import EmptyState from './components/EmptyState.jsx';
import InlineBanner from './components/InlineBanner.jsx';
import { useTripPlanner } from './hooks/useTripPlanner.js';

export default function App() {
  const { status, error, itinerary, expanded, generate, toggleExpand, removeStop, moveStop, addStop } = useTripPlanner();

  const [lastDescription, setLastDescription] = useState('');

  const handleSubmit = useCallback(
    (description) => {
      setLastDescription(description);
      generate(description);
    },
    [generate]
  );

  const handleRetry = useCallback(() => {
    if (lastDescription) generate(lastDescription);
  }, [lastDescription, generate]);

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__wordmark">Wayfare</div>
        <p className="app__tagline">Describe a trip. Get a plan you can actually edit.</p>
      </header>

      <main className="app__main">
        <TripForm onSubmit={handleSubmit} isLoading={status === 'loading'} />

        <div className="app__result">
          {/*
            A failed or in-flight regenerate never hides an itinerary the
            user already has -- it only gets a small banner. The full-panel
            states below are only for when there's nothing to show yet.
          */}
          {!itinerary && status === 'idle' && <EmptyState />}
          {!itinerary && status === 'loading' && <LoadingState />}
          {!itinerary && status === 'error' && <ErrorState message={error} onRetry={handleRetry} />}

          {itinerary && (
            <>
              {status === 'loading' && <InlineBanner tone="loading">Regenerating your itinerary…</InlineBanner>}
              {status === 'error' && (
                <InlineBanner tone="error" onRetry={handleRetry}>
                  {error}
                </InlineBanner>
              )}
              <ItineraryView
                itinerary={itinerary}
                expanded={expanded}
                onToggleExpand={toggleExpand}
                onRemoveStop={removeStop}
                onMoveStop={moveStop}
                onAddStop={addStop}
              />
            </>
          )}
        </div>
      </main>

      <footer className="app__footer">Built for a trip, not a database -- refreshing the page clears it.</footer>
    </div>
  );
}
