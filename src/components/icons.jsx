export function IconChevron({ direction = 'down', ...props }) {
  const rotation = direction === 'up' ? 180 : 0;
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ transform: `rotate(${rotation}deg)` }} {...props}>
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconTrash(props) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" {...props}>
      <path
        d="M3 4.5h10M6.5 4.5V3a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1.5M4.5 4.5l.6 8.2a1 1 0 0 0 1 .8h3.8a1 1 0 0 0 1-.8l.6-8.2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconArrow({ direction = 'up', ...props }) {
  const d = direction === 'up' ? 'M8 12V4M4.5 7.5 8 4l3.5 3.5' : 'M8 4v8M4.5 8.5 8 12l3.5-3.5';
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" {...props}>
      <path d={d} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconPlus(props) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" {...props}>
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
