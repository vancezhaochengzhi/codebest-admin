import {
  type ActionType,
  PageContainer,
  type ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  message,
  Popconfirm,
  Row,
  Select,
  Spin,
} from 'antd';
import React, { useRef, useState } from 'react';
import { deleteWrite, generateWriteStream, getWritePage } from '../service';
import type { AiWriteVO } from '../types';

const WRITE_TYPE = [
  { label: '撰写', value: 1 },
  { label: '回复', value: 2 },
];
const WRITE_LENGTH = [
  { label: '短', value: 1 },
  { label: '中', value: 2 },
  { label: '长', value: 3 },
];
const WRITE_FORMAT = [
  { label: '邮件', value: 1 },
  { label: '文章', value: 2 },
  { label: '消息', value: 3 },
];
const WRITE_TONE = [
  { label: '正式', value: 1 },
  { label: '幽默', value: 2 },
  { label: '友好', value: 3 },
];
const WRITE_LANGUAGE = [
  { label: '中文', value: 1 },
  { label: '英文', value: 2 },
];

const WritePage: React.FC = () => {
  const actionRef = useRef<ActionType>(null);
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [form] = Form.useForm();

  const handleGenerate = async () => {
    const values = await form.validateFields();
    setGenerating(true);
    setGeneratedContent('');
    try {
      const resp = await generateWriteStream(values);
      const reader = resp.body?.getReader();
      const decoder = new TextDecoder();
      let content = '';
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        // SSE 格式解析
        for (const line of text.split('\n')) {
          if (line.startsWith('data:')) {
            try {
              const json = JSON.parse(line.slice(5));
              if (json.code === 0 && json.data) {
                content += json.data;
                setGeneratedContent(content);
              }
            } catch {
              /* 忽略解析错误 */
            }
          }
        }
      }
    } catch {
      message.error('生成失败');
    } finally {
      setGenerating(false);
    }
  };

  const columns: ProColumns<AiWriteVO>[] = [
    { title: '编号', dataIndex: 'id', width: 70, search: false },
    {
      title: '类型',
      dataIndex: 'type',
      valueEnum: { 1: '撰写', 2: '回复' },
      width: 80,
    },
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
              await deleteWrite(record.id);
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
      <Card title="AI 写作" style={{ marginBottom: 16 }}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            type: 1,
            length: 2,
            format: 1,
            tone: 1,
            language: 1,
          }}
        >
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name="type" label="类型">
                <Select options={WRITE_TYPE} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="length" label="长度">
                <Select options={WRITE_LENGTH} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="format" label="格式">
                <Select options={WRITE_FORMAT} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="tone" label="语气">
                <Select options={WRITE_TONE} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name="language" label="语言">
                <Select options={WRITE_LANGUAGE} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="prompt" label="写作提示">
            <Input.TextArea
              rows={3}
              placeholder="例如：撰写一篇关于人工智能的文章"
            />
          </Form.Item>
          <Form.Item name="originalContent" label="原文（回复模式）">
            <Input.TextArea rows={2} placeholder="仅回复模式时需要填写" />
          </Form.Item>
          <Button type="primary" onClick={handleGenerate} loading={generating}>
            生成
          </Button>
        </Form>
        {(generatedContent || generating) && (
          <Card type="inner" title="生成结果" style={{ marginTop: 16 }}>
            {generating && <Spin size="small" style={{ marginRight: 8 }} />}
            <div style={{ whiteSpace: 'pre-wrap' }}>
              {generatedContent || 'AI 正在生成...'}
            </div>
          </Card>
        )}
      </Card>
      <ProTable<AiWriteVO>
        headerTitle="写作记录"
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 'auto' }}
        request={async (params) => {
          const res = await getWritePage({
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

export default WritePage;
