import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
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
  createRole,
  deleteRole,
  deleteRoleList,
  getRolePage,
  updateRole,
} from './service';
import type { RoleVO } from './types';

const RolePage: React.FC = () => {
  const actionRef = useRef<ActionType>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState<RoleVO>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const columns: ProColumns<RoleVO>[] = [
    { title: '角色编号', dataIndex: 'id', width: 80, search: false },
    { title: '角色名称', dataIndex: 'name' },
    { title: '角色标识', dataIndex: 'code' },
    { title: '排序', dataIndex: 'sort', search: false, width: 80 },
    {
      title: '状态',
      dataIndex: 'status',
      valueEnum: {
        0: { text: '正常', status: 'Success' },
        1: { text: '停用', status: 'Error' },
      },
      width: 100,
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
      width: 150,
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
          title="确定删除该角色？"
          onConfirm={async () => {
            if (record.id) {
              await deleteRole(record.id);
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
      <ProTable<RoleVO>
        headerTitle="角色列表"
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
          selectedRowKeys.length > 0 && (
            <Popconfirm
              key="batchDelete"
              title={`确定删除选中的 ${selectedRowKeys.length} 个角色？`}
              onConfirm={async () => {
                await deleteRoleList(selectedRowKeys as number[]);
                message.success('批量删除成功');
                setSelectedRowKeys([]);
                actionRef.current?.reload();
              }}
            >
              <Button danger icon={<DeleteOutlined />}>
                批量删除
              </Button>
            </Popconfirm>
          ),
        ]}
        request={async (params) => {
          const res = await getRolePage({
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
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
      />

      <ModalForm
        title={currentRow ? '编辑角色' : '新增角色'}
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialValues={currentRow || { sort: 0, status: 0 }}
        modalProps={{ destroyOnClose: true }}
        onFinish={async (values) => {
          if (currentRow?.id) {
            await updateRole({ ...values, id: currentRow.id });
          } else {
            await createRole(values);
          }
          message.success(currentRow ? '编辑成功' : '新增成功');
          actionRef.current?.reload();
          return true;
        }}
      >
        <ProFormText
          name="name"
          label="角色名称"
          rules={[{ required: true, message: '请输入角色名称' }]}
        />
        <ProFormText
          name="code"
          label="角色标识"
          rules={[{ required: true, message: '请输入角色标识' }]}
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
        <ProFormTextArea name="remark" label="备注" />
      </ModalForm>
    </PageContainer>
  );
};

export default RolePage;
