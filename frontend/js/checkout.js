import { api, ApiRequestError } from './api.js';
import { getCart, changeQty, removeFromCart, cartTotal, clearCart, onCartChange, cartCount } from './cart.js';
import { getItems, getSettings } from './catalog.js';
import { fmtBRL, esc, itemDisplayPrice, cakeIconSVG, showToast } from './utils.js';

let view = 'cart'; // cart | checkout | confirm
let lastOrder = null;
let checkoutData = { tipo: 'retirada', nome: '', telefone: '', endereco: '', bairro: '', numero: '', complemento: '', pagamento: 'pix', obs: '' };

export function initCart() {
  document.getElementById('cartBtn')?.addEventListener('click', openCart);
  document.getElementById('cartCloseBtn')?.addEventListener('click', closeCart);
  document.getElementById('overlay')?.addEventListener('click', closeCart);
  onCartChange(() => { renderCartCount(); if (document.getElementById('cartDrawer')?.classList.contains('open')) renderCartDrawer(); });
  renderCartCount();
}

function renderCartCount() {
  const el = document.getElementById('cartCount');
  if (!el) return;
  const count = cartCount();
  el.textContent = count;
  el.style.display = count > 0 ? 'flex' : 'none';
}

function openCart() {
  view = 'cart';
  document.getElementById('overlay')?.classList.add('open');
  document.getElementById('cartDrawer')?.classList.add('open');
  renderCartDrawer();
}
function closeCart() {
  document.getElementById('overlay')?.classList.remove('open');
  document.getElementById('cartDrawer')?.classList.remove('open');
}

function renderCartDrawer() {
  const title = document.getElementById('cartDrawerTitle');
  const body = document.getElementById('cartBody');
  const foot = document.getElementById('cartFoot');
  if (!title || !body || !foot) return;

  if (view === 'confirm' && lastOrder) return renderConfirmView(title, body, foot);
  if (view === 'checkout') return renderCheckoutView(title, body, foot);

  title.textContent = 'Seu carrinho';
  const cart = getCart();
  const items = getItems();

  if (cart.length === 0) {
    body.innerHTML = `<div class="cart-empty">
      <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
      <p>Seu carrinho está vazio.<br>Que tal escolher algo docinho?</p>
    </div>`;
    foot.innerHTML = `<a href="#cardapio" class="btn btn-primary btn-block" id="goMenuBtn">Ver cardápio</a>`;
    document.getElementById('goMenuBtn')?.addEventListener('click', closeCart);
    return;
  }

  body.innerHTML = cart.map((c) => {
    const it = items.find((i) => i.id === c.id);
    if (!it) return '';
    const price = itemDisplayPrice(it);
    return `<div class="cart-row">
      ${it.imagemUrl ? `<img src="${esc(it.imagemUrl)}" alt="${esc(it.nome)}">` : `<div class="ph">${cakeIconSVG()}</div>`}
      <div class="info">
        <h5>${esc(it.nome)}</h5>
        <div class="price">${fmtBRL(price)}</div>
        <div class="qty-ctrl">
          <button data-dec="${it.id}">−</button>
          <span>${c.qty}</span>
          <button data-inc="${it.id}">+</button>
        </div>
        <a class="row-remove" data-remove="${it.id}">Remover</a>
      </div>
    </div>`;
  }).join('');

  body.querySelectorAll('[data-inc]').forEach((b) => b.addEventListener('click', () => changeQty(b.dataset.inc, 1)));
  body.querySelectorAll('[data-dec]').forEach((b) => b.addEventListener('click', () => changeQty(b.dataset.dec, -1)));
  body.querySelectorAll('[data-remove]').forEach((b) => b.addEventListener('click', () => removeFromCart(b.dataset.remove)));

  const subtotal = cartTotal(items);
  foot.innerHTML = `
    <div class="sum-row"><span>Subtotal</span><span>${fmtBRL(subtotal)}</span></div>
    <div class="sum-row total"><span>Total</span><span>${fmtBRL(subtotal)}</span></div>
    <button class="btn btn-primary btn-block" style="margin-top:14px;" id="goCheckoutBtn">Ir para o checkout</button>
  `;
  document.getElementById('goCheckoutBtn')?.addEventListener('click', () => { view = 'checkout'; renderCartDrawer(); });
}

