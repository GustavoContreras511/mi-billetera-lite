const DURATION_MS = 5000;

const toast = document.getElementById('toast');
const message = toast.querySelector('.toast__message');
const action = toast.querySelector('.toast__action');

let timer;
let onUndo;

function hide() {
  clearTimeout(timer);
  toast.hidden = true;
  onUndo = null;
}

export function showUndo(text, undo) {
  clearTimeout(timer);
  message.textContent = text;
  onUndo = undo;
  toast.hidden = false;
  timer = setTimeout(hide, DURATION_MS);
}

action.addEventListener('click', () => {
  onUndo?.();
  hide();
});
