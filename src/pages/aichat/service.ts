import { request } from '@umijs/max';
import type {
  AiApiKeyVO,
  AiChatRoleVO,
  AiModelVO,
  ChatMessageSendReq,
  ChatMessageSendResp,
  ChatMessageVO,
  ConversationVO,
} from './types';

// ==================== 对话管理 ====================

/** 获取【我的】对话列表 */
export async function getConversationMyList() {
  return request<API.CommonResult<ConversationVO[]>>(
    '/admin-api/ai/chat/conversation/my-list',
    {
      method: 'GET',
    },
  );
}

/** 创建【我的】对话 */
export async function createConversationMy(data: {
  roleId?: number;
  knowledgeId?: number;
}) {
  return request<API.CommonResult<number>>(
    '/admin-api/ai/chat/conversation/create-my',
    {
      method: 'POST',
      data,
    },
  );
}

/** 更新【我的】对话 */
export async function updateConversationMy(data: {
  id: number;
  title?: string;
}) {
  return request<API.CommonResult<boolean>>(
    '/admin-api/ai/chat/conversation/update-my',
    {
      method: 'PUT',
      data,
    },
  );
}

/** 删除【我的】对话 */
export async function deleteConversationMy(id: number) {
  return request<API.CommonResult<boolean>>(
    '/admin-api/ai/chat/conversation/delete-my',
    {
      method: 'DELETE',
      params: { id },
    },
  );
}

/** 获取对话分页(管理) */
export async function getConversationPage(params: any) {
  return request<API.CommonResult<{ list: ConversationVO[]; total: number }>>(
    '/admin-api/ai/chat/conversation/page',
    { method: 'GET', params },
  );
}

// ==================== 消息管理 ====================

/** 获取指定对话的消息列表 */
export async function getChatMessageListByConversationId(
  conversationId: number,
) {
  return request<API.CommonResult<ChatMessageVO[]>>(
    '/admin-api/ai/chat/message/list-by-conversation-id',
    { method: 'GET', params: { conversationId } },
  );
}

/** 发送消息（非流式） */
export async function sendChatMessage(data: ChatMessageSendReq) {
  return request<API.CommonResult<ChatMessageSendResp>>(
    '/admin-api/ai/chat/message/send',
    {
      method: 'POST',
      data,
    },
  );
}

/** 发送消息（流式 SSE） */
export function sendChatMessageStream(
  data: ChatMessageSendReq,
): Promise<Response> {
  const token = localStorage.getItem('token');
  const tenantId = localStorage.getItem('tenantId') || '1';
  return fetch('/admin-api/ai/chat/message/send-stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
      'tenant-id': tenantId,
    },
    body: JSON.stringify(data),
  });
}

/** 删除消息 */
export async function deleteChatMessage(id: number) {
  return request<API.CommonResult<boolean>>(
    '/admin-api/ai/chat/message/delete',
    {
      method: 'DELETE',
      params: { id },
    },
  );
}

// ==================== 模型管理 ====================

/** 获取模型分页 */
export async function getModelPage(params: any) {
  return request<API.CommonResult<{ list: AiModelVO[]; total: number }>>(
    '/admin-api/ai/model/page',
    {
      method: 'GET',
      params,
    },
  );
}

/** 获取模型精简列表 */
export async function getModelSimpleList(type: number, platform?: string) {
  return request<API.CommonResult<AiModelVO[]>>(
    '/admin-api/ai/model/simple-list',
    {
      method: 'GET',
      params: { type, platform },
    },
  );
}

/** 创建模型 */
export async function createModel(data: AiModelVO) {
  return request<API.CommonResult<number>>('/admin-api/ai/model/create', {
    method: 'POST',
    data,
  });
}

/** 更新模型 */
export async function updateModel(data: AiModelVO) {
  return request<API.CommonResult<boolean>>('/admin-api/ai/model/update', {
    method: 'PUT',
    data,
  });
}

/** 删除模型 */
export async function deleteModel(id: number) {
  return request<API.CommonResult<boolean>>('/admin-api/ai/model/delete', {
    method: 'DELETE',
    params: { id },
  });
}

// ==================== API 密钥管理 ====================

export async function getApiKeyPage(params: any) {
  return request<API.CommonResult<{ list: AiApiKeyVO[]; total: number }>>(
    '/admin-api/ai/api-key/page',
    {
      method: 'GET',
      params,
    },
  );
}

export async function getApiKeySimpleList() {
  return request<API.CommonResult<{ id: number; name: string }[]>>(
    '/admin-api/ai/api-key/simple-list',
    {
      method: 'GET',
    },
  );
}

export async function createApiKey(data: AiApiKeyVO) {
  return request<API.CommonResult<number>>('/admin-api/ai/api-key/create', {
    method: 'POST',
    data,
  });
}

export async function updateApiKey(data: AiApiKeyVO) {
  return request<API.CommonResult<boolean>>('/admin-api/ai/api-key/update', {
    method: 'PUT',
    data,
  });
}

export async function deleteApiKey(id: number) {
  return request<API.CommonResult<boolean>>('/admin-api/ai/api-key/delete', {
    method: 'DELETE',
    params: { id },
  });
}

// ==================== 聊天角色管理 ====================

export async function getChatRolePage(params: any) {
  return request<API.CommonResult<{ list: AiChatRoleVO[]; total: number }>>(
    '/admin-api/ai/chat-role/page',
    {
      method: 'GET',
      params,
    },
  );
}

export async function createChatRole(data: AiChatRoleVO) {
  return request<API.CommonResult<number>>('/admin-api/ai/chat-role/create', {
    method: 'POST',
    data,
  });
}

