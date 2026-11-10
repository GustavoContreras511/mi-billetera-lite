import { CATEGORIES, categoryColor } from './categories.js';
import { formatCount, formatDay, formatMoney, formatPercent, formatTime } from './format.js';

const $ = id => document.getElementById(id);

const elements = {
  total: $('total'),
  count: $('count'),
  breakdown: $('breakdown'),
  bar: $('breakdown-bar'),
  shares: $('breakdown-list'),
  picker: $('category-picker'),
  filter: $('category-filter'),
  historySummary: $('history-summary'),
  empty: $('empty'),
  history: $('history'),
  template: $('expense-template'),
};

const sumCents = expenses => expenses.reduce((sum, { amountCents }) => sum + amountCents, 0);

function createElement(tag, className, text = '') {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = text;
  return element;
}

function paintDot(element, category) {
  element.style.setProperty('--color', categoryColor(category));
  return element;
}

function createChip(name, value, label) {
  const chip = createElement('label', 'chip');
  const input = Object.assign(document.createElement('input'), { type: 'radio', name, value, className: 'chip__input' });
  chip.append(input);
  if (CATEGORIES.includes(value)) chip.append(paintDot(createElement('span', 'dot'), value));
  chip.append(createElement('span', 'chip__label', label));
  return chip;
}

function mountChips(container, chips) {
  container.replaceChildren(...chips);
  container.querySelector('input').defaultChecked = true;
}

export function mountCategoryControls() {
  mountChips(elements.picker, CATEGORIES.map(category => createChip('category', category, category)));

  const filters = [['all', 'Todas'], ...CATEGORIES.map(category => [category, category])];
  mountChips(elements.filter, filters.map(([value, label]) => {
    const chip = createChip('filter', value, label);
    chip.append(createElement('span', 'chip__count'));
    return chip;
  }));
}

function renderSummary(expenses) {
  const total = sumCents(expenses);
  elements.total.textContent = formatMoney(total);
  elements.count.textContent = expenses.length ? `${formatCount(expenses.length)} registrados` : 'Aún no registras gastos';
  elements.breakdown.hidden = total === 0;
  if (total === 0) return;

  const shares = [...Map.groupBy(expenses, expense => expense.category)]
    .map(([category, items]) => {
      const cents = sumCents(items);
      return { category, cents, share: formatPercent(cents / total) };
    })
    .sort((a, b) => b.cents - a.cents);

  elements.bar.setAttribute('aria-label', shares.map(({ category, share }) => `${category} ${share}`).join(', '));
  elements.bar.replaceChildren(...shares.map(({ category, cents, share }) => {
    const segment = paintDot(createElement('span', 'breakdown__segment'), category);
    segment.style.flexGrow = cents;
    segment.title = `${category}: ${formatMoney(cents)} (${share})`;
    return segment;
  }));

  elements.shares.replaceChildren(...shares.map(({ category, cents, share }) => {
    const item = createElement('li', 'breakdown__item');
    item.append(
      paintDot(createElement('span', 'dot'), category),
      createElement('span', 'breakdown__name', category),
      createElement('span', 'breakdown__share', share),
      createElement('span', 'breakdown__amount', formatMoney(cents)),
    );
    return item;
  }));
}

function renderFilterCounts(expenses) {
  const byCategory = Map.groupBy(expenses, expense => expense.category);
  for (const input of elements.filter.querySelectorAll('input')) {
    const count = input.value === 'all' ? expenses.length : byCategory.get(input.value)?.length ?? 0;
    input.parentElement.querySelector('.chip__count').textContent = count;
  }
}

function renderExpense(expense) {
  const item = elements.template.content.firstElementChild.cloneNode(true);
  item.dataset.id = expense.id;
  item.querySelector('.expense__concept').textContent = expense.concept;
  item.querySelector('.expense__amount').textContent = formatMoney(expense.amountCents);
  item.querySelector('.expense__details').textContent = `${expense.category} · ${formatTime(expense.createdAt)}`;
  paintDot(item.querySelector('.dot'), expense.category);
  item.querySelector('.expense__delete').setAttribute('aria-label', `Eliminar ${expense.concept}`);
  return item;
}

function renderDay([day, expenses]) {
  const section = createElement('section', 'day');
  const header = createElement('h3', 'day__header');
  header.append(createElement('span', '', day), createElement('span', 'day__total', formatMoney(sumCents(expenses))));

  const list = createElement('ul', 'day__list');
  list.append(...expenses.map(renderExpense));

  section.append(header, list);
  return section;
}

function renderHistory(visible, hasExpenses) {
  elements.historySummary.textContent = `${formatCount(visible.length)} · ${formatMoney(sumCents(visible))}`;
  elements.empty.hidden = visible.length > 0;
  elements.empty.textContent = hasExpenses
    ? 'Ningún gasto coincide con la búsqueda.'
    : 'Aún no registras gastos. Usa el formulario para agregar el primero.';

  const days = Map.groupBy(visible, expense => formatDay(expense.createdAt));
  elements.history.replaceChildren(...[...days].map(renderDay));
}

export function render(expenses, visible) {
  renderSummary(expenses);
  renderFilterCounts(expenses);
  renderHistory(visible, expenses.length > 0);
}

export function highlight(id) {
  elements.history.querySelector(`[data-id="${id}"]`)?.classList.add('is-new');
}
