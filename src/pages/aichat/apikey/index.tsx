import { PlusOutlined } from '@ant-design/icons';
import {
  type ActionType,
  ModalForm,
  PageContainer,
  type ProColumns,
  ProFormSelect,
  ProFormText,
  ProTable,
} from '@ant-design/pro-components';
import { Button, message, Popconfirm } from 'antd';
import React, { useRef, useState } from 'react';
import {
  createApiKey,
  deleteApiKey,
  getApiKeyPage,
  updateApiKey,
} from '../service';
import type { AiApiKeyVO } from '../types';
import { AI_PLATFORM_OPTIONS } from '../types';

const ApiKeyPage: React.FC = () => {
  const actionRef = useRef<ActionType>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState<AiApiKeyVO>();

  const columns: ProColumns<AiApiKeyVO>[] = [
    { title: '编号', dataIndex: 'id', width: 70, search: false },
    { title: '名称', dataIndex: 'name' },
    {
      title: '平台',
      dataIndex: 'platform',
      valueEnum: Object.fromEntries(
        AI_PLATFORM_OPTIONS.map((o) => [o.value, o.label]),
      ),
      width: 120,
    },
    {
      title: '密钥',
      dataIndex: 'apiKey',
      search: false,
      ellipsis: true,
      render: (_, r) => (r.apiKey ? `${r.apiKey.substring(0, 6)}****` : '-'),
    },
    { title: '自定义 URL', dataIndex: 'url', search: false, ellipsis: true },
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
              await deleteApiKey(record.id);
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
      <ProTable<AiApiKeyVO>
        headerTitle="API 密钥列表"
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
          const res = await getApiKeyPage({
            pageNo: params.current,
            pageSize: params.pageSize,
            name: params.name,
            platform: params.platform,
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
        title={currentRow ? '编辑 API 密钥' : '新增 API 密钥'}
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialValues={currentRow || { status: 0 }}
        modalProps={{ destroyOnClose: true }}
        onFinish={async (values) => {
          if (currentRow?.id)
            await updateApiKey({ ...values, id: currentRow.id });
          else await createApiKey(values);
          message.success(currentRow ? '编辑成功' : '新增成功');
          actionRef.current?.reload();
          return true;
        }}
      >
        <ProFormText name="name" label="名称" rules={[{ required: true }]} />
        <ProFormSelect
          name="platform"
          label="平台"
          options={AI_PLATFORM_OPTIONS}
          rules={[{ required: true }]}
        />
        <ProFormText name="apiKey" label="密钥" rules={[{ required: true }]} />
        <ProFormText name="url" label="自定义 API 地址" />
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

export default ApiKeyPage;
