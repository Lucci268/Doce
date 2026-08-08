import { verifySession, initLoginForm, logout } from './admin-auth.js';
import { renderItemsTab, initItemsTab } from './admin-items.js';
import { renderOrdersTab, initOrdersTab } from './admin-orders.js';
import { renderConfigTab, initConfigTab } from './admin-settings.js';
import { loadCatalog } from '../catalog.js';

function showDashboard() {
  document.getElementById('adminLoginWrap').style.display = 'none';
  document.getElementById('adminShell').classList.add('active');
  loadActiveTab();
}

function showLogin() {
  document.getElementById('adminLoginWrap').style.display = 'flex';
  document.getElementById('adminShell').classList.remove('active');
}

function loadActiveTab() {
  const activeTab = document.querySelector('.admin-tab.active')?.dataset.tab || 'pedidos';
  if (activeTab === 'pedidos') renderOrdersTab();
  else if (activeTab === 'cardapio') renderItemsTab();
  else if (activeTab === 'config') loadCatalog().then(renderConfigTab);
}

function wireTabs() {
  document.querySelectorAll('.admin-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab').forEach((t) => t.classList.remove('active'));
      document.querySelectorAll('.admin-panel').forEach((p) => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('panel-' + tab.dataset.tab).classList.add('active');
      loadActiveTab();
    });
  });
}

async function init() {
  wireTabs();
  initItemsTab();
  initOrdersTab();
  initConfigTab();
  document.getElementById('adminLogoutBtn').addEventListener('click', logout);

  const loggedIn = await verifySession();
  if (loggedIn) {
    showDashboard();
  } else {
    showLogin();
    initLoginForm(showDashboard);
  }

  const loadScreen = document.getElementById('loadScreen');
  if (loadScreen) {
    loadScreen.style.opacity = '0';
    setTimeout(() => (loadScreen.style.display = 'none'), 400);
  }
}

init();
