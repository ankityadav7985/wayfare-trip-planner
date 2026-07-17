import { useReducer, useRef, useCallback } from 'react';
import { parseItinerary, ItineraryParseError } from '../utils/parseItinerary.js';

const initialState = {
  status: 'idle', // 'idle' | 'loading' | 'success' | 'error'
  error: null,
  itinerary: null, // kept around across a failed regenerate, so a bad
  // response never wipes out a plan the user already has and has edited
  expanded: {}, // stopId -> bool, which stop descriptions are open
};

function reducer(state, action) {
  switch (action.type) {
    case 'GENERATE_START':
      return { ...state, status: 'loading', error: null };

    case 'GENERATE_SUCCESS':
      return { ...state, status: 'success', error: null, itinerary: action.itinerary, expanded: {} };

    case 'GENERATE_ERROR':
      return { ...state, status: 'error', error: action.error };

    case 'TOGGLE_EXPAND':
      return { ...state, expanded: { ...state.expanded, [action.stopId]: !state.expanded[action.stopId] } };

    case 'REMOVE_STOP': {
      if (!state.itinerary) return state;
      const days = state.itinerary.days.map((day) =>
        day.id === action.dayId ? { ...day, stops: day.stops.filter((s) => s.id !== action.stopId) } : day
      );
      return { ...state, itinerary: { ...state.itinerary, days } };
    }

    case 'MOVE_STOP': {
      if (!state.itinerary) return state;
      const days = state.itinerary.days.map((day) => {
        if (day.id !== action.dayId) return day;
        const stops = [...day.stops];
        const from = stops.findIndex((s) => s.id === action.stopId);
        const to = from + action.direction;
        if (from === -1 || to < 0 || to >= stops.length) return day;
        [stops[from], stops[to]] = [stops[to], stops[from]];
        return { ...day, stops };
      });
      return { ...state, itinerary: { ...state.itinerary, days } };
    }

    case 'ADD_STOP': {
      if (!state.itinerary) return state;
      const days = state.itinerary.days.map((day) =>
        day.id === action.dayId ? { ...day, stops: [...day.stops, action.stop] } : day
      );
      return { ...state, itinerary: { ...state.itinerary, days } };
    }

    default:
      return state;
  }
}

export function useTripPlanner() {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Guards against the classic race: user fires a second generate before the
  // first one resolves. Only the response matching the latest request id is
  // ever applied; anything else is silently dropped.
  const requestIdRef = useRef(0);
  const abortRef = useRef(null);

  const generate = useCallback(async (description) => {
    const thisRequestId = ++requestIdRef.current;

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const clientTimeout = setTimeout(() => controller.abort(), 45000);

    dispatch({ type: 'GENERATE_START' });

    try {
      const res = await fetch('/api/plan-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
        signal: controller.signal,
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (requestIdRef.current !== thisRequestId) return; // a newer request superseded this one

      if (!res.ok) {
        dispatch({ type: 'GENERATE_ERROR', error: data?.error || `Something went wrong (status ${res.status}).` });
        return;
      }
      if (!data || !data.content) {
        dispatch({ type: 'GENERATE_ERROR', error: 'The server returned an empty response.' });
        return;
      }

      try {
        const itinerary = parseItinerary(data.content);
        if (requestIdRef.current !== thisRequestId) return;
        dispatch({ type: 'GENERATE_SUCCESS', itinerary });
      } catch (parseErr) {
        if (requestIdRef.current !== thisRequestId) return;
        const message = parseErr instanceof ItineraryParseError ? parseErr.message : 'Could not understand the AI response.';
        dispatch({ type: 'GENERATE_ERROR', error: `${message} Try again, or describe the trip differently.` });
      }
    } catch (err) {
      if (requestIdRef.current !== thisRequestId) return;
      if (err.name === 'AbortError') {
        dispatch({ type: 'GENERATE_ERROR', error: 'That took too long and was cancelled. Try again.' });
      } else {
        dispatch({ type: 'GENERATE_ERROR', error: 'Could not reach the server. Is it running?' });
      }
    } finally {
      clearTimeout(clientTimeout);
    }
  }, []);

  const toggleExpand = useCallback((stopId) => dispatch({ type: 'TOGGLE_EXPAND', stopId }), []);
  const removeStop = useCallback((dayId, stopId) => dispatch({ type: 'REMOVE_STOP', dayId, stopId }), []);
  const moveStop = useCallback((dayId, stopId, direction) => dispatch({ type: 'MOVE_STOP', dayId, stopId, direction }), []);
  const addStop = useCallback((dayId, stop) => dispatch({ type: 'ADD_STOP', dayId, stop }), []);

  return { ...state, generate, toggleExpand, removeStop, moveStop, addStop };
}
