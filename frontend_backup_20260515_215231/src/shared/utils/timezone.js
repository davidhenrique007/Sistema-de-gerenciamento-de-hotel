export const getSystemTimezone = () => {
  const saved = localStorage.getItem('hotel_timezone');
  if (saved) return saved;
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Maputo';
};

export const getAvailableTimezones = () => [
  { value: 'Africa/Maputo', label: 'Maputo (GMT+2)' },
  { value: 'Africa/Johannesburg', label: 'Johannesburg (GMT+2)' },
  { value: 'UTC', label: 'UTC' },
  { value: 'Europe/Lisbon', label: 'Lisbon (GMT+0/+1)' },
  { value: 'Europe/London', label: 'London (GMT+0/+1)' },
  { value: 'America/New_York', label: 'New York (GMT-4/-5)' },
  { value: 'America/Sao_Paulo', label: 'Sao Paulo (GMT-3)' },
  { value: 'Asia/Dubai', label: 'Dubai (GMT+4)' }
];

export const formatDate = (date, timezone = null, locale = 'pt-PT') => {
  const tz = timezone || getSystemTimezone();
  const d = new Date(date);
  return d.toLocaleString(locale, { timeZone: tz });
};

export const formatDateTime = (date, timezone = null, locale = 'pt-PT') => {
  const tz = timezone || getSystemTimezone();
  const d = new Date(date);
  return d.toLocaleString(locale, {
    timeZone: tz,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatDateOnly = (date, timezone = null, locale = 'pt-PT') => {
  const tz = timezone || getSystemTimezone();
  const d = new Date(date);
  return d.toLocaleDateString(locale, { timeZone: tz });
};

export const convertTimezone = (date, fromTimezone, toTimezone) => {
  const d = new Date(date);
  const fromOffset = getTimezoneOffset(fromTimezone);
  const toOffset = getTimezoneOffset(toTimezone);
  const diff = toOffset - fromOffset;
  return new Date(d.getTime() + diff * 60 * 1000);
};

const getTimezoneOffset = (timezone) => {
  const date = new Date();
  const formatter = new Intl.DateTimeFormat('en', { timeZone: timezone, timeZoneName: 'short' });
  const parts = formatter.formatToParts(date);
  const offsetPart = parts.find(p => p.type === 'timeZoneName');
  if (offsetPart) {
    const match = offsetPart.value.match(/GMT([+-]\d+)/);
    if (match) return parseInt(match[1]) * 60;
  }
  return 0;
};

export default {
  getSystemTimezone,
  getAvailableTimezones,
  formatDate,
  formatDateTime,
  formatDateOnly,
  convertTimezone
};