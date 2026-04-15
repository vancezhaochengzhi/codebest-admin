import { DeleteOutlined, PlusOutlined, SendOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import {
  Button,
  Input,
  List,
  message,
  Popconfirm,
  Spin,
  Typography,
} from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import {
  createConversationMy,
  deleteConversationMy,
  getChatMessageListByConversationId,
  getConversationMyList,
  sendChatMessageStream,
} from './service';
import type { ChatMessageVO, ConversationVO } from './types';

const { TextArea } = Input;
const { Text } = Typography;

const AiChatPage: React.FC = () => {
  const [conversations, setConversations] = useState<ConversationVO[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<number>();
  const [messages, setMessages] = useState<ChatMessageVO[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollTimerRef = useRef<number>();

  const scrollToBottom = () => {
    if (scrollTimerRef.current) return;
    scrollTimerRef.current = window.setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      scrollTimerRef.current = undefined;
    }, 100);
  };

  const loadConversations = async () => {
    setLoading(true);
    try {
      const res = await getConversationMyList();
      if (res.code === 0) setConversations(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (id: number) => {
    const res = await getChatMessageListByConversationId(id);
    if (res.code === 0) {
      setMessages(res.data || []);
      scrollToBottom();
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);
  useEffect(() => {
    if (currentConversationId) loadMessages(currentConversationId);
  }, [currentConversationId]);

  const handleCreate = async () => {
    const res = await createConversationMy({});
    if (res.code === 0 && res.data) {
      await loadConversations();
      setCurrentConversationId(res.data);
    }
  };

  const handleDelete = async (id: number) => {
    await deleteConversationMy(id);
    if (currentConversationId === id) {
      setCurrentConversationId(undefined);
      setMessages([]);
    }
    await loadConversations();
  };

  const handleSend = async () => {
    if (!inputValue.trim() || !currentConversationId) return;
    const content = inputValue.trim();
    setInputValue('');
    setSending(true);
    // 乐观添加用户消息和空的 AI 消息
    const userMsgId = Date.now();
    const aiMsgId = userMsgId + 1;
    setMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        type: 'user',
        content,
        createTime: new Date().toISOString(),
      },
      {
        id: aiMsgId,
        type: 'assistant',
        content: '',
        createTime: new Date().toISOString(),
      },
    ]);
    setTimeout(
      () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }),
      50,
    );

    try {
      const response = await sendChatMessageStream({
        conversationId: currentConversationId,
        content,
        useContext: true,
      });
      if (!response.ok) {
        message.error('请求失败');
        setMessages((prev) => prev.filter((m) => m.id !== aiMsgId));
        return;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        // 处理 SSE 格式数据
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (line.startsWith('data:')) {
            const data = line.slice(5).trim();
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              // 根据后端返回格式提取内容
              const text =
                parsed.content || parsed.text || parsed.message || '';
              if (text) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === aiMsgId ? { ...m, content: m.content + text } : m,
                  ),
                );
                setTimeout(
                  () =>
                    messagesEndRef.current?.scrollIntoView({
                      behavior: 'smooth',
                    }),
                  10,
                );
              }
            } catch {
              /* ignore parse error */
            }
          }
        }
      }
      // 刷新消息列表获取完整数据（包括 segmentIds 等）
      await loadMessages(currentConversationId);
    } catch {
      message.error('发送失败');
      setMessages((prev) => prev.filter((m) => m.id !== aiMsgId));
    } finally {
      setSending(false);
    }
  };

  return (
    <PageContainer>
      <div style={{ display: 'flex', height: 'calc(100vh - 200px)', gap: 16 }}>
        {/* 对话列表 */}
        <div
          style={{
            width: 260,
            borderRight: '1px solid #f0f0f0',
            paddingRight: 16,
            overflow: 'auto',
          }}
        >
          <Button
            type="primary"
            icon={<PlusOutlined />}
            block
            onClick={handleCreate}
            style={{ marginBottom: 12 }}
          >
            新建对话
          </Button>
          <Spin spinning={loading}>
            <List
              dataSource={conversations}
              renderItem={(item) => (
                <List.Item
                  style={{
                    cursor: 'pointer',
                    padding: '8px 12px',
                    borderRadius: 6,
                    background:
                      currentConversationId === item.id ? '#e6f4ff' : undefined,
                  }}
                  onClick={() => setCurrentConversationId(item.id)}
                  actions={[
                    <Popconfirm
                      key="del"
                      title="确定删除？"
                      onConfirm={(e) => {
                        e?.stopPropagation();
                        if (item.id) handleDelete(item.id);
                      }}
                    >
                      <DeleteOutlined
                        onClick={(e) => e.stopPropagation()}
                        style={{ color: '#999' }}
                      />
                    </Popconfirm>,
                  ]}
                >
                  <Text ellipsis style={{ flex: 1 }}>
                    {item.title || '新对话'}
                  </Text>
                </List.Item>
              )}
            />
          </Spin>
        </div>
        {/* 聊天区 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {currentConversationId ? (
            <>
              <div style={{ flex: 1, overflow: 'auto', padding: '0 16px' }}>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      justifyContent:
                        msg.type === 'user' ? 'flex-end' : 'flex-start',
                      marginBottom: 12,
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '70%',
                        padding: '10px 16px',
                        borderRadius: 12,
                        background: msg.type === 'user' ? '#1677ff' : '#f5f5f5',
                        color: msg.type === 'user' ? '#fff' : '#333',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {sending && (
                  <div style={{ marginBottom: 12 }}>
                    <Spin size="small" />
                    <Text type="secondary" style={{ marginLeft: 8 }}>
                      AI 思考中...
                    </Text>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              <div
                style={{
                  padding: '12px 16px',
                  borderTop: '1px solid #f0f0f0',
                  display: 'flex',
                  gap: 8,
                }}
              >
                <TextArea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="输入消息，Enter 发送，Shift+Enter 换行"
                  autoSize={{ minRows: 1, maxRows: 4 }}
                  disabled={sending}
                  onPressEnter={(e) => {
                    if (!e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleSend}
                  loading={sending}
                  disabled={!inputValue.trim()}
                >
                  发送
                </Button>
              </div>
            </>
          ) : (
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#999',
              }}
            >
              请选择或创建一个对话
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default AiChatPage;
