import { loadCatalog } from './catalog.js';
import { renderContactInfo, renderPromo, renderCategoryTabs, renderMenuGrid } from './menu.js';
import { initCart } from './checkout.js';
import { showToast } from './utils.js';

function wireNav() {
  const burger = document.getElementById('burgerBtn');
  const navLinks = document.getElementById('navLinks');
  burger?.addEventListener('click', () => navLinks?.classList.toggle('open'));
  navLinks?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => navLinks.classList.remove('open')));
}

function hideLoadScreen() {
  const ls = document.getElementById('loadScreen');
  if (!ls) return;
  ls.style.opacity = '0';
  setTimeout(() => (ls.style.display = 'none'), 500);
}

async function init() {
  wireNav();
  initCart();

  try {
    await loadCatalog();
    renderContactInfo();
    renderCategoryTabs(renderMenuGrid);
    renderMenuGrid();
    renderPromo();
  } catch (err) {
    console.error(err);
    showToast('Não foi possível carregar o cardápio agora. Recarregue a página.', true);
  } finally {
    hideLoadScreen();
  }
}

init();
