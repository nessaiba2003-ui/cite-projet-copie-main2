const ACADEMIC_HOLIDAYS_2025_2026 = [
  { start: '2025-09-05', end: '2025-09-07', title: 'Aid Al Mawlid' },
  { start: '2025-11-06', end: '2025-11-07', title: 'Marche Verte' },
  { start: '2025-11-18', end: '2025-11-19', title: 'Fete de l Independance' },
  { start: '2026-01-01', end: '2026-01-02', title: 'Nouvel An' },
  { start: '2026-01-11', end: '2026-01-12', title: 'Manifeste de l Independance' },
  { start: '2026-01-14', end: '2026-01-15', title: 'Nouvel An Amazigh' },
  { start: '2026-01-25', end: '2026-02-02', title: 'Vacances de fin du 1er semestre' },
  { start: '2026-03-19', end: '2026-03-23', title: 'Aid Al Fitr' },
  { start: '2026-05-01', end: '2026-05-11', title: 'Fete du Travail et vacances de printemps' },
  { start: '2026-05-26', end: '2026-05-30', title: 'Aid Al Adha' },
  { start: '2026-06-16', end: '2026-06-17', title: 'Nouvel An Hijri' },
];

const DAY_MS = 24 * 60 * 60 * 1000;

export function toDateKey(value) {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getAcademicHolidays() {
  return ACADEMIC_HOLIDAYS_2025_2026;
}

export function isAcademicHoliday(date) {
  const key = toDateKey(date);
  return ACADEMIC_HOLIDAYS_2025_2026.some((holiday) => key >= holiday.start && key < holiday.end);
}

export function findAcademicHolidayInRange(start, end) {
  if (!start || !end) return null;
  const cursor = new Date(start);
  const last = new Date(end);
  if (Number.isNaN(cursor.getTime()) || Number.isNaN(last.getTime())) return null;

  while (cursor < last) {
    const key = toDateKey(cursor);
    const holiday = ACADEMIC_HOLIDAYS_2025_2026.find(
      (item) => key >= item.start && key < item.end,
    );
    if (holiday) return holiday;
    cursor.setTime(cursor.getTime() + DAY_MS);
    cursor.setHours(0, 0, 0, 0);
  }

  return null;
}
