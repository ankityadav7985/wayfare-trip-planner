import { useState } from 'react';
import { IconPlus } from './icons.jsx';

export default function AddStopForm({ onAdd }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');

  function reset() {
    setName('');
    setTime('');
    setDescription('');
    setOpen(false);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({ name: name.trim(), time: time.trim(), description: description.trim() });
    reset();
  }

  if (!open) {
    return (
      <button type="button" className="add-stop__toggle" onClick={() => setOpen(true)}>
        <IconPlus /> Add a stop
      </button>
    );
  }

  return (
    <form className="add-stop" onSubmit={handleSubmit}>
      <div className="add-stop__row">
        <input
          className="add-stop__input add-stop__input--time"
          placeholder="Time (optional)"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
        <input
          className="add-stop__input add-stop__input--name"
          placeholder="Stop name"
          value={name}
          autoFocus
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <textarea
        className="add-stop__input add-stop__input--desc"
        placeholder="Details (optional)"
        rows={2}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div className="add-stop__actions">
        <button type="button" className="add-stop__cancel" onClick={reset}>
          Cancel
        </button>
        <button type="submit" className="add-stop__save" disabled={!name.trim()}>
          Add stop
        </button>
      </div>
    </form>
  );
}
