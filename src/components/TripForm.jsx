import { useState } from 'react';

const EXAMPLES = [
  '5 days in Kyoto and Osaka -- ramen, temples, quiet neighborhoods, mid-range budget',
  'Long weekend road trip up the California coast, love beaches and coffee stops',
  '10 days backpacking Vietnam north to south, budget traveler, street food focus',
];

export default function TripForm({ onSubmit, isLoading }) {
  const [value, setValue] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSubmit(trimmed);
  }

  return (
    <form className="trip-form" onSubmit={handleSubmit}>
      <label className="trip-form__label" htmlFor="trip-description">
        Describe the trip
      </label>
      <textarea
        id="trip-description"
        className="trip-form__textarea"
        placeholder="Where are you going, for how long, and what do you want out of it?"
        value={value}
        maxLength={2000}
        rows={4}
        disabled={isLoading}
        onChange={(e) => setValue(e.target.value)}
      />
      <div className="trip-form__row">
        <div className="trip-form__examples">
          {EXAMPLES.map((example) => (
            <button
              type="button"
              key={example}
              className="trip-form__chip"
              disabled={isLoading}
              onClick={() => setValue(example)}
            >
              {example.length > 42 ? `${example.slice(0, 42)}…` : example}
            </button>
          ))}
        </div>
        <button type="submit" className="trip-form__submit" disabled={isLoading || !value.trim()}>
          {isLoading ? 'Charting…' : 'Chart the trip'}
        </button>
      </div>
    </form>
  );
}
