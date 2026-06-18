import { useState } from 'react';

export default function PinPad({ maxLength = 6, onSubmit, submitting, error }) {
  const [pin, setPin] = useState('');

  const press = (digit) => {
    if (pin.length >= maxLength) return;
    setPin((p) => p + digit);
  };

  const backspace = () => setPin((p) => p.slice(0, -1));
  const clear = () => setPin('');

  const handleSubmit = () => {
    if (pin.length < 4) return;
    onSubmit(pin);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-2">
        {Array.from({ length: maxLength }).map((_, i) => (
          <span
            key={i}
            className={`w-3.5 h-3.5 rounded-full border-2 ${
              i < pin.length ? 'bg-primary border-primary' : 'border-ink/20'
            }`}
          />
        ))}
      </div>

      {error && <p className="text-danger text-sm">{error}</p>}

      <div className="grid grid-cols-3 gap-3">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => press(d)}
            className="pin-key w-16 h-16 rounded-full bg-white shadow-card text-xl font-display font-semibold text-ink hover:bg-surface active:scale-95 transition"
          >
            {d}
          </button>
        ))}
        <button
          type="button"
          onClick={clear}
          className="pin-key w-16 h-16 rounded-full text-sm text-ink/50 hover:text-ink"
        >
          Borrar todo
        </button>
        <button
          type="button"
          onClick={() => press('0')}
          className="pin-key w-16 h-16 rounded-full bg-white shadow-card text-xl font-display font-semibold text-ink hover:bg-surface active:scale-95 transition"
        >
          0
        </button>
        <button
          type="button"
          onClick={backspace}
          className="pin-key w-16 h-16 rounded-full text-sm text-ink/50 hover:text-ink"
        >
          ⌫
        </button>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={pin.length < 4 || submitting}
        className="mt-2 w-full max-w-[13rem] py-3 rounded-card bg-accent text-white font-medium disabled:opacity-40"
      >
        {submitting ? 'Ingresando…' : 'Ingresar'}
      </button>
    </div>
  );
}