function renderCheckoutView(title, body, foot) {
  const s = getSettings();
  const items = getItems();
  title.textContent = 'Finalizar pedido';
  const subtotal = cartTotal(items);
  const deliveryFee = checkoutData.tipo === 'entrega' ? Number(s?.taxaEntrega || 0) : 0;

  body.innerHTML = `
    <div class="form-error" id="checkoutErr"></div>
    <div class="step-title">Tipo de pedido</div>
    <div class="radio-group" style="margin-bottom:20px;">
      <div class="radio-opt ${checkoutData.tipo === 'retirada' ? 'active' : ''}" data-tipo="retirada">Retirar na loja</div>
      <div class="radio-opt ${checkoutData.tipo === 'entrega' ? 'active' : ''}" data-tipo="entrega">Entrega (delivery)</div>
    </div>

    <div class="step-title">Seus dados</div>
    <div class="field"><label>Nome completo</label><input id="cfNome" value="${esc(checkoutData.nome)}" placeholder="Seu nome"></div>
    <div class="field"><label>Telefone / WhatsApp</label><input id="cfTelefone" value="${esc(checkoutData.telefone)}" placeholder="(81) 90000-0000"></div>

    <div id="deliveryFields" style="display:${checkoutData.tipo === 'entrega' ? 'block' : 'none'};">
      <div class="step-title" style="margin-top:20px;">Endereço de entrega</div>
      <div class="field-row">
        <div class="field"><label>Rua</label><input id="cfEndereco" value="${esc(checkoutData.endereco)}"></div>
        <div class="field"><label>Número</label><input id="cfNumero" value="${esc(checkoutData.numero)}"></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Bairro</label><input id="cfBairro" value="${esc(checkoutData.bairro)}"></div>
        <div class="field"><label>Complemento</label><input id="cfComplemento" value="${esc(checkoutData.complemento)}"></div>
      </div>
      <p class="hint">Taxa de entrega: ${fmtBRL(s?.taxaEntrega || 0)}</p>
    </div>

    <div class="step-title" style="margin-top:20px;">Pagamento</div>
    <div class="radio-group" style="margin-bottom:20px;">
      <div class="radio-opt ${checkoutData.pagamento === 'pix' ? 'active' : ''}" data-pag="pix">Pix</div>
      <div class="radio-opt ${checkoutData.pagamento === 'cartao' ? 'active' : ''}" data-pag="cartao">Cartão na entrega</div>
      <div class="radio-opt ${checkoutData.pagamento === 'dinheiro' ? 'active' : ''}" data-pag="dinheiro">Dinheiro</div>
    </div>
    <p class="hint" style="margin-bottom:14px;">O pagamento é combinado diretamente com a confeitaria pelo WhatsApp.</p>

    <div class="field"><label>Observações (opcional)</label><textarea id="cfObs" placeholder="Ex: sem açúcar, retirar após as 18h...">${esc(checkoutData.obs)}</textarea></div>

    <div class="sum-row" style="margin-top:16px;"><span>Subtotal</span><span>${fmtBRL(subtotal)}</span></div>
    ${checkoutData.tipo === 'entrega' ? `<div class="sum-row"><span>Taxa de entrega</span><span>${fmtBRL(deliveryFee)}</span></div>` : ''}
  `;

  foot.innerHTML = `
    <div class="sum-row total"><span>Total</span><span>${fmtBRL(subtotal + deliveryFee)}</span></div>
    <button class="btn btn-primary btn-block" id="submitOrderBtn" style="margin-top:14px;">Confirmar pedido</button>
    <button class="btn btn-ghost btn-block" style="margin-top:10px;" id="backToCartBtn">Voltar ao carrinho</button>
  `;

  body.querySelectorAll('[data-tipo]').forEach((el) => el.addEventListener('click', () => { syncFields(); checkoutData.tipo = el.dataset.tipo; renderCartDrawer(); }));
  body.querySelectorAll('[data-pag]').forEach((el) => el.addEventListener('click', () => { syncFields(); checkoutData.pagamento = el.dataset.pag; renderCartDrawer(); }));
  ['cfNome', 'cfTelefone', 'cfEndereco', 'cfNumero', 'cfBairro', 'cfComplemento', 'cfObs'].forEach((id) => {
    document.getElementById(id)?.addEventListener('input', syncFields);
  });
  document.getElementById('submitOrderBtn')?.addEventListener('click', submitOrder);
  document.getElementById('backToCartBtn')?.addEventListener('click', () => { view = 'cart'; renderCartDrawer(); });
}

