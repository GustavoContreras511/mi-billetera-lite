const LOCALE = 'es-MX';
const DAY_MS = 86_400_000;

const money = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: 'MXN' });
const percent = new Intl.NumberFormat(LOCALE, { style: 'percent', maximumFractionDigits: 0 });
const time = new Intl.DateTimeFormat(LOCALE, { hour: '2-digit', minute: '2-digit' });
const date = new Intl.DateTimeFormat(LOCALE, { weekday: 'long', day: 'numeric', month: 'long' });
const relative = new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto' });

const startOfDay = timestamp => new Date(timestamp).setHours(0, 0, 0, 0);
const capitalize = text => text.charAt(0).toUpperCase() + text.slice(1);

export const formatMoney = cents => money.format(cents / 100);
export const formatPercent = ratio => (ratio > 0 && ratio < 0.01 ? '<1%' : percent.format(ratio));
export const formatTime = timestamp => time.format(timestamp);

export const formatCount = count => (count === 1 ? '1 gasto' : `${count} gastos`);

export function formatDay(timestamp) {
  const daysAgo = Math.round((startOfDay(Date.now()) - startOfDay(timestamp)) / DAY_MS);
  const label = daysAgo < 2 ? relative.format(-daysAgo, 'day') : date.format(timestamp);
  return capitalize(label);
}
