import { api, ApiRequestError } from '../api.js';
import { fmtBRL, esc, showToast } from '../utils.js';

const STATUSES = ['Pendente', 'Em preparo', 'Pronto', 'Saiu para entrega', 'Entregue', 'Cancelado'];

export async function renderOrdersTab() {
  const statsWrap = document.getElementById('orderStats');
  const wrap = document.getElementById('ordersWrap');
  statsWrap.innerHTML = '<div class="empty-state" style="grid-column:1/-1;">Carregando...</div>';
  wrap.innerHTML = '';

  let orders, stats;
  try {
    [orders, stats] = await Promise.all([api.getOrders(), api.getOrderStats()]);
  } catch (err) {
    statsWrap.innerHTML = '';
    wrap.innerHTML = `<div class="empty-state">Não foi possível carregar os pedidos.</div>`;
    showToast(err instanceof ApiRequestError ? err.message : 'Erro ao carregar pedidos.', true);
    return;
  }

  statsWrap.innerHTML = `
    <div class="stat-card"><b>${stats.total}</b><span>Pedidos totais</span></div>
    <div class="stat-card"><b>${stats.pendentes}</b><span>Pendentes</span></div>
    <div class="stat-card"><b>${fmtBRL(stats.receita)}</b><span>Receita total</span></div>
    <div class="stat-card"><b>${stats.entregas}</b><span>Entregas</span></div>
  `;

  if (orders.length === 0) {
    wrap.innerHTML = '<div class="empty-state">Nenhum pedido recebido ainda.</div>';
    return;
  }

  wrap.innerHTML = `<div class="table-scroll"><table class="admin-table">
    <thead><tr><th>Pedido</th><th>Cliente</th><th>Tipo</th><th>Itens</th><th>Total</th><th>Status</th></tr></thead>
    <tbody>
      ${orders.map((o) => `
        <tr>
          <td><b>#${o.id.slice(-6).toUpperCase()}</b><br><span style="font-size:11.5px;color:var(--charcoal-soft);">${new Date(o.createdAt).toLocaleString('pt-BR')}</span></td>
          <td>${esc(o.nomeCliente)}<br><span style="font-size:11.5px;color:var(--charcoal-soft);">${esc(o.telefone)}</span></td>
          <td>${o.tipoEntrega === 'entrega' ? 'Entrega' : 'Retirada'}${o.tipoEntrega === 'entrega' ? `<br><span style="font-size:11.5px;color:var(--charcoal-soft);">${esc(o.endereco)}</span>` : ''}</td>
          <td>${o.itens.map((it) => `${it.quantidade}x ${esc(it.nome)}`).join('<br>')}</td>
          <td><b>${fmtBRL(o.total)}</b></td>
          <td><select class="status-select" data-order="${o.id}">
            ${STATUSES.map((s) => `<option value="${s}" ${o.status === s ? 'selected' : ''}>${s}</option>`).join('')}
          </select></td>
        </tr>`).join('')}
    </tbody>
  </table></div>`;

  wrap.querySelectorAll('[data-order]').forEach((select) => {
    select.addEventListener('change', async () => {
      try {
        await api.updateOrderStatus(select.dataset.order, select.value);
        showToast('Status atualizado.');
      } catch (err) {
        showToast(err instanceof ApiRequestError ? err.message : 'Não foi possível atualizar o status.', true);
      }
    });
  });
}

export function initOrdersTab() {
  document.getElementById('refreshOrdersBtn').addEventListener('click', renderOrdersTab);
}
