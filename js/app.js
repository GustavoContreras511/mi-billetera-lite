import * as store from './store.js';
import * as view from './view.js';
import { showUndo } from './toast.js';

const form = document.getElementById('expense-form');
const search = document.getElementById('search');
const filter = document.getElementById('category-filter');
const history = document.getElementById('history');
const offline = document.getElementById('offline');

const state = { expenses: [], category: 'all', query: '' };

const toCents = value => Math.round(Number(value) * 100);
const newestFirst = (a, b) => b.createdAt - a.createdAt;
const normalize = text => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim();

const matchesFilters = ({ category, concept }) =>
  (state.category === 'all' || category === state.category) && normalize(concept).includes(state.query);

const update = () => view.render(state.expenses, state.expenses.filter(matchesFilters));

function clearFilters() {
  state.category = 'all';
  state.query = '';
  search.value = '';
  filter.querySelector('input[value="all"]').checked = true;
}

async function addExpense(expense) {
  await store.add(expense);
  state.expenses = [...state.expenses, expense].sort(newestFirst);
  if (!matchesFilters(expense)) clearFilters();
  update();
  view.highlight(expense.id);
}

async function removeExpense(id) {
  const expense = state.expenses.find(item => item.id === id);
  await store.remove(id);
  state.expenses = state.expenses.filter(item => item !== expense);
  update();
  showUndo(`Se eliminó «${expense.concept}»`, () => addExpense(expense));
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  const data = new FormData(form);

  await addExpense({
    id: crypto.randomUUID(),
    concept: data.get('concept').trim(),
    amountCents: toCents(data.get('amount')),
    category: data.get('category'),
    createdAt: Date.now(),
  });

  form.reset();
  form.elements.concept.focus();
});

history.addEventListener('click', event => {
  const button = event.target.closest('.expense__delete');
  if (button) removeExpense(button.closest('.expense').dataset.id);
});

filter.addEventListener('change', event => {
  state.category = event.target.value;
  update();
});

search.addEventListener('input', () => {
  state.query = normalize(search.value);
  update();
});

const syncConnection = () => { offline.hidden = navigator.onLine; };
window.addEventListener('online', syncConnection);
window.addEventListener('offline', syncConnection);
syncConnection();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js');
}

view.mountCategoryControls();
state.expenses = (await store.getAll()).sort(newestFirst);
update();
