import { PlusOutlined } from '@ant-design/icons';
import {
  type ActionType,
  ModalForm,
  PageContainer,
  type ProColumns,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { Button, message, Popconfirm } from 'antd';
import React, { useRef, useState } from 'react';
import {
  createWorkflow,
  deleteWorkflow,
  getWorkflowPage,
  updateWorkflow,
} from '../service';
import type { AiWorkflowVO } from '../types';

const WorkflowPage: React.FC = () => {
  const actionRef = useRef<ActionType>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState<AiWorkflowVO>();

  const columns: ProColumns<AiWorkflowVO>[] = [
    { title: '编号', dataIndex: 'id', width: 70, search: false },
    { title: '标识', dataIndex: 'code' },
    { title: '名称', dataIndex: 'name' },
    { title: '备注', dataIndex: 'remark', search: false, ellipsis: true },
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
              await deleteWorkflow(record.id);
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
      <ProTable<AiWorkflowVO>
        headerTitle="工作流列表"
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
          const res = await getWorkflowPage({
            pageNo: params.current,
            pageSize: params.pageSize,
            name: params.name,
            code: params.code,
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
        title={currentRow ? '编辑工作流' : '新增工作流'}
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialValues={currentRow || { status: 0 }}
        modalProps={{ destroyOnClose: true }}
        onFinish={async (values) => {
          if (currentRow?.id)
            await updateWorkflow({ ...values, id: currentRow.id });
          else await createWorkflow(values);
          message.success(currentRow ? '编辑成功' : '新增成功');
          actionRef.current?.reload();
          return true;
        }}
      >
        <ProFormText
          name="code"
          label="工作流标识"
          rules={[{ required: true }]}
        />
        <ProFormText
          name="name"
          label="工作流名称"
          rules={[{ required: true }]}
        />
        <ProFormTextArea name="remark" label="备注" />
        <ProFormTextArea
          name="graph"
          label="工作流模型 (JSON)"
          rules={[{ required: true }]}
          fieldProps={{ rows: 6 }}
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

export default WorkflowPage;
