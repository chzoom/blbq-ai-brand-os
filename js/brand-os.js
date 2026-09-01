const FALLBACK_ACCOUNTS = [
  { id: 'brand', name: '饱里宝气（品牌总账号）', handle: '49393241278', role: '品牌总账号', stores: ['全部门店'], style: '品牌统一、产品为本、清楚可信' },
  { id: 'linkeda', name: '饱里宝气轻食（林科大店）', handle: '26486699939', role: '林科大本地账号', stores: ['林科大店'], style: '校园生活、下课饭点、真实饭盒、性价比' },
  { id: 'meixihu', name: '饱里宝气轻食（梅溪湖店）', handle: 'Baolibaoqi366', role: '梅溪湖本地账号', stores: ['梅溪湖店'], style: '区域生活、健康饮食、明亮自然、轻松分享' },
  { id: 'campus', name: '饱里宝气轻食（校园生活方式）', handle: '95060784985', role: '长沙校园生活方式账号', stores: ['林科大店', '梅溪湖店', '河西大学城店'], style: '像真实用户分享、下课吃饭、桌面实拍' },
  { id: 'health', name: '饱里宝气轻食健康餐（大学城）', handle: '26806924125', role: '健康餐垂类账号', stores: ['河西大学城店'], style: '搭配拆解、大学城订餐、健康餐生活方式' }
];
const FALLBACK_STORES = [
  { id: 'linkeda', name: '林科大店', area: '林科大、铁道学院及周边', audience: '林科大学生、铁道学院学生、宿舍党、考研党', scenes: ['下课后', '宿舍午餐', '图书馆自习后'], tags: ['林科大', '铁道学院'] },
  { id: 'meixihu', name: '梅溪湖店', area: '梅溪湖、第一师范及周边写字楼', audience: '第一师范学生、周边上班族、健康饮食人群', scenes: ['工作日午餐', '第一师范下课', '梅溪湖生活圈'], tags: ['梅溪湖', '第一师范', '岳麓区'] },
  { id: 'campus', name: '河西大学城店', area: '中南大学、湖南大学、湖南师范大学及周边', audience: '大学生、大学城宿舍党、考研党、健康餐人群', scenes: ['大学城午餐', '宿舍订餐', '考试周'], tags: ['河西大学城', '中南大学', '湖南师范大学', '湖南大学'] }
];
let accounts = FALLBACK_ACCOUNTS;
let stores = FALLBACK_STORES;

