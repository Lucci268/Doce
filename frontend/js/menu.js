import { getItems, getCategories, getSettings } from './catalog.js';
import { addToCart } from './cart.js';
import { fmtBRL, esc, itemDisplayPrice, cakeIconSVG } from './utils.js';

let activeCategory = 'Todos';

export function renderContactInfo() {
  const s = getSettings();
  if (!s) return;

  const setText = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
  setText('infoAddress', s.endereco);
  setText('infoHours', s.horario);
  setText('promoBannerText', s.textoPromocao);
  setText('footHours', s.horario);
  setText('footPhone', formatPhoneDisplay(s.telefone));

  const waLink = 'https://wa.me/' + (s.telefone || '').replace(/\D/g, '');
  const phoneEl = document.getElementById('infoPhone');
  if (phoneEl) { phoneEl.textContent = formatPhoneDisplay(s.telefone); phoneEl.href = waLink; }
  const whatsEl = document.getElementById('infoWhats'); if (whatsEl) whatsEl.href = waLink;
  const instaEl = document.getElementById('infoInsta'); if (instaEl) instaEl.href = s.instagram;

  const mapFrame = document.getElementById('mapFrame');
  if (mapFrame) mapFrame.src = 'https://www.google.com/maps?q=' + encodeURIComponent(s.endereco || '') + '&output=embed';
}

function formatPhoneDisplay(p) {
  const d = (p || '').replace(/\D/g, '');
  if (d.length === 13) return '+' + d.slice(0, 2) + ' (' + d.slice(2, 4) + ') ' + d.slice(4, 9) + '-' + d.slice(9);
  return p || '';
}

export function renderPromo() {
  const track = document.getElementById('promoTrack');
  if (!track) return;
  const promoItems = getItems().filter((i) => i.promo && i.disponivel !== false);

  if (promoItems.length === 0) {
    track.innerHTML = '<div class="promo-empty">Nenhuma promoção ativa no momento. Volte em breve! 🎀</div>';
    return;
  }

  track.innerHTML = promoItems.map((it) => {
    const off = it.preco > 0 ? Math.round((1 - it.precoPromocional / it.preco) * 100) : 0;
    return `<div class="promo-card">
      <div class="img"><span class="promo-tag">-${off}%</span>${it.imagemUrl ? `<img src="${esc(it.imagemUrl)}" alt="${esc(it.nome)}">` : `<div class="ph" style="height:100%;display:flex;align-items:center;justify-content:center;">${cakeIconSVG()}</div>`}</div>
      <div class="body">
        <h4>${esc(it.nome)}</h4>
        <div class="desc">${esc(it.descricao || '')}</div>
        <div class="price-row"><span class="price-old">${fmtBRL(it.preco)}</span><span class="price-new">${fmtBRL(it.precoPromocional)}</span></div>
        <button class="btn btn-primary btn-block btn-sm" data-add="${it.id}">Adicionar ao carrinho</button>
      </div>
    </div>`;
  }).join('');

  track.querySelectorAll('[data-add]').forEach((btn) => btn.addEventListener('click', () => addToCart(btn.dataset.add)));
}

export function renderCategoryTabs(onChange) {
  const tabs = document.getElementById('catTabs');
  if (!tabs) return;
  const cats = ['Todos', ...getCategories()];
  tabs.innerHTML = cats.map((c) => `<button class="cat-tab ${c === activeCategory ? 'active' : ''}" data-cat="${esc(c)}">${esc(c)}</button>`).join('');
  tabs.querySelectorAll('.cat-tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeCategory = btn.dataset.cat;
      renderCategoryTabs(onChange);
      onChange();
    });
  });
}

export function renderMenuGrid() {
  const grid = document.getElementById('menuGrid');
  if (!grid) return;
  const list = getItems().filter((i) => activeCategory === 'Todos' || i.categoria === activeCategory);

  if (list.length === 0) {
    grid.innerHTML = '<div class="empty-menu">Nenhum item nesta categoria no momento.</div>';
    return;
  }

  grid.innerHTML = list.map((it) => {
    const priced = itemDisplayPrice(it);
    const unavailable = it.disponivel === false;
    return `<div class="item-card" data-id="${it.id}">
      <div class="item-img">
        ${it.imagemUrl ? `<img src="${esc(it.imagemUrl)}" alt="${esc(it.nome)}" loading="lazy">` : `<div class="ph">${cakeIconSVG()}</div>`}
        ${it.promo ? `<span class="promo-tag" style="position:absolute; top:12px; left:12px;">Promoção</span>` : ''}
        ${unavailable ? `<div class="item-unavail">Indisponível</div>` : ''}
      </div>
      <div class="item-body">
        <h4>${esc(it.nome)}</h4>
        <div class="desc">${esc(it.descricao || '')}</div>
        <div class="item-foot">
          <div class="price-row" style="margin:0;">
            ${it.promo ? `<span class="price-old">${fmtBRL(it.preco)}</span>` : ''}
            <span class="price-new" style="font-size:22px;">${fmtBRL(priced)}</span>
          </div>
          <button class="add-btn" data-add="${it.id}" ${unavailable ? 'disabled' : ''} aria-label="Adicionar ${esc(it.nome)}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.4" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>
      </div>
    </div>`;
  }).join('');

  grid.querySelectorAll('[data-add]').forEach((btn) => btn.addEventListener('click', () => addToCart(btn.dataset.add)));

  const cards = grid.querySelectorAll('.item-card');
  cards.forEach((c, i) => setTimeout(() => c.classList.add('show'), i * 45));
}
