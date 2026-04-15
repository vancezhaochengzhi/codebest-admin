import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import {
  type ActionType,
  ModalForm,
  PageContainer,
  type ProColumns,
  ProFormSelect,
  ProFormText,
  ProFormTreeSelect,
  ProTable,
} from '@ant-design/pro-components';
import { Button, message, Popconfirm, Switch } from 'antd';
import React, { useRef, useState } from 'react';
import { getSimpleDeptList } from '../dept/service';
import { getSimplePostList } from '../post/service';
import {
  createUser,
  deleteUser,
  deleteUserList,
  getUserPage,
  resetUserPassword,
  updateUser,
  updateUserStatus,
} from './service';
import type { UserVO } from './types';

/** 将部门列表转换为树形结构 */
const buildDeptTree = (list: any[]): any[] => {
  const map = new Map();
  const roots: any[] = [];
  for (const item of list) {
    map.set(item.id, {
      ...item,
      title: item.name,
      value: item.id,
      children: [],
    });
  }
  for (const item of list) {
    const node = map.get(item.id);
    if (item.parentId && map.has(item.parentId)) {
      map.get(item.parentId).children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
};

const UserPage: React.FC = () => {
  const actionRef = useRef<ActionType>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState<UserVO>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordUserId, setPasswordUserId] = useState<number>();

  const columns: ProColumns<UserVO>[] = [
    { title: '用户编号', dataIndex: 'id', width: 80, search: false },
    { title: '用户名称', dataIndex: 'username' },
    { title: '用户昵称', dataIndex: 'nickname' },
    { title: '部门', dataIndex: 'deptName', search: false },
    { title: '手机号码', dataIndex: 'mobile' },
    {
      title: '状态',
      dataIndex: 'status',
      valueEnum: {
        0: { text: '正常', status: 'Success' },
        1: { text: '停用', status: 'Error' },
      },
      render: (_, record) => (
        <Switch
          checked={record.status === 0}
          onChange={async (checked) => {
            if (record.id) {
              await updateUserStatus(record.id, checked ? 0 : 1);
              message.success('修改成功');
              actionRef.current?.reload();
            }
          }}
        />
      ),
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
      width: 200,
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
        <a
          key="resetPwd"
          onClick={() => {
            setPasswordUserId(record.id);
            setPasswordModalOpen(true);
          }}
        >
          重置密码
        </a>,
        <Popconfirm
          key="delete"
          title="确定删除该用户？"
          onConfirm={async () => {
            if (record.id) {
              await deleteUser(record.id);
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
      <ProTable<UserVO>
        headerTitle="用户列表"
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
              title={`确定删除选中的 ${selectedRowKeys.length} 个用户？`}
              onConfirm={async () => {
                await deleteUserList(selectedRowKeys as number[]);
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
          const res = await getUserPage({
            pageNo: params.current,
            pageSize: params.pageSize,
            username: params.username,
            nickname: params.nickname,
            mobile: params.mobile,
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

      {/* 新增/编辑弹窗 */}
      <ModalForm
        title={currentRow ? '编辑用户' : '新增用户'}
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialValues={currentRow || { sex: 0, status: 0 }}
        modalProps={{ destroyOnClose: true }}
        onFinish={async (values) => {
          if (currentRow?.id) {
            await updateUser({ ...values, id: currentRow.id });
          } else {
            await createUser(values);
          }
          message.success(currentRow ? '编辑成功' : '新增成功');
          actionRef.current?.reload();
          return true;
        }}
      >
        <ProFormText
          name="username"
          label="用户名称"
          rules={[{ required: true, message: '请输入用户名称' }]}
        />
        <ProFormText
          name="nickname"
          label="用户昵称"
          rules={[{ required: true }]}
        />
        {!currentRow && (
          <ProFormText.Password
            name="password"
            label="密码"
            rules={[{ required: true }]}
          />
        )}
        <ProFormTreeSelect
          name="deptId"
          label="所属部门"
          request={async () => {
            const res = await getSimpleDeptList();
            return buildDeptTree(res.data || []);
          }}
          fieldProps={{ showSearch: true, treeDefaultExpandAll: true }}
        />
        <ProFormSelect
          name="postIds"
          label="岗位"
          fieldProps={{ mode: 'multiple' }}
          request={async () => {
            const res = await getSimplePostList();
            return (res.data || []).map((p: any) => ({
              label: p.name,
              value: p.id,
            }));
          }}
        />
        <ProFormText name="mobile" label="手机号码" />
        <ProFormText name="email" label="邮箱" />
        <ProFormSelect
          name="sex"
          label="性别"
          options={[
            { label: '男', value: 1 },
            { label: '女', value: 2 },
            { label: '未知', value: 0 },
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
        <ProFormText name="remark" label="备注" />
      </ModalForm>

      {/* 重置密码弹窗 */}
      <ModalForm
        title="重置密码"
        open={passwordModalOpen}
        onOpenChange={setPasswordModalOpen}
        modalProps={{ destroyOnClose: true }}
        onFinish={async (values) => {
          if (passwordUserId) {
            await resetUserPassword(passwordUserId, values.password);
            message.success('重置密码成功');
            return true;
          }
          return false;
        }}
      >
        <ProFormText.Password
          name="password"
          label="新密码"
          rules={[{ required: true, message: '请输入新密码' }]}
        />
      </ModalForm>
    </PageContainer>
  );
};

export default UserPage;
