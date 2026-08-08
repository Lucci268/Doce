/**
 * Utilitários pequenos e sem estado, usados em vários módulos.
 */

export function fmtBRL(value) {
  return (Number(value) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function esc(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}

export function itemDisplayPrice(item) {
  return item.promo && item.precoPromocional != null ? Number(item.precoPromocional) : Number(item.preco);
}

/** Mostra uma notificação temporária no canto da tela. */
export function showToast(message, isError = false) {
  const wrap = document.getElementById('toastWrap');
  if (!wrap) return;
  const toast = document.createElement('div');
  toast.className = 'toast' + (isError ? ' err' : '');
  toast.textContent = message;
  wrap.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity .3s';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

export function cakeIconSVG() {
  return `<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 2c1 2-1 3-1 5a1 1 0 0 0 2 0c0-2-2-3-1-5z"/><path d="M4 21v-7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7"/><path d="M2 21h20"/><path d="M4 14c1.5-2 3-2 4 0s2.5 2 4 0 3-2 4 0 2.5 2 4 0"/></svg>`;
}