const readJson = async (path, fallback) => { try { const response = await fetch(path, { cache: 'no-store' }); return response.ok ? await response.json() : fallback; } catch { return fallback; } };
const byId = (id) => document.getElementById(id);
const escBrand = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function selectedAccount() { return accounts.find((item) => item.id === byId('accountProfile')?.value) || accounts[0]; }
function selectedStore() { return stores.find((item) => (byId('store')?.value || '').includes(item.name)) || stores[0]; }
function renderAccountSelect() {
  const select = byId('accountProfile');
  if (!select) return;
  const current = select.value;
  select.innerHTML = `<option value="">自动选择账号</option>${accounts.map((item) => `<option value="${escBrand(item.id)}">${escBrand(item.name)}</option>`).join('')}`;
  select.value = current;
  select.addEventListener('change', () => { localStorage.setItem('BLBQ_V15_ACCOUNT', select.value); renderAccountSummary(); });
  select.value = localStorage.getItem('BLBQ_V15_ACCOUNT') || '';
  byId('store')?.addEventListener('input', () => {
    if (select.value) return;
    const storeValue = byId('store')?.value || '';
    const match = accounts.find((item) => item.stores.some((store) => store !== '全部门店' && storeValue.includes(store.replace('店', ''))));
    if (match) { select.value = match.id; renderAccountSummary(); }
  });
  renderAccountSummary();
}
function renderAccountSummary() {
  const account = selectedAccount();
  const target = byId('accountSummary');
  if (target) target.textContent = `${account.name} · ${account.role} · ${account.style}`;
}
function selectContentPlatform(platform) {
  const input = byId('contentPlatform');
  if (input) input.value = platform;
  document.querySelectorAll('[data-content-platform]').forEach((button) => button.classList.toggle('active', button.dataset.contentPlatform === platform));
  window.toast?.(`${platform === 'xiaohongshu' ? '小红书' : platform === 'douyin' ? '抖音' : platform === 'community' ? '社群' : '朋友圈'}内容模式已选择`);
}
function openBrandPage(page) { window.routePlatformFallback?.(page); }
function renderBrandOsDashboard() {
  const home = byId('homeView');
  if (!home || byId('brandOsDashboard')) return;
  const dashboard = document.createElement('section');
  dashboard.id = 'brandOsDashboard';
  dashboard.innerHTML = `<div class="brand-os-hero"><div><span class="eyebrow">BLBQ AI BRAND OS</span><h2>饱里宝气 AI 品牌运营中心</h2><p>账号、门店、内容和数据在一个工作区协同。</p></div><span class="brand-os-state">AI + 本地双引擎</span></div><div class="brand-os-grid"><button class="brand-os-tile" onclick="routePlatformFallback('create')"><strong>AI 创作</strong><span>小红书、抖音、社群、朋友圈</span></button><button class="brand-os-tile" onclick="routePlatformFallback('marketing')"><strong>营销中心</strong><span>活动、热点、校园运营和日历</span></button><button class="brand-os-tile" onclick="routePlatformFallback('assets')"><strong>内容库</strong><span>文案、排期、表现和导出</span></button><button class="brand-os-tile" onclick="routePlatformFallback('data')"><strong>数据中心</strong><span>指标、复盘和内容规律</span></button><button class="brand-os-tile" onclick="routePlatformFallback('store')"><strong>门店中心</strong><span>门店定位、人群、场景和标签</span></button><button class="brand-os-tile" onclick="routePlatformFallback('brand')"><strong>品牌知识库</strong><span>品牌规则、账号矩阵和菜单</span></button></div><div class="brand-os-shortcuts"><div><span class="eyebrow">快捷操作</span><strong>今天先完成一件事</strong></div><div class="actions"><button class="btn primary" type="button" data-workflow>一键爆文</button><button class="btn soft" type="button" onclick="routePlatformFallback('secretary')">今日推荐</button><button class="btn ghost" type="button" onclick="routePlatformFallback('diagnose')">AI 分析</button></div></div>`;
  home.prepend(dashboard);
}
function renderAccountMatrix() {
  const target = byId('accountMatrixPreview');
  if (!target) return;
  target.innerHTML = accounts.map((account) => `<article class="account-row"><div><strong>${escBrand(account.name)}</strong><span>小红书号 ${escBrand(account.handle)} · ${escBrand(account.role)}</span></div><small>${escBrand(account.style)}</small></article>`).join('');
}
function renderStoreCenter() {
  const target = byId('storeCenterList');
  if (!target) return;
  target.innerHTML = stores.map((store) => `<article class="store-row"><div><strong>${escBrand(store.name)}</strong><span>${escBrand(store.area)}</span></div><small>${escBrand(store.audience)}<br>${escBrand(store.tags.join(' · '))}</small></article>`).join('');
}

window.BLBQBrandOS = { accounts: () => accounts, stores: () => stores, selectedAccount, selectedStore, renderAccountMatrix, renderStoreCenter };
window.selectContentPlatform = selectContentPlatform;
window.openBrandPage = openBrandPage;

document.addEventListener('DOMContentLoaded', async () => {
  [accounts, stores] = await Promise.all([readJson('data/accounts.json', FALLBACK_ACCOUNTS), readJson('data/stores.json', FALLBACK_STORES)]);
  renderAccountSelect();
  renderBrandOsDashboard();
  selectContentPlatform(byId('contentPlatform')?.value || 'xiaohongshu');
});
