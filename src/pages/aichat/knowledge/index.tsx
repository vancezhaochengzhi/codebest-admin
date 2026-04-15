import { PlusOutlined } from '@ant-design/icons';
import {
  type ActionType,
  ModalForm,
  PageContainer,
  type ProColumns,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { Button, message, Popconfirm } from 'antd';
import React, { useRef, useState } from 'react';
import {
  createKnowledge,
  deleteKnowledge,
  getKnowledgePage,
  getModelSimpleList,
  updateKnowledge,
} from '../service';
import type { AiKnowledgeVO } from '../types';

const KnowledgePage: React.FC = () => {
  const actionRef = useRef<ActionType>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState<AiKnowledgeVO>();

  const columns: ProColumns<AiKnowledgeVO>[] = [
    { title: '编号', dataIndex: 'id', width: 70, search: false },
    { title: '知识库名称', dataIndex: 'name' },
    { title: '描述', dataIndex: 'description', search: false, ellipsis: true },
    {
      title: '向量模型',
      dataIndex: 'embeddingModel',
      search: false,
      width: 140,
    },
    { title: 'TopK', dataIndex: 'topK', search: false, width: 70 },
    {
      title: '相似度',
      dataIndex: 'similarityThreshold',
      search: false,
      width: 80,
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueEnum: {
        0: { text: '正常', status: 'Success' },
        1: { text: '停用', status: 'Error' },
      },
      width: 80,
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
      width: 120,
      render: (_, record) => [
        <a
          key="edit"
          onClick={() => {
            setCurrentRow(record);
            setModalOpen(true);
          }}
        >
          编辑
        </a>,
        <Popconfirm
          key="del"
          title="确定删除？"
          onConfirm={async () => {
            if (record.id) {
              await deleteKnowledge(record.id);
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
      <ProTable<AiKnowledgeVO>
        headerTitle="知识库列表"
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 'auto' }}
        toolBarRender={() => [
          <Button
            key="create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setCurrentRow(undefined);
              setModalOpen(true);
            }}
          >
            新增
          </Button>,
        ]}
        request={async (params) => {
          const res = await getKnowledgePage({
            pageNo: params.current,
            pageSize: params.pageSize,
            name: params.name,
            status: params.status,
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
        title={currentRow ? '编辑知识库' : '新增知识库'}
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialValues={
          currentRow || { topK: 3, similarityThreshold: 0.7, status: 0 }
        }
        modalProps={{ destroyOnClose: true }}
        onFinish={async (values) => {
          if (currentRow?.id)
            await updateKnowledge({ ...values, id: currentRow.id });
          else await createKnowledge(values);
          message.success(currentRow ? '编辑成功' : '新增成功');
          actionRef.current?.reload();
          return true;
        }}
      >
        <ProFormText
          name="name"
          label="知识库名称"
          rules={[{ required: true }]}
        />
        <ProFormTextArea name="description" label="描述" />
        <ProFormSelect
          name="embeddingModelId"
          label="向量模型"
          rules={[{ required: true }]}
          request={async () => {
            const res = await getModelSimpleList(1);
            return (res.data || []).map((m: any) => ({
              label: m.name,
              value: m.id,
            }));
          }}
        />
        <ProFormDigit
          name="topK"
          label="TopK"
          min={1}
          max={20}
          rules={[{ required: true }]}
        />
        <ProFormDigit
          name="similarityThreshold"
          label="相似度阈值"
          min={0}
          max={1}
          fieldProps={{ step: 0.1 }}
          rules={[{ required: true }]}
        />
        <ProFormSelect
          name="status"
          label="状态"
          options={[
            { label: '正常', value: 0 },
            { label: '停用', value: 1 },
          ]}
        />
      </ModalForm>
    </PageContainer>
  );
};

export default KnowledgePage;
