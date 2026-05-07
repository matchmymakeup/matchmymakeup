// Dropdown — v2.1 selectable list vocabulary.
//
// Closed: pill-shaped trigger matching PillButton secondary. Open: panel
// floats below the trigger. Selected option in the open list takes the
// monochrome-differentiated treatment (BG_OFFWHITE row + 2px BORDER_ACTIVE
// left edge) per Artefact 6 §3.3.
//
// Demo-velocity choice: panel floats below on all viewports (no separate
// mobile bottom-sheet). If polish pass wants a bottom-sheet variant on
// small screens, add later — single-implementation now.
//
// Used for ColorScanner facets (Category, Skin Tone, Occasion, Language,
// Shop In) and Landing's consultant selector.
//
// Props:
//   label        — placeholder for the unselected state
//   value        — current selected value (matches one option.value)
//   options      — array of { value, label, icon? }
//   onChange     — (newValue) => void
//   placeholder  — optional override for unselected display text
//   disabled     — boolean, default false
//   width        — optional fixed pixel width (default: content-width via minWidth 120)
//   align        — 'left' (default) | 'center' — content+caret cluster alignment within trigger

import { useState, useRef, useEffect } from 'react';
import { BG_WHITE, BG_OFFWHITE, INK_PRIMARY, INK_SECONDARY, HAIRLINE, BORDER_ACTIVE } from '../lib/design-tokens';

const SANS = "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif";

export default function Dropdown({
  label,
  value,
  options = [],
  onChange,
  placeholder,
  disabled = false,
  width,
  align = 'left',
}) {
  const [open, setOpen] = useState(false);
  const [hoverTrigger, setHoverTrigger] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    function onEsc(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  const selected = options.find(o => o.value === value);
  const displayText = selected?.label || placeholder || label || 'Select';

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={() => { if (!disabled) setOpen(o => !o); }}
        onMouseEnter={() => { if (!disabled) setHoverTrigger(true); }}
        onMouseLeave={() => setHoverTrigger(false)}
        disabled={disabled}
        style={{
          background: BG_WHITE,
          border: `2px solid ${hoverTrigger ? BORDER_ACTIVE : HAIRLINE}`,
          borderRadius: 999,
          padding: '12px 18px',
          cursor: disabled ? 'default' : 'pointer',
          opacity: disabled ? 0.4 : 1,
          fontSize: 13,
          fontWeight: 600,
          color: selected ? INK_PRIMARY : INK_SECONDARY,
          fontFamily: SANS,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          transition: 'border-color 120ms ease',
          minWidth: 120,
          width: width || undefined,
          boxSizing: 'border-box',
          justifyContent: align === 'center' ? 'center' : 'space-between',
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          {selected?.icon && <span style={{ fontSize: 14, lineHeight: 1 }}>{selected.icon}</span>}
          <span>{displayText}</span>
        </span>
        <span style={{ fontSize: 11, color: INK_SECONDARY, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 120ms ease' }}>▾</span>
      </button>

      {open && (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            minWidth: '100%',
            background: BG_WHITE,
            border: `1px solid ${HAIRLINE}`,
            borderRadius: 14,
            padding: 6,
            boxShadow: '0 6px 24px rgba(0,0,0,0.08)',
            zIndex: 50,
            maxHeight: 280,
            overflowY: 'auto',
            fontFamily: SANS,
          }}
        >
          {options.map(opt => (
            <DropdownItem
              key={opt.value}
              option={opt}
              selected={opt.value === value}
              onSelect={() => {
                onChange?.(opt.value);
                setOpen(false);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function DropdownItem({ option, selected, onSelect }) {
  const [hover, setHover] = useState(false);
  // Selected: BG_OFFWHITE row + 2px BORDER_ACTIVE left edge.
  // Unselected hover: subtle pure-black tint (rgba(0,0,0,0.03)).
  const bg = selected
    ? BG_OFFWHITE
    : (hover ? 'rgba(0,0,0,0.03)' : 'transparent');
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={onSelect}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: '100%',
        textAlign: 'left',
        background: bg,
        border: 'none',
        borderLeft: selected ? `2px solid ${BORDER_ACTIVE}` : '2px solid transparent',
        borderRadius: 10,
        padding: '10px 14px',
        cursor: 'pointer',
        fontSize: 13,
        fontWeight: selected ? 600 : 500,
        color: INK_PRIMARY,
        fontFamily: 'inherit',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        transition: 'background 120ms ease',
      }}
    >
      {option.icon && <span style={{ fontSize: 16, lineHeight: 1 }}>{option.icon}</span>}
      <span>{option.label}</span>
    </button>
  );
}
