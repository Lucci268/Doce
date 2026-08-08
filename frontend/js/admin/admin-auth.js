import { api, getToken, setToken, clearToken, ApiRequestError } from '../api.js';

export function isLoggedIn() {
  return !!getToken();
}

/** Confirma junto à API que o token salvo ainda é válido. */
export async function verifySession() {
  if (!getToken()) return false;
  try {
    await api.me();
    return true;
  } catch {
    clearToken();
    return false;
  }
}

export function initLoginForm(onSuccess) {
  const form = document.getElementById('adminLoginBtn');
  const passInput = document.getElementById('adminPassInput');
  const userInput = document.getElementById('adminUserInput');
  const errEl = document.getElementById('adminErr');

  async function attemptLogin() {
    const username = userInput.value.trim();
    const password = passInput.value;
    errEl.classList.remove('show');

    if (!username || !password) {
      errEl.textContent = 'Preencha usuário e senha.';
      errEl.classList.add('show');
      return;
    }

    form.disabled = true;
    form.textContent = 'Entrando...';
    try {
      const { token } = await api.login(username, password);
      setToken(token);
      passInput.value = '';
      onSuccess();
    } catch (err) {
      const msg = err instanceof ApiRequestError ? err.message : 'Não foi possível entrar. Tente novamente.';
      errEl.textContent = msg;
      errEl.classList.add('show');
    } finally {
      form.disabled = false;
      form.textContent = 'Entrar';
    }
  }

  form.addEventListener('click', attemptLogin);
  [userInput, passInput].forEach((el) => el.addEventListener('keydown', (e) => { if (e.key === 'Enter') attemptLogin(); }));
}

export function logout() {
  clearToken();
  window.location.reload();
}
