/**
 * Estado do carrinho. Fica salvo no localStorage do navegador do
 * cliente (não no servidor) para sobreviver a um F5 na página —
 * o pedido só é enviado ao backend quando o cliente finaliza a compra.
 */
const STORAGE_KEY = 'flor-de-acucar-cart';

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persist(cart) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

let cart = load();
const listeners = [];

export function onCartChange(fn) {
  listeners.push(fn);
}
function notify() {
  persist(cart);
  listeners.forEach((fn) => fn(cart));
}

export function getCart() {
  return cart;
}

export function addToCart(itemId) {
  const row = cart.find((c) => c.id === itemId);
  if (row) row.qty += 1;
  else cart.push({ id: itemId, qty: 1 });
  notify();
}

export function changeQty(itemId, delta) {
  const row = cart.find((c) => c.id === itemId);
  if (!row) return;
  row.qty += delta;
  if (row.qty <= 0) cart = cart.filter((c) => c.id !== itemId);
  notify();
}

export function removeFromCart(itemId) {
  cart = cart.filter((c) => c.id !== itemId);
  notify();
}

export function clearCart() {
  cart = [];
  notify();
}

export function cartCount() {
  return cart.reduce((sum, c) => sum + c.qty, 0);
}

export function cartTotal(items) {
  return cart.reduce((sum, c) => {
    const item = items.find((i) => i.id === c.id);
    if (!item) return sum;
    const price = item.promo && item.precoPromocional != null ? Number(item.precoPromocional) : Number(item.preco);
    return sum + price * c.qty;
  }, 0);
}
