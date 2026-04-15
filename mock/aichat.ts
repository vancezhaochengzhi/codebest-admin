import type { Request, Response } from 'express';
import dayjs from 'dayjs';

// 模拟延迟
const waitTime = (time: number = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

// ==================== AI 模型配置 ====================

interface AiModelConfig {
  id: number;
  name: string;
  modelType: string;
  apiKey: string;
  apiUrl: string;
  modelName: string;
  temperature: number;
  maxTokens: number;
  enabled: boolean;
  description?: string;
}

// 模拟模型数据
let aiModels: AiModelConfig[] = [
  {
    id: 1,
    name: 'GPT-4',
    modelType: 'openai',
    apiKey: 'sk-xxx-xxx-xxx',
    apiUrl: 'https://api.openai.com/v1',
    modelName: 'gpt-4',
    temperature: 0.7,
    maxTokens: 4096,
    enabled: true,
    description: 'OpenAI GPT-4 模型，适合复杂推理任务',
  },
  {
    id: 2,
    name: 'GPT-3.5-Turbo',
    modelType: 'openai',
    apiKey: 'sk-xxx-xxx-xxx',
    apiUrl: 'https://api.openai.com/v1',
    modelName: 'gpt-3.5-turbo',
    temperature: 0.7,
    maxTokens: 4096,
    enabled: true,
    description: 'OpenAI GPT-3.5 模型，性价比高',
  },
  {
    id: 3,
    name: 'Claude-3-Opus',
    modelType: 'anthropic',
    apiKey: 'sk-ant-xxx',
    apiUrl: 'https://api.anthropic.com/v1',
    modelName: 'claude-3-opus-20240229',
    temperature: 0.7,
    maxTokens: 4096,
    enabled: true,
    description: 'Anthropic Claude-3 Opus 模型',
  },
  {
    id: 4,
    name: 'Claude-3-Sonnet',
    modelType: 'anthropic',
    apiKey: 'sk-ant-xxx',
    apiUrl: 'https://api.anthropic.com/v1',
    modelName: 'claude-3-sonnet-20240229',
    temperature: 0.7,
    maxTokens: 4096,
    enabled: false,
    description: 'Anthropic Claude-3 Sonnet 模型',
  },
  {
    id: 5,
    name: 'Azure-GPT-4',
    modelType: 'azure',
    apiKey: 'azure-key-xxx',
    apiUrl: 'https://your-resource.openai.azure.com',
    modelName: 'gpt-4',
    temperature: 0.7,
    maxTokens: 4096,
    enabled: false,
    description: 'Azure OpenAI GPT-4 模型',
  },
];

// 获取下一个 ID
const getNextModelId = () => {
  return Math.max(...aiModels.map((m) => m.id)) + 1;
};

// ==================== 对话管理 ====================

interface Conversation {
  id: string;
  title: string;
  modelId: number;
  modelName?: string;
  createTime: string;
  updateTime: string;
  messageCount: number;
  lastMessage?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// 模拟对话数据
let conversations: Conversation[] = [
  {
    id: 'conv-001',
    title: '关于 React 最佳实践的讨论',
    modelId: 1,
    modelName: 'GPT-4',
    createTime: dayjs().subtract(2, 'day').format('YYYY-MM-DD HH:mm:ss'),
    updateTime: dayjs().subtract(2, 'day').format('YYYY-MM-DD HH:mm:ss'),
    messageCount: 5,
    lastMessage: 'React Hooks 是现代 React 开发的基础...',
  },
  {
    id: 'conv-002',
    title: 'Python 数据处理问题',
    modelId: 3,
    modelName: 'Claude-3-Opus',
    createTime: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
    updateTime: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
    messageCount: 3,
    lastMessage: '可以使用 pandas 的 DataFrame 来处理...',
  },
  {
    id: 'conv-003',
    title: '如何写好技术文档',
    modelId: 1,
    modelName: 'GPT-4',
    createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    messageCount: 2,
    lastMessage: '好的技术文档需要清晰的结构...',
  },
];

// 模拟聊天历史数据
const chatHistoryMap: Record<string, ChatMessage[]> = {
  'conv-001': [
    {
      id: 'msg-001-1',
      role: 'user',
      content: '请问 React 中使用 Hooks 有什么最佳实践？',
      timestamp: dayjs().subtract(2, 'day').subtract(1, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      id: 'msg-001-2',
      role: 'assistant',
      content: `React Hooks 的最佳实践包括以下几点：

1. **使用 useCallback 和 useMemo 优化性能**：避免不必要的重新渲染
2. **将相关状态放在一起**：使用对象或自定义 Hook 组合相关逻辑
3. **保持 Hook 简单**：每个 Hook 只做一件事
4. **避免在循环中使用 Hook**：确保 Hook 在顶层调用

你有什么具体的场景想了解吗？`,
      timestamp: dayjs().subtract(2, 'day').subtract(1, 'hour').add(2, 'second').format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      id: 'msg-001-3',
      role: 'user',
      content: '我想了解 useCallback 和 useMemo 的区别',
      timestamp: dayjs().subtract(2, 'day').subtract(30, 'minute').format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      id: 'msg-001-4',
      role: 'assistant',
      content: `useCallback 和 useMemo 的主要区别：

**useCallback**：
- 返回一个缓存的函数
- 用于避免函数的重新创建
- 适合传递给子组件作为 props

**useMemo**：
- 返回一个缓存的值
- 用于避免复杂计算的重复执行
- 适合缓存计算结果`,
      timestamp: dayjs().subtract(2, 'day').subtract(30, 'minute').add(3, 'second').format('YYYY-MM-DD HH:mm:ss'),
    },
  ],
  'conv-002': [
    {
      id: 'msg-002-1',
      role: 'user',
      content: '如何用 Python 处理大型 CSV 文件？',
      timestamp: dayjs().subtract(1, 'day').subtract(2, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      id: 'msg-002-2',
      role: 'assistant',
      content: `处理大型 CSV 文件的建议：

1. **使用 pandas 分块读取**：可以设置 chunksize 参数
2. **使用 Dask 处理超大数据**：支持并行处理
3. **考虑使用数据库**：将数据导入 SQLite 或 PostgreSQL

需要我详细解释哪种方法吗？`,
      timestamp: dayjs().subtract(1, 'day').subtract(2, 'hour').add(5, 'second').format('YYYY-MM-DD HH:mm:ss'),
    },
  ],
  'conv-003': [
    {
      id: 'msg-003-1',
      role: 'user',
      content: '技术文档应该怎么写才容易理解？',
      timestamp: dayjs().subtract(3, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      id: 'msg-003-2',
      role: 'assistant',
      content: `好的技术文档需要清晰的结构，建议遵循以下原则：

1. **明确的标题和目录**：帮助读者快速定位
2. **循序渐进的内容**：从简单到复杂
3. **代码示例**：提供可运行的代码
4. **图文并茂**：使用图表辅助说明
5. **FAQ 部分**：解答常见问题

还有其他想了解的吗？`,
      timestamp: dayjs().subtract(3, 'hour').add(4, 'second').format('YYYY-MM-DD HH:mm:ss'),
    },
  ],
};

// 生成对话 ID
const generateConvId = () => {
  return `conv-${dayjs().format('YYYYMMDDHHmmss')}-${Math.random().toString(36).substr(2, 9)}`;
};

// 生成消息 ID
const generateMsgId = () => {
  return `msg-${dayjs().format('YYYYMMDDHHmmss')}-${Math.random().toString(36).substr(2, 9)}`;
};

// ==================== Mock 接口 ====================

export default {
  // ===== 模型配置相关 =====

  // 获取模型列表
  'GET /admin-api/ai/model/list': async (_req: Request, res: Response) => {
    await waitTime(200);
    res.json({
      code: 0,
      msg: 'success',
      data: aiModels,
    });
  },

  // 获取已启用的模型列表
  'GET /admin-api/ai/model/enabled-list': async (_req: Request, res: Response) => {
    await waitTime(200);
    res.json({
      code: 0,
      msg: 'success',
      data: aiModels.filter((m) => m.enabled),
    });
  },

  // 创建模型配置
  'POST /admin-api/ai/model/create': async (req: Request, res: Response) => {
    await waitTime(300);
    const body = req.body;
    const newModel: AiModelConfig = {
      id: getNextModelId(),
      name: body.name,
      modelType: body.modelType,
      apiKey: body.apiKey,
      apiUrl: body.apiUrl,
      modelName: body.modelName,
      temperature: body.temperature || 0.7,
      maxTokens: body.maxTokens || 4096,
      enabled: body.enabled ?? true,
      description: body.description,
    };
    aiModels.push(newModel);
    res.json({
      code: 0,
      msg: '创建成功',
      data: newModel,
    });
  },

  // 更新模型配置
  'PUT /admin-api/ai/model/update': async (req: Request, res: Response) => {
    await waitTime(300);
    const body = req.body;
    const index = aiModels.findIndex((m) => m.id === body.id);
    if (index >= 0) {
      aiModels[index] = { ...aiModels[index], ...body };
      res.json({
        code: 0,
        msg: '更新成功',
        data: aiModels[index],
      });
    } else {
      res.json({
        code: 404,
        msg: '模型不存在',
        data: null,
      });
    }
  },

  // 删除模型配置
  'DELETE /admin-api/ai/model/delete': async (req: Request, res: Response) => {
    await waitTime(200);
    const { id } = req.query;
    const numId = Number(id);
    aiModels = aiModels.filter((m) => m.id !== numId);
    res.json({
      code: 0,
      msg: '删除成功',
      data: true,
    });
  },

  // 测试模型连接
  'POST /admin-api/ai/model/test': async (req: Request, res: Response) => {
    await waitTime(500);
    const { id } = req.query;
    const model = aiModels.find((m) => m.id === Number(id));
    if (model) {
      res.json({
        code: 0,
        msg: 'success',
        data: {
          success: true,
          message: `模型 ${model.name} 连接测试成功`,
        },
      });
    } else {
      res.json({
        code: 404,
        msg: '模型不存在',
        data: {
          success: false,
          message: '未找到指定的模型配置',
        },
      });
    }
  },

  // ===== 对话管理相关 =====

  // 获取对话列表
  'GET /admin-api/ai/conversation/list': async (_req: Request, res: Response) => {
    await waitTime(200);
    res.json({
      code: 0,
      msg: 'success',
      data: conversations,
    });
  },

  // 创建新对话
  'POST /admin-api/ai/conversation/create': async (req: Request, res: Response) => {
    await waitTime(200);
    const body = req.body;
    const model = aiModels.find((m) => m.id === body.modelId);
    const newConv: Conversation = {
      id: generateConvId(),
      title: body.title || `新对话 ${conversations.length + 1}`,
      modelId: body.modelId || 1,
      modelName: model?.name || 'GPT-4',
      createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      messageCount: 0,
      lastMessage: '',
    };
    conversations.unshift(newConv);
    chatHistoryMap[newConv.id] = [];
    res.json({
      code: 0,
      msg: '创建成功',
      data: newConv,
    });
  },

  // 更新对话（重命名）
  'PUT /admin-api/ai/conversation/update': async (req: Request, res: Response) => {
    await waitTime(200);
    const body = req.body;
    const index = conversations.findIndex((c) => c.id === body.id);
    if (index >= 0) {
      conversations[index] = {
        ...conversations[index],
        title: body.title,
        updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      };
      res.json({
        code: 0,
        msg: '更新成功',
        data: conversations[index],
      });
    } else {
      res.json({
        code: 404,
        msg: '对话不存在',
        data: null,
      });
    }
  },

  // 删除对话
  'DELETE /admin-api/ai/conversation/delete': async (req: Request, res: Response) => {
    await waitTime(200);
    const { id } = req.query;
    conversations = conversations.filter((c) => c.id !== id);
    delete chatHistoryMap[id as string];
    res.json({
      code: 0,
      msg: '删除成功',
      data: true,
    });
  },

  // ===== 聊天消息相关 =====

  // 发送聊天消息（流式 SSE）
  'POST /admin-api/ai/chat/send-stream': async (req: Request, res: Response) => {
    const body = req.body;
    const { modelId, message, conversationId } = body;

    const model = aiModels.find((m) => m.id === modelId);

    let convId = conversationId;
    if (!convId) {
      convId = generateConvId();
      const newConv: Conversation = {
        id: convId,
        title: message.slice(0, 20) + (message.length > 20 ? '...' : ''),
        modelId: modelId,
        modelName: model?.name || 'AI',
        createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        messageCount: 0,
        lastMessage: message.slice(0, 50),
      };
      conversations.unshift(newConv);
      chatHistoryMap[convId] = [];
    }

    const userMsg: ChatMessage = {
      id: generateMsgId(),
      role: 'user',
      content: message,
      timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    };

    if (!chatHistoryMap[convId]) {
      chatHistoryMap[convId] = [];
    }
    chatHistoryMap[convId].push(userMsg);

    // 设置 SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // 生成流式回复
    const fullReply = generateMockReply(message, model?.modelName || 'AI');
    const chunks = splitReplyIntoChunks(fullReply);

    for (const chunk of chunks) {
      res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
      await waitTime(50 + Math.random() * 100);
    }
    res.write('data: [DONE]\n\n');
    res.end();

    // 保存完整消息
    const assistantMsg: ChatMessage = {
      id: generateMsgId(),
      role: 'assistant',
      content: fullReply,
      timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    };
    chatHistoryMap[convId].push(assistantMsg);

    const convIndex = conversations.findIndex((c) => c.id === convId);
    if (convIndex >= 0) {
      conversations[convIndex].messageCount += 2;
      conversations[convIndex].lastMessage = fullReply.slice(0, 50);
      conversations[convIndex].updateTime = dayjs().format('YYYY-MM-DD HH:mm:ss');
    }
  },

  // 发送聊天消息（非流式）
  'POST /admin-api/ai/chat/send': async (req: Request, res: Response) => {
    await waitTime(800);
    const body = req.body;
    const { modelId, message, conversationId } = body;

    const model = aiModels.find((m) => m.id === modelId);

    let convId = conversationId;
    if (!convId) {
      convId = generateConvId();
      const newConv: Conversation = {
        id: convId,
        title: message.slice(0, 20) + (message.length > 20 ? '...' : ''),
        modelId: modelId,
        modelName: model?.name || 'AI',
        createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        messageCount: 0,
        lastMessage: message.slice(0, 50),
      };
      conversations.unshift(newConv);
      chatHistoryMap[convId] = [];
    }

    const userMsg: ChatMessage = {
      id: generateMsgId(),
      role: 'user',
      content: message,
      timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    };

    if (!chatHistoryMap[convId]) {
      chatHistoryMap[convId] = [];
    }
    chatHistoryMap[convId].push(userMsg);

    const aiReply = generateMockReply(message, model?.modelName || 'AI');
    const assistantMsg: ChatMessage = {
      id: generateMsgId(),
      role: 'assistant',
      content: aiReply,
      timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    };
    chatHistoryMap[convId].push(assistantMsg);

    const convIndex = conversations.findIndex((c) => c.id === convId);
    if (convIndex >= 0) {
      conversations[convIndex].messageCount += 2;
      conversations[convIndex].lastMessage = aiReply.slice(0, 50);
      conversations[convIndex].updateTime = dayjs().format('YYYY-MM-DD HH:mm:ss');
    }

    res.json({
      code: 0,
      msg: 'success',
      data: {
        reply: aiReply,
        conversationId: convId,
      },
    });
  },

  // 获取聊天历史
  'GET /admin-api/ai/chat/history': async (req: Request, res: Response) => {
    await waitTime(200);
    const { conversationId } = req.query;
    const history = chatHistoryMap[conversationId as string] || [];
    res.json({
      code: 0,
      msg: 'success',
      data: history,
    });
  },
};

// 模拟 AI 回复生成
function generateMockReply(userMessage: string, modelName: string): string {
  const replies: Record<string, string[]> = {
    code: [
      `这是一个很好的编程问题！让我来帮你分析一下。

根据你的描述，我建议你可以尝试以下方法：

1. **分析问题本质**：首先理解问题的核心是什么
2. **查找相关文档**：参考官方文档了解最佳实践
3. **编写示例代码**：从小例子开始验证思路

如果你能提供更多细节，我可以给出更具体的建议。`,
      `关于代码方面，我有以下几点建议：

这个实现考虑了性能和可维护性，你可以根据实际需求调整。建议从简单的示例开始，逐步完善功能。`,
    ],
    question: [
      `感谢你的提问！${modelName} 很高兴为你解答。

你的问题很有深度，让我从几个角度来分析：

**首先**，需要明确问题的背景...
**其次**，考虑可能的解决方案...
**最后**，评估每种方案的优缺点...

希望这个分析对你有帮助！`,
      `这是一个很好的问题！让我来详细解答。

根据我的理解，你主要关心以下几个方面：
1. 核心概念的理解
2. 实际应用的场景
3. 潜在的注意事项

我建议你可以按照以下步骤来深入理解这个话题。`,
    ],
    general: [
      `我收到了你的消息：${userMessage.slice(0, 50)}

作为 ${modelName}，我会尽力帮助你。你提到的内容很有意思，如果你需要更详细的解释或者有其他问题，请随时告诉我！`,
      `你好！很高兴能与你交流。

关于你提到的内容，我的理解是：这是一个值得深入探讨的话题。如果你能提供更多背景信息，我可以给出更精准的建议。

目前，我建议你先从基础概念入手，逐步深入理解。`,
      `感谢你的输入！这是一个模拟的 AI 响应。

我正在使用 ${modelName} 模型为你生成回复。后端接口已经成功连接，你可以继续提问，我会尽力提供帮助。

（提示：这是 mock 数据，实际部署时需要连接真实的 AI API）`,
    ],
  };

  let category = 'general';
  if (userMessage.includes('代码') || userMessage.includes('编程') || userMessage.includes('函数') || userMessage.includes('实现')) {
    category = 'code';
  } else if (userMessage.includes('?') || userMessage.includes('如何') || userMessage.includes('怎么') || userMessage.includes('什么')) {
    category = 'question';
  }

  const replyList = replies[category];
  return replyList[Math.floor(Math.random() * replyList.length)];
}

// 将回复分割成小块用于流式输出
function splitReplyIntoChunks(reply: string): string[] {
  const chunks: string[] = [];
  // 每次输出 2-5 个字符，模拟真实的流式效果
  let pos = 0;
  while (pos < reply.length) {
    const chunkSize = 2 + Math.floor(Math.random() * 4);
    chunks.push(reply.slice(pos, pos + chunkSize));
    pos += chunkSize;
  }
  return chunks;
}