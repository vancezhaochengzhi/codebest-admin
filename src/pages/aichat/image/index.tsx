import { PlusOutlined } from '@ant-design/icons';
import {
  type ActionType,
  ModalForm,
  PageContainer,
  type ProColumns,
  ProFormDigit,
  ProFormSelect,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { Button, Image, message, Popconfirm, Tag } from 'antd';
import React, { useRef, useState } from 'react';
import {
  deleteImageMy,
  drawImage,
  getImageMyPage,
  getModelSimpleList,
} from '../service';
import type { AiImageVO } from '../types';

const IMAGE_STATUS: Record<number, { text: string; color: string }> = {
  10: { text: '进行中', color: 'blue' },
  20: { text: '成功', color: 'green' },
  30: { text: '失败', color: 'red' },
};

const ImagePage: React.FC = () => {
  const actionRef = useRef<ActionType>(null);
  const [drawOpen, setDrawOpen] = useState(false);

  const columns: ProColumns<AiImageVO>[] = [
    { title: '编号', dataIndex: 'id', width: 70, search: false },
    { title: '平台', dataIndex: 'platform', width: 100, search: false },
    { title: '提示词', dataIndex: 'prompt', ellipsis: true },
    {
      title: '尺寸',
      search: false,
      width: 100,
      render: (_, r) => `${r.width}×${r.height}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      search: false,
      render: (_, r) => {
        const s = IMAGE_STATUS[r.status ?? 0];
        return s ? <Tag color={s.color}>{s.text}</Tag> : '-';
      },
    },
    {
      title: '图片',
      dataIndex: 'picUrl',
      width: 100,
      search: false,
      render: (_, r) => (r.picUrl ? <Image src={r.picUrl} width={60} /> : '-'),
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
              await deleteImageMy(record.id);
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
      <ProTable<AiImageVO>
        headerTitle="我的绘画"
        actionRef={actionRef}
        rowKey="id"
        search={false}
        toolBarRender={() => [
          <Button
            key="draw"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setDrawOpen(true)}
          >
            生成图片
          </Button>,
        ]}
        request={async (params) => {
          const res = await getImageMyPage({
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
      <ModalForm
        title="AI 绘画"
        open={drawOpen}
        onOpenChange={setDrawOpen}
        modalProps={{ destroyOnClose: true }}
        onFinish={async (values) => {
          const res = await drawImage(values as any);
          if (res.code === 0) {
            message.success('绘画任务已提交');
            actionRef.current?.reload();
            return true;
          }
          return false;
        }}
      >
        <ProFormSelect
          name="modelId"
          label="绘画模型"
          rules={[{ required: true }]}
          request={async () => {
            const res = await getModelSimpleList(2);
            return (res.data || []).map((m: any) => ({
              label: m.name,
              value: m.id,
            }));
          }}
        />
        <ProFormTextArea
          name="prompt"
          label="提示词"
          rules={[{ required: true }]}
          placeholder="描述你想生成的图片"
        />
        <ProFormDigit
          name="width"
          label="宽度"
          initialValue={1024}
          rules={[{ required: true }]}
        />
        <ProFormDigit
          name="height"
          label="高度"
          initialValue={1024}
          rules={[{ required: true }]}
        />
      </ModalForm>
    </PageContainer>
  );
};

export default ImagePage;
