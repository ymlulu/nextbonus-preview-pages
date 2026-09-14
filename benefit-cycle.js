(() => {
  'use strict';

  const TYPES = new Set(['month', 'quarter', 'half-year', 'calendar-year', 'cardmember-year']);
  const pad = value => String(value).padStart(2, '0');
  const dateKey = date => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

  function asDate(value) {
    if (value instanceof Date) return new Date(value.getTime());
    if (typeof value === 'string') {
      const parsed = new Date(`${value.slice(0, 10)}T00:00:00`);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    }
    const parsed = value == null ? new Date() : new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  function currentProductOpened() {
    try {
      const state = JSON.parse(localStorage.getItem('nextbonus-local-v8-state') || '{}');
      const product = (Array.isArray(state.products) ? state.products : []).find(item => item.id === state.currentProductId);
      return product?.opened || null;
    } catch (_) {
      return null;
    }
  }

  function anniversaryInYear(anchor, year) {
    const month = anchor.getMonth();
    const day = anchor.getDate();
    const candidate = new Date(year, month, day);
    if (candidate.getMonth() === month) return candidate;
    return new Date(year, month + 1, 0);
  }

  function cardmemberYear(value, anchorValue) {
    const date = asDate(value);
    const anchor = asDate(anchorValue || currentProductOpened());
    if (!date || !anchor) return null;
    let start = anniversaryInYear(anchor, date.getFullYear());
    if (date < start) start = anniversaryInYear(anchor, date.getFullYear() - 1);
    const next = anniversaryInYear(anchor, start.getFullYear() + 1);
    const end = new Date(next.getFullYear(), next.getMonth(), next.getDate() - 1);
    return {
      cycleType: 'cardmember-year',
      id: `${dateKey(start)}__${dateKey(end)}`,
      start,
      end,
      legacyId: `${dateKey(start)}:${dateKey(end)}`,
      anchor: dateKey(anchor)
    };
  }

  function current(cycleType, value, anchorValue) {
    if (!TYPES.has(cycleType)) return null;
    if (cycleType === 'cardmember-year') return cardmemberYear(value, anchorValue);
    const date = asDate(value);
    if (!date) return null;
    const year = date.getFullYear();
    const month = date.getMonth();
    let start;
    let end;
    let id;
    if (cycleType === 'month') {
      start = new Date(year, month, 1);
      end = new Date(year, month + 1, 0);
      id = `${year}-${pad(month + 1)}`;
    } else if (cycleType === 'quarter') {
      const quarter = Math.floor(month / 3) + 1;
      start = new Date(year, (quarter - 1) * 3, 1);
      end = new Date(year, quarter * 3, 0);
      id = `${year}-Q${quarter}`;
    } else if (cycleType === 'half-year') {
      const half = month < 6 ? 1 : 2;
      start = new Date(year, half === 1 ? 0 : 6, 1);
      end = new Date(year, half === 1 ? 6 : 12, 0);
      id = `${year}-H${half}`;
    } else {
      start = new Date(year, 0, 1);
      end = new Date(year, 11, 31);
      id = String(year);
    }
    return { cycleType, id, start, end, legacyId: `${dateKey(start)}:${dateKey(end)}` };
  }

  function cycleId(cycleType, value, anchorValue) {
    return current(cycleType, value, anchorValue)?.id || null;
  }

  window.NextBonusBenefitCycle = Object.freeze({ types: Object.freeze([...TYPES]), current, cycleId });
})();
