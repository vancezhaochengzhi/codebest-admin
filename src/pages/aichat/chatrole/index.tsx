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
  createChatRole,
  deleteChatRole,
  getChatRoleCategoryList,
  getChatRolePage,
  getModelSimpleList,
  updateChatRole,
} from '../service';
import type { AiChatRoleVO } from '../types';

const ChatRolePage: React.FC = () => {
  const actionRef = useRef<ActionType>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState<AiChatRoleVO>();

  const columns: ProColumns<AiChatRoleVO>[] = [
    { title: '编号', dataIndex: 'id', width: 70, search: false },
    { title: '角色名称', dataIndex: 'name' },
    { title: '分类', dataIndex: 'category', width: 100 },
    { title: '排序', dataIndex: 'sort', search: false, width: 70 },
    { title: '描述', dataIndex: 'description', search: false, ellipsis: true },
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
              await deleteChatRole(record.id);
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
      <ProTable<AiChatRoleVO>
        headerTitle="聊天角色列表"
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
          const res = await getChatRolePage({
            pageNo: params.current,
            pageSize: params.pageSize,
            name: params.name,
            category: params.category,
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
        title={currentRow ? '编辑聊天角色' : '新增聊天角色'}
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialValues={currentRow || { sort: 0, status: 0, publicStatus: true }}
        modalProps={{ destroyOnClose: true }}
        onFinish={async (values) => {
          if (currentRow?.id)
            await updateChatRole({ ...values, id: currentRow.id });
          else await createChatRole(values);
          message.success(currentRow ? '编辑成功' : '新增成功');
          actionRef.current?.reload();
          return true;
        }}
      >
        <ProFormText
          name="name"
          label="角色名称"
          rules={[{ required: true }]}
        />
        <ProFormText name="avatar" label="头像 URL" />
        <ProFormSelect
          name="category"
          label="分类"
          request={async () => {
            const res = await getChatRoleCategoryList();
            return (res.data || []).map((c: string) => ({
              label: c,
              value: c,
            }));
          }}
          fieldProps={{ showSearch: true, allowClear: true }}
        />
        <ProFormDigit
          name="sort"
          label="排序"
          min={0}
          fieldProps={{ precision: 0 }}
        />
        <ProFormTextArea name="description" label="描述" />
        <ProFormTextArea
          name="systemMessage"
          label="角色设定"
          placeholder="告诉 AI 它的角色设定，例如：你是一个 Java 专家"
        />
        <ProFormSelect
          name="modelId"
          label="模型"
          request={async () => {
            const res = await getModelSimpleList(1);
            return (res.data || []).map((m: any) => ({
              label: m.name,
              value: m.id,
            }));
          }}
        />
        <ProFormSelect
          name="publicStatus"
          label="是否公开"
          options={[
            { label: '公开', value: true },
            { label: '私有', value: false },
          ]}
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

export default ChatRolePage;
