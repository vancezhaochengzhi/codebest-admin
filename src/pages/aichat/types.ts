// ========== 对话 (AiChatConversation) ==========

export interface ConversationVO {
  id?: number;
  userId?: number;
  title?: string;
  pinned?: boolean;
  roleId?: number;
  modelId?: number;
  model?: string;
  modelName?: string;
  systemMessage?: string;
  temperature?: number;
  maxTokens?: number;
  maxContexts?: number;
  createTime?: string;
  roleAvatar?: string;
  roleName?: string;
  messageCount?: number;
}

// ========== 消息 (AiChatMessage) ==========

export interface ChatMessageVO {
  id?: number;
  conversationId?: number;
  replyId?: number;
  type?: string; // 'user' | 'assistant'
  userId?: number;
  roleId?: number;
  model?: string;
  modelId?: number;
  content?: string;
  reasoningContent?: string;
  useContext?: boolean;
  segmentIds?: number[];
  segments?: KnowledgeSegment[];
  attachmentUrls?: string[];
  createTime?: string;
}

export interface KnowledgeSegment {
  id?: number;
  content?: string;
  documentId?: number;
  documentName?: string;
}

/** 发送消息请求 */
export interface ChatMessageSendReq {
  conversationId: number;
  content: string;
  useContext?: boolean;
  useSearch?: boolean;
  attachmentUrls?: string[];
}

/** 发送消息响应 */
export interface ChatMessageSendResp {
  send?: ChatMessageSendMessage;
  receive?: ChatMessageSendMessage;
}

export interface ChatMessageSendMessage {
  id?: number;
  type?: string;
  content?: string;
  reasoningContent?: string;
  segmentIds?: number[];
  segments?: KnowledgeSegment[];
  createTime?: string;
}

// ========== 模型 (AiModel) ==========

export interface AiModelVO {
  id?: number;
  keyId?: number;
  name?: string;
  model?: string;
  platform?: string;
  type?: number; // 1=对话 2=图片 3=音乐
  sort?: number;
  status?: number;
  temperature?: number;
  maxTokens?: number;
  maxContexts?: number;
  createTime?: string;
}

// ========== API 密钥 (AiApiKey) ==========

export interface AiApiKeyVO {
  id?: number;
  name?: string;
  apiKey?: string;
  platform?: string;
  url?: string;
  status?: number;
}

// ========== 聊天角色 (AiChatRole) ==========

export interface AiChatRoleVO {
  id?: number;
  name?: string;
  avatar?: string;
  category?: string;
  sort?: number;
  description?: string;
  systemMessage?: string;
  publicStatus?: boolean;
  modelId?: number;
  status?: number;
  createTime?: string;
}

// ========== 平台枚举 ==========

export const AI_PLATFORM_OPTIONS = [
  { label: 'OpenAI', value: 'OpenAI' },
  { label: '通义千问', value: 'TongYi' },
  { label: '文心一言', value: 'YiYan' },
  { label: '讯飞星火', value: 'XingHuo' },
  { label: 'DeepSeek', value: 'DeepSeek' },
  { label: 'Ollama', value: 'Ollama' },
  { label: 'Midjourney', value: 'Midjourney' },
  { label: 'Suno', value: 'Suno' },
];

export const AI_MODEL_TYPE_OPTIONS = [
  { label: '对话', value: 1 },
  { label: '图片', value: 2 },
  { label: '音乐', value: 3 },
];

// ========== 图像生成 (AiImage) ==========

export interface AiImageVO {
  id?: number;
  userId?: number;
  platform?: string;
  model?: string;
  prompt?: string;
  width?: number;
  height?: number;
  status?: number; // 10=进行中 20=成功 30=失败
  publicStatus?: boolean;
  picUrl?: string;
  errorMessage?: string;
  options?: Record<string, string>;
  finishTime?: string;
  createTime?: string;
}

export interface AiImageDrawReq {
  modelId: number;
  prompt: string;
  width: number;
  height: number;
  options?: Record<string, string>;
}

// ========== 知识库 (AiKnowledge) ==========

export interface AiKnowledgeVO {
  id?: number;
  name?: string;
  description?: string;
  embeddingModelId?: number;
  embeddingModel?: string;
  topK?: number;
  similarityThreshold?: number;
  status?: number;
  createTime?: string;
}

// ========== 写作助手 (AiWrite) ==========

export interface AiWriteVO {
  id?: number;
  userId?: number;
  type?: number; // 1=撰写 2=回复
  platform?: string;
  model?: string;
  prompt?: string;
  generatedContent?: string;
  originalContent?: string;
  length?: number;
  format?: number;
  tone?: number;
  language?: number;
  errorMessage?: string;
  createTime?: string;
}

export interface AiWriteGenerateReq {
  type?: number;
  prompt?: string;
  originalContent?: string;
  length: number;
  format: number;
  tone: number;
  language: number;
}

// ========== 思维导图 (AiMindMap) ==========

export interface AiMindMapVO {
  id?: number;
  userId?: number;
  prompt?: string;
  generatedContent?: string;
  platform?: string;
  model?: string;
  errorMessage?: string;
  createTime?: string;
}

// ========== 音乐生成 (AiMusic) ==========

export interface AiMusicVO {
  id?: number;
  userId?: number;
  title?: string;
  lyric?: string;
  imageUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
  status?: number; // 10=进行中 20=成功 30=失败
  gptDescriptionPrompt?: string;
  prompt?: string;
  platform?: string;
  model?: string;
  generateMode?: number; // 1=描述模式 2=歌词模式
  tags?: string[];
  duration?: number;
  publicStatus?: boolean;
  errorMessage?: string;
  createTime?: string;
}

export interface AiMusicGenerateReq {
  platform: string;
  generateMode: number;
  prompt?: string;
  makeInstrumental?: boolean;
  model: string;
  tags?: string[];
  title?: string;
}

// ========== 工作流 (AiWorkflow) ==========

export interface AiWorkflowVO {
  id?: number;
  code?: string;
  name?: string;
  remark?: string;
  status?: number;
  graph?: string;
  createTime?: string;
}