export async function updateChatRole(data: AiChatRoleVO) {
  return request<API.CommonResult<boolean>>('/admin-api/ai/chat-role/update', {
    method: 'PUT',
    data,
  });
}

export async function deleteChatRole(id: number) {
  return request<API.CommonResult<boolean>>('/admin-api/ai/chat-role/delete', {
    method: 'DELETE',
    params: { id },
  });
}

export async function getChatRoleCategoryList() {
  return request<API.CommonResult<string[]>>(
    '/admin-api/ai/chat-role/category-list',
    {
      method: 'GET',
    },
  );
}

// ==================== 图像生成 ====================

import type {
  AiImageDrawReq,
  AiImageVO,
  AiKnowledgeVO,
  AiMindMapVO,
  AiMusicGenerateReq,
  AiMusicVO,
  AiWorkflowVO,
  AiWriteGenerateReq,
  AiWriteVO,
} from './types';

export async function drawImage(data: AiImageDrawReq) {
  return request<API.CommonResult<number>>('/admin-api/ai/image/draw', {
    method: 'POST',
    data,
  });
}
export async function getImageMyPage(params: any) {
  return request<API.CommonResult<{ list: AiImageVO[]; total: number }>>(
    '/admin-api/ai/image/my-page',
    { method: 'GET', params },
  );
}
export async function getImagePage(params: any) {
  return request<API.CommonResult<{ list: AiImageVO[]; total: number }>>(
    '/admin-api/ai/image/page',
    { method: 'GET', params },
  );
}
export async function deleteImageMy(id: number) {
  return request<API.CommonResult<boolean>>('/admin-api/ai/image/delete-my', {
    method: 'DELETE',
    params: { id },
  });
}

// ==================== 知识库 ====================

export async function getKnowledgePage(params: any) {
  return request<API.CommonResult<{ list: AiKnowledgeVO[]; total: number }>>(
    '/admin-api/ai/knowledge/page',
    { method: 'GET', params },
  );
}
export async function createKnowledge(data: AiKnowledgeVO) {
  return request<API.CommonResult<number>>('/admin-api/ai/knowledge/create', {
    method: 'POST',
    data,
  });
}
export async function updateKnowledge(data: AiKnowledgeVO) {
  return request<API.CommonResult<boolean>>('/admin-api/ai/knowledge/update', {
    method: 'PUT',
    data,
  });
}
export async function deleteKnowledge(id: number) {
  return request<API.CommonResult<boolean>>('/admin-api/ai/knowledge/delete', {
    method: 'DELETE',
    params: { id },
  });
}

// ==================== 写作助手 ====================

export async function getWritePage(params: any) {
  return request<API.CommonResult<{ list: AiWriteVO[]; total: number }>>(
    '/admin-api/ai/write/page',
    { method: 'GET', params },
  );
}
export async function deleteWrite(id: number) {
  return request<API.CommonResult<boolean>>('/admin-api/ai/write/delete', {
    method: 'DELETE',
    params: { id },
  });
}
export function generateWriteStream(
  data: AiWriteGenerateReq,
): Promise<Response> {
  const token = localStorage.getItem('token');
  const tenantId = localStorage.getItem('tenantId') || '1';
  return fetch('/admin-api/ai/write/generate-stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
      'tenant-id': tenantId,
    },
    body: JSON.stringify(data),
  });
}

// ==================== 思维导图 ====================

export async function getMindMapPage(params: any) {
  return request<API.CommonResult<{ list: AiMindMapVO[]; total: number }>>(
    '/admin-api/ai/mind-map/page',
    { method: 'GET', params },
  );
}
export async function deleteMindMap(id: number) {
  return request<API.CommonResult<boolean>>('/admin-api/ai/mind-map/delete', {
    method: 'DELETE',
    params: { id },
  });
}
export function generateMindMapStream(data: {
  prompt: string;
}): Promise<Response> {
  const token = localStorage.getItem('token');
  const tenantId = localStorage.getItem('tenantId') || '1';
  return fetch('/admin-api/ai/mind-map/generate-stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
      'tenant-id': tenantId,
    },
    body: JSON.stringify(data),
  });
}

// ==================== 音乐生成 ====================

export async function getMusicMyPage(params: any) {
  return request<API.CommonResult<{ list: AiMusicVO[]; total: number }>>(
    '/admin-api/ai/music/my-page',
    { method: 'GET', params },
  );
}
export async function getMusicPage(params: any) {
  return request<API.CommonResult<{ list: AiMusicVO[]; total: number }>>(
    '/admin-api/ai/music/page',
    { method: 'GET', params },
  );
}
export async function generateMusic(data: AiMusicGenerateReq) {
  return request<API.CommonResult<number[]>>('/admin-api/ai/music/generate', {
    method: 'POST',
    data,
  });
}
export async function deleteMusicMy(id: number) {
  return request<API.CommonResult<boolean>>('/admin-api/ai/music/delete-my', {
    method: 'DELETE',
    params: { id },
  });
}

// ==================== 工作流 ====================

export async function getWorkflowPage(params: any) {
  return request<API.CommonResult<{ list: AiWorkflowVO[]; total: number }>>(
    '/admin-api/ai/workflow/page',
    { method: 'GET', params },
  );
}
export async function createWorkflow(data: AiWorkflowVO) {
  return request<API.CommonResult<number>>('/admin-api/ai/workflow/create', {
    method: 'POST',
    data,
  });
}
export async function updateWorkflow(data: AiWorkflowVO) {
  return request<API.CommonResult<boolean>>('/admin-api/ai/workflow/update', {
    method: 'PUT',
    data,
  });
}
export async function deleteWorkflow(id: number) {
  return request<API.CommonResult<boolean>>('/admin-api/ai/workflow/delete', {
    method: 'DELETE',
    params: { id },
  });
}
