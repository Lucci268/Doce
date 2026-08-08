import { api, ApiRequestError } from '../api.js';
import { getSettings } from '../catalog.js';
import { showToast } from '../utils.js';

export function renderConfigTab() {
  const s = getSettings();
  if (!s) return;
  document.getElementById('cfgAddress').value = s.endereco || '';
  document.getElementById('cfgPhone').value = s.telefone || '';
  document.getElementById('cfgHours').value = s.horario || '';
  document.getElementById('cfgInsta').value = s.instagram || '';
  document.getElementById('cfgDeliveryFee').value = s.taxaEntrega || 0;
  document.getElementById('cfgPromoText').value = s.textoPromocao || '';
}

export function initConfigTab() {
  document.getElementById('saveContactBtn').addEventListener('click', async () => {
    const payload = {
      endereco: document.getElementById('cfgAddress').value.trim(),
      telefone: document.getElementById('cfgPhone').value.trim(),
      horario: document.getElementById('cfgHours').value.trim(),
      instagram: document.getElementById('cfgInsta').value.trim(),
      taxaEntrega: parseFloat(document.getElementById('cfgDeliveryFee').value) || 0,
    };
    try {
      await api.updateSettings(payload);
      showToast('Informações de contato salvas.');
    } catch (err) {
      showToast(err instanceof ApiRequestError ? err.message : 'Não foi possível salvar.', true);
    }
  });

  document.getElementById('saveTextsBtn').addEventListener('click', async () => {
    const payload = { textoPromocao: document.getElementById('cfgPromoText').value.trim() };
    try {
      await api.updateSettings(payload);
      showToast('Textos salvos.');
    } catch (err) {
      showToast(err instanceof ApiRequestError ? err.message : 'Não foi possível salvar.', true);
    }
  });

  document.getElementById('savePassBtn').addEventListener('click', async () => {
    const current = document.getElementById('cfgCurrentPass').value;
    const p1 = document.getElementById('cfgNewPass').value;
    const p2 = document.getElementById('cfgNewPass2').value;
    if (!current) { showToast('Informe a senha atual.', true); return; }
    if (p1.length < 6) { showToast('A nova senha deve ter pelo menos 6 caracteres.', true); return; }
    if (p1 !== p2) { showToast('As senhas não coincidem.', true); return; }
    try {
      await api.changePassword(current, p1);
      showToast('Senha atualizada com sucesso.');
      document.getElementById('cfgCurrentPass').value = '';
      document.getElementById('cfgNewPass').value = '';
      document.getElementById('cfgNewPass2').value = '';
    } catch (err) {
      showToast(err instanceof ApiRequestError ? err.message : 'Não foi possível atualizar a senha.', true);
    }
  });
}
