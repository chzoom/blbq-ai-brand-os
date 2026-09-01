const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "content-type",
    "access-control-allow-methods": "POST, OPTIONS"
  }
});

const taskNames = {
  ping: "连接测试",
  titles: "小红书标题生成",
  post: "小红书正文生成",
  tags: "话题标签生成",
  replies: "评论区回复生成",
  storeDiff: "不同门店内容差异化",
  diagnose: "小红书笔记诊断",
  breakdown: "爆款笔记拆解"
};

function buildPrompt(payload) {
  const { task = "post", depth = "增强", context = {}, extra = "", learning = [] } = payload;
  const learningText = Array.isArray(learning) && learning.length
    ? learning.map((x, i) => `${i + 1}.【${x.type || "素材"}】${x.content || ""}${x.note ? `（备注：${x.note}）` : ""}`).join("\n")
    : "暂无学习素材。";

  const system = `你是“饱里宝气”的小红书运营总监。
品牌：长沙本土中式轻食健康餐，主要服务大学生、考研党、宿舍党和上班族。
门店：梅溪湖店、林科大店、河西大学城店。
内容原则：真实、口语化、有饭点痛点、有场景、有收藏理由，不写成硬广告。
核心卖点：每周换菜单，中午晚上菜品不同，每天现做不隔夜，中国胃轻食，有肉有菜有主食。
避免绝对化词、过度夸张和虚假承诺。`;

  const requirements = {
    ping: "只回复：连接成功",
    titles: "输出：标题20个、爆款标题5个、低风险标题5个、评论区引导5条。标题尽量不重复。",
    post: "输出：标题参考5个、完整正文、标签、门店结尾、图片建议。正文结构为饭点痛点→菜单价值→菜品/场景→真实体验→收藏评论关注引导。",
    tags: "输出品牌词、区域词、人群词、菜品词、场景词，以及一组可直接复制的标签。控制在8-18个高相关标签。",
    replies: "根据补充要求中的真实评论，输出正向评论、问价格、问门店、问菜单、负面反馈和互动引导回复。语气自然、利他、不争辩。",
    storeDiff: "分别输出梅溪湖店、林科大店、河西大学城店的人群、场景、标题方向、正文切入点、图片建议和标签建议，三店内容不要只换门店名。",
    diagnose: "结合标题、正文和图片，输出总分、评分维度、优势、问题、优化动作、标题改写、正文改写方向、封面建议和风险提示。",
    breakdown: "拆解参考爆款的标题钩子、开头结构、情绪价值、场景代入、信息密度、互动设计、图片逻辑，并给出饱里宝气可模仿但不照搬的方案。"
  };

  return `${system}

任务：${taskNames[task] || taskNames.post}
输出强度：${depth}

全局信息：
门店：${context.store || ""}
菜品：${context.dishes || ""}
运营账号：${context.accountName || context.account || "自动选择，请根据门店判断"}
目标人群：${context.people || ""}
场景：${context.scene || ""}
内容平台：${context.platform || "xiaohongshu"}
内容风格：${context.style || ""}
正文类型：${context.postType || ""}
核心卖点：${context.sellingPoints || ""}

补充输入：
${extra || "无"}

学习库参考：
${learningText}

输出要求：
${requirements[task] || requirements.post}

请用中文输出，结构清晰，可直接复制使用。若内容平台不是小红书，请适配对应平台的表达长度、互动方式和结构；不要虚构实时热点、价格、热量、库存或配送信息。`;
}

async function callGemini(payload) {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) throw new Error("GEMINI_API_KEY 未设置");

  const models = [
    process.env.GEMINI_MODEL,
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash"
  ].filter(Boolean);

  const parts = [{ text: buildPrompt(payload) }];
  for (const image of (payload.images || []).slice(0, 3)) {
    const match = typeof image === "string" && image.match(/^data:(image\/[\w.+-]+);base64,(.+)$/);
    if (match) parts.push({ inline_data: { mime_type: match[1], data: match[2] } });
  }

  let lastError = "";
  for (const model of models) {
    let response;
    try {
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-goog-api-key": key
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts }],
          generationConfig: { temperature: 0.72, maxOutputTokens: 3000 }
        })
      });
    } catch (error) {
      throw new Error(`无法连接 Gemini 服务：${error?.message || "网络请求失败"}`);
    }

    const data = await response.json().catch(() => ({}));
    if (response.ok) {
      const text = (data.candidates || [])
        .flatMap(candidate => candidate.content?.parts || [])
        .map(part => part.text || "")
        .filter(Boolean)
        .join("\n");
      if (text) return text;
      lastError = "Gemini 未返回文本";
    } else {
      lastError = data?.error?.message || JSON.stringify(data);
      if (![400, 404].includes(response.status)) break;
    }
  }
  throw new Error(`Gemini 调用失败：${lastError || "没有可用模型"}`);
}

function openAIBaseUrl() {
  return (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, "");
}

async function callOpenAICompatible(payload) {
  const key = (process.env.OPENAI_API_KEY || process.env.BEEAPI_API_KEY || "").trim();
  if (!key) throw new Error("OPENAI_API_KEY 或 BEEAPI_API_KEY 未设置");

  const model = (process.env.OPENAI_MODEL || process.env.BEEAPI_MODEL || "gpt-4o-mini").trim();
  let response;
  try {
    response = await fetch(`${openAIBaseUrl()}/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${key}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: "你是饱里宝气的小红书运营总监。请用中文输出，结构清晰，可直接复制使用。" },
          { role: "user", content: buildPrompt(payload) }
        ],
        temperature: 0.72,
        max_tokens: 3000
      })
    });
  } catch (error) {
    throw new Error(`无法连接 BeeAPI / OpenAI 兼容服务：${error?.message || "网络请求失败"}`);
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error?.message || `OpenAI 兼容服务请求失败（${response.status}）`);
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("OpenAI 兼容服务未返回文本");
  return typeof text === "string" ? text : text.map((part) => part.text || "").join("\n");
}

export default async (request) => {
  if (request.method === "OPTIONS") return new Response(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-headers": "content-type",
      "access-control-allow-methods": "POST, OPTIONS"
    }
  });
  if (request.method !== "POST") return json({ error: "Only POST is allowed" }, 405);

  try {
    const payload = await request.json();
    const provider = (process.env.AI_PROVIDER || "gemini").toLowerCase();
    const text = provider === "openai" || provider === "beeapi"
      ? await callOpenAICompatible(payload)
      : await callGemini(payload);
    const model = provider === "openai" || provider === "beeapi"
      ? (process.env.OPENAI_MODEL || process.env.BEEAPI_MODEL || "openai-compatible")
      : (process.env.GEMINI_MODEL || "gemini");
    return json({ text, provider, model });
  } catch (error) {
    return json({ error: error?.message || "AI 请求失败" }, 500);
  }
};
