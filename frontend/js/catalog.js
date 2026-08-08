import { api } from './api.js';

/**
 * Guarda em memória o cardápio e as configurações do site depois de
 * buscados da API, para que menu.js e checkout.js não precisem cada
 * um fazer sua própria requisição.
 */
let items = [];
let settings = null;

export async function loadCatalog() {
  const [itemsRes, settingsRes] = await Promise.all([api.getItems(), api.getSettings()]);
  items = itemsRes;
  settings = settingsRes;
  return { items, settings };
}

export function getItems() {
  return items;
}

export function getSettings() {
  return settings;
}

export function getItemById(id) {
  return items.find((i) => i.id === id);
}

export function getCategories() {
  return Array.from(new Set(items.map((i) => i.categoria).filter(Boolean)));
}
