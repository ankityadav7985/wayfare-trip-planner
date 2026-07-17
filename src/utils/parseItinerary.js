// This file is the core of "handling bad AI output." The model is asked for
// clean JSON, but in practice it can wrap it in code fences, add a stray
// sentence before or after, leave a trailing comma, or occasionally return
// something that isn't valid JSON at all. Nothing here trusts the model --
// every step degrades gracefully into a clear, user-facing error instead of
// throwing something cryptic or silently rendering broken UI.

export class ItineraryParseError extends Error {}

export function makeId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function extractJsonString(raw) {
  if (typeof raw !== 'string' || !raw.trim()) {
    throw new ItineraryParseError('The AI returned an empty response.');
  }

  let text = raw.trim();

  // Strip ```json ... ``` or plain ``` ... ``` fences, in case the model
  // ignored the "no markdown" instruction.
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    text = fenceMatch[1].trim();
  }

  // If there's still leading/trailing chatter, grab the outermost { ... }.
  if (!text.startsWith('{')) {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) {
      throw new ItineraryParseError("The AI's response didn't contain any JSON.");
    }
    text = text.slice(start, end + 1);
  }

  return text;
}

function safeParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    // One common, easy-to-repair mistake: a trailing comma before } or ].
    const repaired = text.replace(/,\s*([}\]])/g, '$1');
    try {
      return JSON.parse(repaired);
    } catch {
      throw new ItineraryParseError('The AI returned malformed JSON.');
    }
  }
}

/**
 * Parses and validates raw model output into:
 * { title, summary, days: [{ id, day, label, stops: [{ id, time, name, description }] }] }
 * Throws ItineraryParseError with a user-safe message on anything unusable.
 */
export function parseItinerary(raw) {
  const jsonText = extractJsonString(raw);
  const data = safeParse(jsonText);

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new ItineraryParseError('Expected a JSON object describing the trip.');
  }
  if (!Array.isArray(data.days) || data.days.length === 0) {
    throw new ItineraryParseError('The response had no days in it.');
  }

  const days = data.days.map((day, dayIndex) => {
    const rawStops = Array.isArray(day?.stops) ? day.stops : [];
    const stops = rawStops
      .filter((s) => s && (s.name || s.title))
      .map((s) => ({
        id: makeId(),
        time: typeof s.time === 'string' ? s.time : '',
        name: String(s.name || s.title),
        description: typeof s.description === 'string' ? s.description : '',
      }));

    return {
      id: makeId(),
      day: typeof day?.day === 'number' && Number.isFinite(day.day) ? day.day : dayIndex + 1,
      label: typeof day?.label === 'string' && day.label.trim() ? day.label : `Day ${dayIndex + 1}`,
      stops,
    };
  });

  if (days.every((d) => d.stops.length === 0)) {
    throw new ItineraryParseError('The response had days but no usable stops in any of them.');
  }

  return {
    title: typeof data.title === 'string' && data.title.trim() ? data.title : 'Your trip',
    summary: typeof data.summary === 'string' ? data.summary : '',
    days,
  };
}
