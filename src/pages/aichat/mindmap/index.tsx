import {
  type ActionType,
  PageContainer,
  type ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { Button, Card, Input, message, Popconfirm, Spin } from 'antd';
import React, { useRef, useState } from 'react';
import {
  deleteMindMap,
  generateMindMapStream,
  getMindMapPage,
} from '../service';
import type { AiMindMapVO } from '../types';

const MindMapPage: React.FC = () => {
  const actionRef = useRef<ActionType>(null);
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      message.warning('请输入思维导图主题');
      return;
    }
    setGenerating(true);
    setGeneratedContent('');
    try {
      const resp = await generateMindMapStream({ prompt: prompt.trim() });
      const reader = resp.body?.getReader();
      const decoder = new TextDecoder();
      let content = '';
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        for (const line of text.split('\n')) {
          if (line.startsWith('data:')) {
            try {
              const json = JSON.parse(line.slice(5));
              if (json.code === 0 && json.data) {
                content += json.data;
                setGeneratedContent(content);
              }
            } catch {
              /* ignore */
            }
          }
        }
      }
      actionRef.current?.reload();
    } catch {
      message.error('生成失败');
    } finally {
      setGenerating(false);
    }
  };

  const columns: ProColumns<AiMindMapVO>[] = [
    { title: '编号', dataIndex: 'id', width: 70, search: false },
    { title: '提示词', dataIndex: 'prompt', ellipsis: true },
    {
      title: '生成内容',
      dataIndex: 'generatedContent',
      search: false,
      ellipsis: true,
    },
    {
      title: '平台/模型',
      search: false,
      width: 140,
      render: (_, r) => `${r.platform || ''}/${r.model || ''}`,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      valueType: 'dateTime',
      search: false,
      width: 170,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 80,
      render: (_, record) => [
        <Popconfirm
          key="del"
          title="确定删除？"
          onConfirm={async () => {
            if (record.id) {
              await deleteMindMap(record.id);
              message.success('删除成功');
              actionRef.current?.reload();
            }
          }}
        >
          <a style={{ color: '#ff4d4f' }}>删除</a>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <PageContainer>
      <Card title="AI 思维导图" style={{ marginBottom: 16 }}>
        <Input.TextArea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          placeholder="输入思维导图主题，例如：Java 学习路线"
          style={{ marginBottom: 12 }}
        />
        <Button type="primary" onClick={handleGenerate} loading={generating}>
          生成导图
        </Button>
        {(generatedContent || generating) && (
          <Card
            type="inner"
            title="生成结果（Markdown 格式）"
            style={{ marginTop: 16 }}
          >
            {generating && <Spin size="small" style={{ marginRight: 8 }} />}
            <pre
              style={{
                whiteSpace: 'pre-wrap',
                maxHeight: 400,
                overflow: 'auto',
              }}
            >
              {generatedContent || 'AI 正在生成...'}
            </pre>
          </Card>
        )}
      </Card>
      <ProTable<AiMindMapVO>
        headerTitle="导图记录"
        actionRef={actionRef}
        rowKey="id"
        search={false}
        request={async (params) => {
          const res = await getMindMapPage({
            pageNo: params.current,
            pageSize: params.pageSize,
          });
          return {
            data: res.data?.list || [],
            total: res.data?.total || 0,
            success: res.code === 0,
          };
        }}
        columns={columns}
      />
    </PageContainer>
  );
};

export default MindMapPage;
