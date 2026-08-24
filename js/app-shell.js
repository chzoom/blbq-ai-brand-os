import { createRouter } from './router.js';
import './storage.js';

const $v15 = (id) => document.getElementById(id);

const pageMap = {
  home: () => {
    document.querySelectorAll('.pane').forEach((pane) => pane.classList.remove('active'));
    $v15('homeView')?.classList.add('active');
    $v15('workspaceTabs')?.classList.add('v15-hidden');
  },
  create: () => {
    $v15('homeView')?.classList.remove('active');
    $v15('workspaceTabs')?.classList.remove('v15-hidden');
    window.switchMain?.('create');
  },
  diagnose: () => {
    $v15('homeView')?.classList.remove('active');
    $v15('workspaceTabs')?.classList.remove('v15-hidden');
    window.switchMain?.('analyze');
    window.switchAnalyze?.('diagnose');
  },
  breakdown: () => {
    $v15('homeView')?.classList.remove('active');
    $v15('workspaceTabs')?.classList.remove('v15-hidden');
    window.switchMain?.('analyze');
    window.switchAnalyze?.('breakdown');
  },
  learn: () => {
    $v15('homeView')?.classList.remove('active');
    $v15('workspaceTabs')?.classList.remove('v15-hidden');
    window.switchMain?.('learn');
  },
  assets: () => {
    $v15('homeView')?.classList.remove('active');
    $v15('workspaceTabs')?.classList.remove('v15-hidden');
    document.querySelectorAll('.pane').forEach((pane) => pane.classList.remove('active'));
    $v15('contentAssetsView')?.classList.add('active');
    window.renderAssets?.();
  },
  settings: () => {
    $v15('homeView')?.classList.remove('active');
    $v15('workspaceTabs')?.classList.add('v15-hidden');
    document.querySelectorAll('.pane').forEach((pane) => pane.classList.remove('active'));
    $v15('settingsView')?.classList.add('active');
  },
  marketing: () => showPlatform('marketing'),
  data: () => showPlatform('data'),
  brand: () => showPlatform('brand'),
  secretary: () => showPlatform('secretary'),
  system: () => showPlatform('system')
};

function showPlatform(page) {
  $v15('homeView')?.classList.remove('active');
  $v15('workspaceTabs')?.classList.add('v15-hidden');
  document.querySelectorAll('.pane').forEach((pane) => pane.classList.remove('active'));
  $v15('platformView')?.classList.add('active');
  window.renderPlatformPage?.(page);
}

function showV15Page(page) {
  routerV15.go(page);
}

const routerV15 = createRouter(pageMap, (page) => {
  document.querySelectorAll('[data-page]').forEach((item) => item.classList.toggle('active', item.dataset.page === page));
  updateHomeContext();
});

function updateHomeContext() {
  const context = $v15('homeContext');
  if (!context) return;
  const store = $v15('store')?.value || '未设置门店';
  const style = $v15('style')?.value || '默认风格';
  const scene = $v15('scene')?.value || '未设置场景';
  const account = $v15('accountSelect')?.value || '品牌主号';
  context.textContent = `${account} · ${store} · ${style} · ${scene}`;
  const accountContext = $v15('homeAccountContext');
  if (accountContext) accountContext.textContent = account;
}

function copyV15Block(button) {
  const content = button.closest('.result-block')?.querySelector('.result-block-body')?.textContent || '';
  navigator.clipboard?.writeText(content);
  window.toast?.('已复制该模块');
}

function renderV15ResultRail(text, meta = {}) {
  const rail = $v15('resultRail');
  if (!rail || !text) return;
  const sections = String(text).split(/(?=【[^】]+】)/g).map((section) => section.trim()).filter(Boolean);
  const blocks = sections.length ? sections : [String(text)];
  rail.className = 'result-rail-content';
  rail.innerHTML = blocks.map((section, index) => {
    const match = section.match(/^【([^】]+)】\s*/);
    const title = match?.[1] || (index === 0 ? '生成内容' : `内容模块 ${index + 1}`);
    const body = match ? section.slice(match[0].length).trim() : section;
    return `<section class="result-block"><div class="result-block-head"><strong>${escapeV15(title)}</strong><button type="button" onclick="copyV15Block(this)">复制</button></div><div class="result-block-body">${escapeV15(body)}</div></section>`;
  }).join('');
  if ($v15('resultMeta')) $v15('resultMeta').textContent = meta.task || '刚刚生成';
}

function escapeV15(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}

function watchV15Connection() {
  const connection = $v15('connection');
  const status = $v15('geminiStatus');
  if (!connection || !status) return;
  const update = () => {
    const text = connection.textContent || '';
    const online = /正常|成功|connected|连接正常/i.test(text);
    const missingKey = /GEMINI_API_KEY|密钥未设置|尚未测试/.test(text);
    status.classList.toggle('online', online);
    status.classList.toggle('missing', missingKey && !online);
    status.innerHTML = `<span class="status-dot"></span>${online ? 'Gemini Online' : missingKey ? 'Gemini 未配置 Key' : 'Gemini 连接失败'}`;
  };
  new MutationObserver(update).observe(connection, { childList: true, subtree: true, characterData: true });
  update();
}

document.addEventListener('click', (event) => {
  const target = event.target.closest('[data-page]');
  if (target) showV15Page(target.dataset.page);
  const workflow = event.target.closest('[data-workflow]');
  if (workflow) {
    showV15Page('create');
    window.runWorkflow?.();
  }
});
document.addEventListener('input', updateHomeContext);
window.addEventListener('blbq:ai-status', ({ detail }) => {
  const connection = $v15('connection');
  if (!connection) return;
  if (detail?.source === 'gemini') connection.textContent = '✅ Gemini 连接正常';
  else if (detail?.source === 'error') connection.textContent = detail.error?.message || '❌ Gemini 连接失败';
});
window.renderV15ResultRail = renderV15ResultRail;
window.copyV15Block = copyV15Block;

document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.classList.add('v15-ready');
  const style = document.createElement('style');
  style.textContent = '.v15-hidden{display:none!important}.home-view{display:none}.home-view.active{display:block}.result-rail-content{display:block}';
  document.head.appendChild(style);
  showV15Page('home');
  watchV15Connection();
  updateHomeContext();
  window.renderHomeDashboard?.();
  Promise.all([
    import('../ai/adapter.js'),
    import('../ai/workflow.js'),
    import('./platform.js')
  ]).catch((error) => {
    console.warn('可选 AI/平台模块加载失败，已保留本地导航和本地功能。', error);
  });
});

// Expose the legacy inline actions explicitly so ES modules can call them reliably.
['ctx', 'getLearn', 'setResult', 'toast', 'renderAssets', 'switchMain', 'switchAnalyze'].forEach((name) => {
  if (typeof window[name] !== 'function' && typeof globalThis[name] === 'function') window[name] = globalThis[name];
});
