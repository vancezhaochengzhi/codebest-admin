import { PlusOutlined } from '@ant-design/icons';
import {
  type ActionType,
  ModalForm,
  PageContainer,
  type ProColumns,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProTable,
} from '@ant-design/pro-components';
import { Button, message, Popconfirm } from 'antd';
import React, { useRef, useState } from 'react';
import {
  createModel,
  deleteModel,
  getApiKeySimpleList,
  getModelPage,
  updateModel,
} from '../service';
import type { AiModelVO } from '../types';
import { AI_MODEL_TYPE_OPTIONS, AI_PLATFORM_OPTIONS } from '../types';

const ModelSetPage: React.FC = () => {
  const actionRef = useRef<ActionType>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState<AiModelVO>();

  const columns: ProColumns<AiModelVO>[] = [
    { title: '编号', dataIndex: 'id', width: 70, search: false },
    { title: '模型名字', dataIndex: 'name' },
    { title: '模型标识', dataIndex: 'model', search: false },
    {
      title: '平台',
      dataIndex: 'platform',
      valueEnum: Object.fromEntries(
        AI_PLATFORM_OPTIONS.map((o) => [o.value, o.label]),
      ),
      width: 120,
    },
    {
      title: '类型',
      dataIndex: 'type',
      valueEnum: { 1: '对话', 2: '图片', 3: '音乐' },
      width: 80,
    },
    { title: '排序', dataIndex: 'sort', search: false, width: 70 },
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
          key="delete"
          title="确定删除？"
          onConfirm={async () => {
            if (record.id) {
              await deleteModel(record.id);
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
      <ProTable<AiModelVO>
        headerTitle="模型列表"
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
          const res = await getModelPage({
            pageNo: params.current,
            pageSize: params.pageSize,
            name: params.name,
            platform: params.platform,
            type: params.type,
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
        title={currentRow ? '编辑模型' : '新增模型'}
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialValues={currentRow || { sort: 0, status: 0, type: 1 }}
        modalProps={{ destroyOnClose: true }}
        onFinish={async (values) => {
          if (currentRow?.id)
            await updateModel({ ...values, id: currentRow.id });
          else await createModel(values);
          message.success(currentRow ? '编辑成功' : '新增成功');
          actionRef.current?.reload();
          return true;
        }}
      >
        <ProFormSelect
          name="keyId"
          label="API 密钥"
          rules={[{ required: true }]}
          request={async () => {
            const res = await getApiKeySimpleList();
            return (res.data || []).map((k: any) => ({
              label: k.name,
              value: k.id,
            }));
          }}
        />
        <ProFormText
          name="name"
          label="模型名字"
          rules={[{ required: true }]}
        />
        <ProFormText
          name="model"
          label="模型标识"
          rules={[{ required: true }]}
        />
        <ProFormSelect
          name="platform"
          label="模型平台"
          options={AI_PLATFORM_OPTIONS}
          rules={[{ required: true }]}
        />
        <ProFormSelect
          name="type"
          label="模型类型"
          options={AI_MODEL_TYPE_OPTIONS}
          rules={[{ required: true }]}
        />
        <ProFormDigit
          name="sort"
          label="排序"
          min={0}
          fieldProps={{ precision: 0 }}
        />
        <ProFormSelect
          name="status"
          label="状态"
          options={[
            { label: '正常', value: 0 },
            { label: '停用', value: 1 },
          ]}
        />
        <ProFormDigit
          name="temperature"
          label="温度"
          min={0}
          max={2}
          fieldProps={{ step: 0.1 }}
        />
        <ProFormDigit
          name="maxTokens"
          label="最大 Token"
          min={0}
          fieldProps={{ precision: 0 }}
        />
        <ProFormDigit
          name="maxContexts"
          label="最大上下文"
          min={0}
          fieldProps={{ precision: 0 }}
        />
      </ModalForm>
    </PageContainer>
  );
};

export default ModelSetPage;
