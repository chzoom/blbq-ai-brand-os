const PLATFORM_KEY = 'BLBQ_V15_PLATFORM';
const METRICS_KEY = 'BLBQ_V15_METRICS';
const $p = (id) => document.getElementById(id);

const defaults = {
  tasks: [
    { id: 'morning', time: '上午', channel: '朋友圈', title: '发布今日菜单与门店日常' },
    { id: 'noon', time: '中午', channel: '小红书', title: '发布午餐场景内容' },
    { id: 'afternoon', time: '下午', channel: '社群', title: '发起一个菜单互动问题' },
    { id: 'evening', time: '晚上', channel: '抖音', title: '发布晚餐或下课场景' }
  ],
  notes: []
};

function readPlatform() {
  try { return { ...defaults, ...JSON.parse(localStorage.getItem(PLATFORM_KEY) || '{}') }; } catch { return { ...defaults }; }
}
function writePlatform(value) { localStorage.setItem(PLATFORM_KEY, JSON.stringify(value)); }
function readMetrics() {
  try { return JSON.parse(localStorage.getItem(METRICS_KEY) || '{}'); } catch { return {}; }
}
function writeMetrics(value) { localStorage.setItem(METRICS_KEY, JSON.stringify(value)); }
function platformContext() {
  return `${$p('store')?.value || '当前门店'} · ${$p('people')?.value || '目标人群'} · ${$p('scene')?.value || '今日场景'}`;
}
function currentPayload(task, extra) {
  const context = window.ctx?.() || {
    store: $p('store')?.value || '', dishes: $p('dishes')?.value || '', people: $p('people')?.value || '',
    scene: $p('scene')?.value || '', style: $p('style')?.value || '真实', depth: $p('depth')?.value || '增强',
    mode: $p('mode')?.value || 'auto', postType: $p('postType')?.value || '', sellingPoints: $p('sellingPoints')?.value || ''
  };
  return { task, depth: context.depth, context: { ...context, mode: 'auto' }, extra, learning: (window.getLearn?.() || []).slice(0, 20), images: [] };
}
function platformShell(title, subtitle, body) {
  return `<div class="platform-head"><div><h3>${title}</h3><p>${subtitle}</p></div><span class="badge">在线 AI + 本地兜底</span></div>${body}`;
}
function safeJson(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch { return fallback; }
}
function renderPlatformPage(page) {
  const box = $p('platformBox');
  if (!box) return;
  const data = readPlatform();
  const views = {
    marketing: () => platformShell('营销中心', '生成社群、活动和校园内容，并把 KOC 待办留在本地运营记录中。', `<div class="platform-grid"><article class="platform-card"><b>社群运营</b><p>生成早安、午餐提醒、晚餐提醒、群公告和互动。</p><button class="btn primary" onclick="generatePlatformCopy('社群')">生成今日社群话术</button></article><article class="platform-card"><b>活动营销</b><p>围绕会员日、拼团、抽奖和校园活动整理方案。</p><button class="btn soft" onclick="generatePlatformCopy('活动')">生成活动方案</button></article><article class="platform-card"><b>校园运营</b><p>结合门店、人群和场景规划考试周、开学季、晚八下课等内容。</p><button class="btn soft" onclick="generatePlatformCopy('校园')">生成校园建议</button></article><article class="platform-card"><b>热点助手</b><p>输入一个热搜、校园话题或长沙本地事件，生成可执行的品牌选题。</p><button class="btn ghost" onclick="generateHotTopic()">生成热点选题</button></article><article class="platform-card"><b>KOC 运营</b><p>先记录合作待办，后续可继续补充达人资料、发布记录和效果数据。</p><button class="btn ghost" onclick="addPlatformNote('KOC 合作待办')">新增合作待办</button></article></div><div class="platform-card hot-input"><label>热点/活动关键词（可选）</label><input id="hotTopicInput" placeholder="例如：开学季、考试周、长沙下雨、午餐热搜"><div class="help">联网热点需要用户提供关键词或后续接入热点 API，不会虚构实时热搜。</div></div><div id="platformOutput" class="platform-output">选择一个营销模块开始。</div><div id="platformNotes" class="platform-notes">${renderNotes(data.notes)}</div>`),
    data: () => {
      const assets = safeJson('BLBQ_V15_ASSETS', []);
      const learn = safeJson('BLBQ_V14_LEARNING', []);
      const metrics = readMetrics();
      const planned = assets.filter((x) => x.planDate).sort((a, b) => String(a.planDate).localeCompare(String(b.planDate))).slice(0, 8);
      return platformShell('数据中心', '本地数据可立即使用；录入发布表现后，可以形成可复盘的运营闭环。', `<div class="metric-grid"><div class="metric"><strong>${assets.length}</strong><span>内容资产</span></div><div class="metric"><strong>${learn.length}</strong><span>学习素材</span></div><div class="metric"><strong>${assets.filter(x => x.status === '已发布').length}</strong><span>已发布内容</span></div><div class="metric"><strong>${assets.filter(x => x.planDate).length}</strong><span>已排期内容</span></div></div><div class="platform-grid"><section class="platform-card"><b>今日运营指标</b><label>曝光</label><input id="metricExposure" type="number" min="0" value="${metrics.exposure || ''}" placeholder="例如 1200"><label>点赞 / 收藏 / 评论</label><input id="metricEngagement" type="number" min="0" value="${metrics.engagement || ''}" placeholder="合计互动数"><label>私信 / 到店 / 下单</label><input id="metricConversion" type="number" min="0" value="${metrics.conversion || ''}" placeholder="合计转化数"><div class="actions"><button class="btn primary" onclick="savePlatformMetrics()">保存今日数据</button></div><div id="metricsMessage" class="help">数据仅保存在当前浏览器。</div></section><section class="platform-card"><b>内容日历</b><div class="calendar-list">${planned.length ? planned.map((x) => `<div class="calendar-row"><span>${x.planDate || '未排期'}</span><strong>${escapePlatform(x.title || x.type || '内容资产')}</strong><small>${escapePlatform(x.status || '草稿')}</small></div>`).join('') : '<div class="empty">暂时没有排期内容。请到内容资产设置计划日期。</div>'}</div></section></div>`);
    },
    brand: () => platformShell('品牌中心', '统一维护品牌、门店、账号和内容规则，AI 生成时会自动读取知识库。', `<div class="platform-grid"><article class="platform-card"><b>品牌知识库</b><p>品牌定位、核心卖点、内容边界和传播语气。</p><button class="btn soft" onclick="openKnowledge('brand.md')">查看品牌规则</button></article><article class="platform-card"><b>门店知识库</b><p>梅溪湖、林科大、河西大学城的区域和场景差异。</p><button class="btn soft" onclick="openKnowledge('stores.md')">查看门店规则</button></article><article class="platform-card"><b>账号矩阵</b><p>品牌总账号、门店账号和健康餐垂类账号的定位与写作差异。</p><button class="btn primary" onclick="openKnowledge('accounts.md')">查看账号矩阵</button></article><article class="platform-card"><b>菜单知识库</b><p>菜品结构、搭配表达和事实校验边界。</p><button class="btn soft" onclick="openKnowledge('menu.md')">查看菜单规则</button></article></div><div id="accountMatrixPreview" class="account-list"></div><div id="platformOutput" class="platform-output">知识库文件位于 /knowledge，可直接维护。</div>`),
    secretary: () => platformShell('AI 运营秘书', '将门店、人群、场景和问题交给统一 AI Adapter；在线失败会自动使用本地建议。', `<div class="secretary"><label>告诉运营秘书当前问题</label><textarea id="secretaryInput" placeholder="例如：林科大最近互动下降，今天应该做什么？"></textarea><div class="actions"><button class="btn primary" onclick="askSecretary()">生成运营建议</button><button class="btn soft" onclick="fillSecretary()">使用示例问题</button></div></div><div id="platformOutput" class="platform-output">运营建议会结合当前上下文生成。</div>`),
    store: () => platformShell('门店中心', '集中维护门店定位、人群、场景和本地搜索信号。', `<div id="storeCenterList" class="store-list"></div><div class="platform-output">门店资料来自 data/stores.json；AI 生成时同时读取 stores.md 和当前上下文。</div>`),
    system: () => platformShell('系统中心', '管理运行模式、数据边界和未来扩展接口。', `<div class="platform-grid"><article class="platform-card"><b>当前运行上下文</b><p>${escapePlatform(platformContext())}</p><span class="asset-chip">Provider 状态见顶部</span></article><article class="platform-card"><b>数据存储</b><p>学习库、草稿、内容资产和复盘指标保存在当前浏览器。可通过内容资产导出迁移。</p><span class="asset-chip">本地存储</span></article><article class="platform-card"><b>离线模式</b><p>关闭网络后仍可使用本地模板、学习库、资产、发布检查和草稿；在线 AI 需要本地服务或 Netlify Function。</p><span class="asset-chip">本地兜底</span></article><article class="platform-card"><b>扩展预留</b><p>AI Adapter、Prompt 中心、品牌知识库和 Router 已建立，可继续接入数据库与权限系统。</p><span class="asset-chip">ES Modules</span></article></div>`)
  };
  box.innerHTML = (views[page] || views.marketing)();
  if (page === 'brand') window.BLBQBrandOS?.renderAccountMatrix?.();
  if (page === 'store') window.BLBQBrandOS?.renderStoreCenter?.();
}
function escapePlatform(value) { return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function renderNotes(notes = []) { return notes.length ? `<div class="platform-card"><b>运营待办</b>${notes.slice(0, 8).map((x) => `<div class="calendar-row"><span>${new Date(x.createdAt).toLocaleDateString('zh-CN')}</span><strong>${escapePlatform(x.title)}</strong><small>待处理</small></div>`).join('')}</div>` : ''; }
function localPlatformCopy(type, context) {
  const maps = {
    社群: `【今日社群话术】\n${context}\n\n午餐时间到了，今天想看哪道菜？评论区告诉我，晚上菜单继续给大家安排。\n\n【互动问题】\n你们更想看牛肉、虾仁还是时蔬搭配？`,
    活动: `【活动方案】\n主题：${context}饭点互动日\n机制：评论区选菜 + 门店现场小福利\n内容：先发社群互动，再用小红书记录真实反馈。\n注意：价格、库存和活动期限发布前由门店确认。`,
    校园: `【校园运营建议】\n围绕${context}，今天优先安排：\n1. 午餐前发一条真实菜单场景内容\n2. 下午在社群做选菜互动\n3. 晚八下课后发布真实饭盒照片\n4. 收集评论，为下一周菜单提供依据。`
  };
  return maps[type] || maps.社群;
}
async function generatePlatformCopy(type) {
  const output = $p('platformOutput');
  if (!output) return;
  const context = platformContext();
  output.textContent = 'AI 正在生成，在线服务失败时会自动切换本地模板…';
  try {
    const result = await window.BLBQAI?.generate?.(currentPayload(type === '社群' ? 'post' : 'post', `${type}运营任务\n当前上下文：${context}\n请输出可直接执行的${type}运营方案。`));
    output.textContent = result?.text || localPlatformCopy(type, context);
    window.toast?.(result?.source === 'local' ? '在线 AI 不可用，已使用本地兜底' : 'AI 生成完成');
  } catch (error) {
    output.textContent = `${localPlatformCopy(type, context)}\n\n[在线 AI 暂不可用：${error?.message || '请求失败'}]`;
    window.toast?.('已切换本地兜底');
  }
}
function fillSecretary() { const input = $p('secretaryInput'); if (input) input.value = `${$p('store')?.value || '当前门店'}最近互动下降，今天应该做什么？`; }
async function askSecretary() {
  const output = $p('platformOutput');
  const question = $p('secretaryInput')?.value.trim() || '今天应该做什么？';
  if (!output) return;
  output.textContent = '运营秘书正在分析当前门店和问题…';
  try {
    const result = await window.BLBQAI?.generate?.(currentPayload('post', `你是饱里宝气 AI 运营秘书。请回答：${question}\n请给出今天可执行的 4 步计划、每一步的渠道和判断依据。`));
    if (!result?.text) throw new Error('AI 模块尚未加载');
    output.textContent = result.text;
    window.toast?.(result?.source === 'local' ? '已使用本地运营建议' : '运营建议已生成');
  } catch (error) {
    output.textContent = `【AI 运营秘书建议】\n问题：${question}\n\n1. 中午前发布真实菜单和饭点痛点内容。\n2. 下午在社群发起选菜互动。\n3. 晚餐前补一条下课场景内容。\n4. 晚上记录评论、收藏和私信，更新内容资产。\n\n在线 AI 暂不可用：${error?.message || '请求失败'}`;
    window.toast?.('已使用本地运营建议');
  }
}
async function generateHotTopic() {
  const output = $p('platformOutput');
  const topic = $p('hotTopicInput')?.value.trim() || '今天适合大学生餐饮运营的本地生活话题';
  if (!output) return;
  output.textContent = '正在整理热点选题…';
  try {
    const result = await window.BLBQAI?.generate?.(currentPayload('post', `热点助手任务：${topic}\n请输出 3 个饱里宝气可执行选题，每个包含：为什么适合、适合账号、标题方向、图片方向、发布时间和风险提醒。不要声称掌握未提供的实时数据。`));
    if (!result?.text) throw new Error('AI 模块尚未加载');
    output.textContent = result.text;
    window.toast?.(result.source === 'local' ? '已使用本地热点策划模板' : '热点选题已生成');
  } catch (error) {
    output.textContent = `【热点选题建议】\n围绕“${topic}”制作一条真实饭点场景内容。\n\n1. 标题：把热点和门店/人群/场景绑定。\n2. 图片：使用真实饭盒或门店素材，不使用虚构截图。\n3. 账号：优先选择对应门店账号。\n4. 发布前：核对活动、价格、时间和门店事实。\n\n在线 AI 暂不可用：${error?.message || '请求失败'}`;
    window.toast?.('已使用本地热点策划模板');
  }
}
function savePlatformMetrics() {
  writeMetrics({ exposure: Number($p('metricExposure')?.value || 0), engagement: Number($p('metricEngagement')?.value || 0), conversion: Number($p('metricConversion')?.value || 0), date: new Date().toISOString() });
  const message = $p('metricsMessage');
  if (message) message.textContent = `已保存 ${new Date().toLocaleDateString('zh-CN')} 的运营数据。`;
  window.toast?.('今日运营数据已保存');
}
function addPlatformNote(title) { const data = readPlatform(); data.notes.unshift({ id: Date.now().toString(36), title, createdAt: new Date().toISOString() }); writePlatform(data); renderPlatformPage('marketing'); window.toast?.('已加入运营待办'); }
async function openKnowledge(file) { const output = $p('platformOutput'); if (!output) return; try { const response = await fetch(`knowledge/${file}`, { cache: 'no-store' }); output.textContent = response.ok ? await response.text() : '知识库文件暂不可访问'; } catch { output.textContent = '本地文件读取失败，请通过本地服务打开，或直接编辑 knowledge 目录。'; } }

window.renderPlatformPage = renderPlatformPage;
window.generatePlatformCopy = generatePlatformCopy;
window.fillSecretary = fillSecretary;
window.askSecretary = askSecretary;
window.generateHotTopic = generateHotTopic;
window.savePlatformMetrics = savePlatformMetrics;
window.addPlatformNote = addPlatformNote;
window.openKnowledge = openKnowledge;