function syncFields() {
  const g = (id) => document.getElementById(id)?.value;
  const map = { cfNome: 'nome', cfTelefone: 'telefone', cfEndereco: 'endereco', cfNumero: 'numero', cfBairro: 'bairro', cfComplemento: 'complemento', cfObs: 'obs' };
  Object.entries(map).forEach(([elId, key]) => { const v = g(elId); if (v !== undefined) checkoutData[key] = v; });
}

async function submitOrder() {
  syncFields();
  const errEl = document.getElementById('checkoutErr');
  const showErr = (msg) => { if (errEl) { errEl.textContent = msg; errEl.classList.add('show'); } };
  if (errEl) errEl.classList.remove('show');

  if (!checkoutData.nome.trim() || !checkoutData.telefone.trim()) { showErr('Preencha nome e telefone para continuar.'); return; }
  if (checkoutData.tipo === 'entrega' && (!checkoutData.endereco.trim() || !checkoutData.bairro.trim())) { showErr('Preencha o endereço de entrega.'); return; }

  const btn = document.getElementById('submitOrderBtn');
  if (btn) { btn.disabled = true; btn.textContent = 'Enviando...'; }

  const payload = {
    nomeCliente: checkoutData.nome,
    telefone: checkoutData.telefone,
    tipoEntrega: checkoutData.tipo,
    endereco: checkoutData.tipo === 'entrega'
      ? `${checkoutData.endereco}, ${checkoutData.numero} - ${checkoutData.bairro}${checkoutData.complemento ? ' (' + checkoutData.complemento + ')' : ''}`
      : undefined,
    formaPagamento: checkoutData.pagamento,
    observacoes: checkoutData.obs,
    itens: getCart().map((c) => ({ id: c.id, quantidade: c.qty })),
  };

  try {
    const order = await api.createOrder(payload);
    lastOrder = order;
    view = 'confirm';
    clearCart();
    checkoutData = { tipo: 'retirada', nome: '', telefone: '', endereco: '', bairro: '', numero: '', complemento: '', pagamento: 'pix', obs: '' };
    renderCartDrawer();
  } catch (err) {
    const msg = err instanceof ApiRequestError ? err.message : 'Não foi possível enviar o pedido. Tente novamente.';
    showErr(msg);
    showToast(msg, true);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Confirmar pedido'; }
  }
}

function renderConfirmView(title, body, foot) {
  const o = lastOrder;
  title.textContent = 'Pedido enviado';
  body.innerHTML = `<div class="confirm-box">
    <div class="tick"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>
    <h3>Recebemos seu pedido!</h3>
    <p>Agora é só confirmar com a gente pelo WhatsApp para combinarmos o pagamento e o horário.</p>
    <div class="order-id-pill">Pedido #${o.id.slice(-6).toUpperCase()}</div>
  </div>`;
  foot.innerHTML = `
    <a class="btn btn-primary btn-block" href="${whatsappOrderLink(o)}" target="_blank" rel="noopener">Enviar resumo pelo WhatsApp</a>
    <button class="btn btn-ghost btn-block" style="margin-top:10px;" id="closeConfirmBtn">Fechar</button>
  `;
  document.getElementById('closeConfirmBtn')?.addEventListener('click', () => { lastOrder = null; view = 'cart'; closeCart(); });
}

function whatsappOrderLink(o) {
  const s = getSettings();
  let msg = `Olá! Gostaria de confirmar meu pedido #${o.id.slice(-6).toUpperCase()} na Flor de Açúcar:%0A%0A`;
  o.itens.forEach((it) => { msg += `• ${it.quantidade}x ${it.nome} — ${fmtBRL(it.preco * it.quantidade)}%0A`; });
  msg += `%0ASubtotal: ${fmtBRL(o.subtotal)}%0A`;
  if (o.tipoEntrega === 'entrega') msg += `Taxa de entrega: ${fmtBRL(o.taxaEntrega)}%0A`;
  msg += `Total: ${fmtBRL(o.total)}%0A%0A`;
  msg += o.tipoEntrega === 'entrega' ? `Entrega em: ${o.endereco}%0A` : `Retirada na loja%0A`;
  msg += `Pagamento: ${o.formaPagamento}%0ANome: ${o.nomeCliente}`;
  return `https://wa.me/${(s?.telefone || '').replace(/\D/g, '')}?text=${msg}`;
}
