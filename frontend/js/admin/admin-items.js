import { api, ApiRequestError } from '../api.js';
import { loadCatalog, getItems } from '../catalog.js';
import { fmtBRL, esc, showToast, cakeIconSVG } from '../utils.js';

let editingItemId = null;
let currentImageUrl = '';

export async function renderItemsTab() {
  await loadCatalog();
  renderItemsTable();
}

function renderItemsTable() {
  const wrap = document.getElementById('itemsWrap');
  const items = getItems();
  if (!wrap) return;

  if (items.length === 0) {
    wrap.innerHTML = '<div class="empty-state">Nenhum item cadastrado ainda. Clique em "+ Novo item" para começar.</div>';
    return;
  }

  wrap.innerHTML = `<div class="table-scroll"><table class="admin-table">
    <thead><tr><th></th><th>Item</th><th>Categoria</th><th>Preço</th><th>Status</th><th></th></tr></thead>
    <tbody>
      ${items.map((it) => `
        <tr>
          <td>${it.imagemUrl ? `<img class="table-thumb" src="${esc(it.imagemUrl)}" alt="">` : `<div class="table-thumb" style="display:flex;align-items:center;justify-content:center;color:var(--pink);">${cakeIconSVG()}</div>`}</td>
          <td><b>${esc(it.nome)}</b>${it.promo ? ` <span class="badge promo">Promo</span>` : ''}</td>
          <td>${esc(it.categoria)}</td>
          <td>${it.promo ? `<span style="text-decoration:line-through;color:var(--charcoal-soft);font-size:12px;">${fmtBRL(it.preco)}</span> ${fmtBRL(it.precoPromocional)}` : fmtBRL(it.preco)}</td>
          <td><span class="badge ${it.disponivel === false ? 'off' : 'on'}">${it.disponivel === false ? 'Indisponível' : 'Disponível'}</span></td>
          <td><div class="row-actions">
            <button class="mini-btn" data-edit="${it.id}" aria-label="Editar"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
            <button class="mini-btn danger" data-del="${it.id}" aria-label="Excluir"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg></button>
          </div></td>
        </tr>`).join('')}
    </tbody>
  </table></div>`;

  wrap.querySelectorAll('[data-edit]').forEach((b) => b.addEventListener('click', () => openItemModal(b.dataset.edit)));
  wrap.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', () => handleDelete(b.dataset.del)));
}

async function handleDelete(itemId) {
  if (!confirm('Tem certeza que deseja excluir este item do cardápio? Essa ação não pode ser desfeita.')) return;
  try {
    await api.deleteItem(itemId);
    showToast('Item excluído.');
    await renderItemsTab();
  } catch (err) {
    showToast(err instanceof ApiRequestError ? err.message : 'Não foi possível excluir o item.', true);
  }
}

function openItemModal(itemId) {
  editingItemId = itemId || null;
  const it = itemId ? getItems().find((i) => i.id === itemId) : null;

  document.getElementById('itemModalTitle').textContent = it ? 'Editar item' : 'Novo item';
  document.getElementById('itNome').value = it ? it.nome : '';
  document.getElementById('itCategoria').value = it ? it.categoria : '';
  document.getElementById('itPreco').value = it ? it.preco : '';
  document.getElementById('itDesc').value = it ? it.descricao || '' : '';
  document.getElementById('itPromoPreco').value = it ? it.precoPromocional || '' : '';

  currentImageUrl = it ? it.imagemUrl || '' : '';
  const preview = document.getElementById('imgPreview');
  const placeholder = document.getElementById('imgUploadPlaceholder');
  if (currentImageUrl) { preview.src = currentImageUrl; preview.style.display = 'block'; placeholder.style.display = 'none'; }
  else { preview.style.display = 'none'; placeholder.style.display = 'block'; }

  const promoSwitch = document.getElementById('itPromoSwitch');
  const promoOn = !!(it && it.promo);
  promoSwitch.classList.toggle('on', promoOn);
  document.getElementById('itPromoPriceWrap').style.display = promoOn ? 'block' : 'none';

  document.getElementById('itAvailSwitch').classList.toggle('on', it ? it.disponivel !== false : true);

  const catList = document.getElementById('catList');
  catList.innerHTML = Array.from(new Set(getItems().map((i) => i.categoria).filter(Boolean)))
    .map((c) => `<option value="${esc(c)}">`).join('');

  document.getElementById('itemModalOverlay').classList.add('open');
}

function closeItemModal() {
  document.getElementById('itemModalOverlay').classList.remove('open');
}

function resizeImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxW = 800;
        const scale = Math.min(1, maxW / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.85);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function handleImageUpload(file) {
  try {
    const resizedBlob = await resizeImageFile(file);
    const resizedFile = new File([resizedBlob], file.name, { type: 'image/jpeg' });
    const { url } = await api.uploadImage(resizedFile);
    currentImageUrl = url;
    const preview = document.getElementById('imgPreview');
    preview.src = url;
    preview.style.display = 'block';
    document.getElementById('imgUploadPlaceholder').style.display = 'none';
  } catch (err) {
    showToast(err instanceof ApiRequestError ? err.message : 'Não foi possível enviar a imagem.', true);
  }
}

async function handleSaveItem() {
  const nome = document.getElementById('itNome').value.trim();
  const categoria = document.getElementById('itCategoria').value.trim();
  const preco = parseFloat(document.getElementById('itPreco').value);
  const descricao = document.getElementById('itDesc').value.trim();
  const promo = document.getElementById('itPromoSwitch').classList.contains('on');
  const precoPromocional = parseFloat(document.getElementById('itPromoPreco').value) || 0;
  const disponivel = document.getElementById('itAvailSwitch').classList.contains('on');

  if (!nome || !categoria || isNaN(preco) || preco < 0) {
    showToast('Preencha nome, categoria e um preço válido.', true);
    return;
  }
  if (promo && (!precoPromocional || precoPromocional <= 0 || precoPromocional >= preco)) {
    showToast('O preço promocional deve ser menor que o preço normal.', true);
    return;
  }

  const payload = { nome, categoria, preco, descricao, imagemUrl: currentImageUrl, promo, precoPromocional: promo ? precoPromocional : undefined, disponivel };

  const saveBtn = document.getElementById('itemSaveBtn');
  saveBtn.disabled = true;
  saveBtn.textContent = 'Salvando...';
  try {
    if (editingItemId) await api.updateItem(editingItemId, payload);
    else await api.createItem(payload);
    showToast('Item salvo com sucesso.');
    closeItemModal();
    await renderItemsTab();
  } catch (err) {
    showToast(err instanceof ApiRequestError ? err.message : 'Não foi possível salvar o item.', true);
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Salvar item';
  }
}

export function initItemsTab() {
  document.getElementById('addItemBtn').addEventListener('click', () => openItemModal(null));
  document.getElementById('itemCancelBtn').addEventListener('click', closeItemModal);
  document.getElementById('itemModalOverlay').addEventListener('click', (e) => { if (e.target.id === 'itemModalOverlay') closeItemModal(); });

  document.getElementById('itPromoSwitch').addEventListener('click', function () {
    this.classList.toggle('on');
    document.getElementById('itPromoPriceWrap').style.display = this.classList.contains('on') ? 'block' : 'none';
  });
  document.getElementById('itAvailSwitch').addEventListener('click', function () { this.classList.toggle('on'); });

  document.getElementById('imgUploadInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleImageUpload(file);
  });

  document.getElementById('itemSaveBtn').addEventListener('click', handleSaveItem);
}
