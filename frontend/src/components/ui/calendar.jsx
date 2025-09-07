import React, { useMemo } from 'react';
import './calendar.css';

const pad = n => (n < 10 ? `0${n}` : `${n}`);
const formatISO = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export default function Calendar({ month, onMonthChange, value, onChange }) {
  const firstOfMonth = useMemo(() => new Date(month.getFullYear(), month.getMonth(), 1), [month]);
  const start = useMemo(() => {
    const d = new Date(firstOfMonth);
    const day = d.getDay(); // 0 Sun - 6 Sat
    d.setDate(d.getDate() - ((day + 6) % 7)); // start from Monday
    return d;
  }, [firstOfMonth]);

  const days = useMemo(() => {
    const arr = [];
    const cursor = new Date(start);
    for (let i = 0; i < 42; i++) {
      arr.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    return arr;
  }, [start]);

  const isSameDay = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  const monthLabel = month.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div>
      <div className="calendar-header">
        <button className="calendar-nav-btn" onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>{'<'}</button>
        <div className="calendar-month">{monthLabel}</div>
        <button className="calendar-nav-btn" onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>{'>'}</button>
      </div>
      <div className="calendar-grid">
        {["Mo","Tu","We","Th","Fr","Sa","Su"].map(d => (
          <div key={d} className="calendar-weekday">{d}</div>
        ))}
        {days.map((d) => {
          const inMonth = d.getMonth() === month.getMonth();
          const selected = value ? isSameDay(d, value) : false;
          return (
            <div
              key={formatISO(d)}
              className={`calendar-cell ${inMonth ? '' : 'muted'} ${selected ? 'selected' : ''}`}
              onClick={() => onChange && onChange(new Date(d))}
            >
              {d.getDate()}
            </div>
          );
        })}
      </div>
    </div>
  );
}


