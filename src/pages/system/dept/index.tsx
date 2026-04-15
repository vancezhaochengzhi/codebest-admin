import { PlusOutlined } from '@ant-design/icons';
import {
  type ActionType,
  ModalForm,
  PageContainer,
  type ProColumns,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProFormTreeSelect,
  ProTable,
} from '@ant-design/pro-components';
import { Button, message, Popconfirm } from 'antd';
import React, { useRef, useState } from 'react';
import { getSimpleUserList } from '../user/service';
import {
  createDept,
  deleteDept,
  getDeptList,
  getSimpleDeptList,
  updateDept,
} from './service';
import type { DeptVO } from './types';

/** 将平铺列表转换为树形结构 */
const buildDeptTree = (list: DeptVO[]): DeptVO[] => {
  const map = new Map<number, DeptVO>();
  const roots: DeptVO[] = [];
  for (const item of list) {
    if (item.id) map.set(item.id, { ...item, children: [] });
  }
  for (const item of list) {
    if (!item.id) continue;
    const node = map.get(item.id);
    if (!node) continue;
    if (item.parentId && item.parentId !== 0 && map.has(item.parentId)) {
      const parent = map.get(item.parentId);
      if (parent?.children) parent.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
};

/** 将部门列表转为 TreeSelect 数据 */
const buildDeptTreeSelect = (list: DeptVO[]): any[] => {
  const tree = buildDeptTree(list);
  const convert = (nodes: DeptVO[]): any[] =>
    nodes.map((n) => ({
      title: n.name,
      value: n.id,
      children: n.children?.length ? convert(n.children) : undefined,
    }));
  return [{ title: '顶级部门', value: 0, children: convert(tree) }];
};

const DeptPage: React.FC = () => {
  const actionRef = useRef<ActionType>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState<DeptVO>();

  const columns: ProColumns<DeptVO>[] = [
    { title: '部门名称', dataIndex: 'name', width: 200 },
    {
      title: '负责人',
      dataIndex: 'leaderUserId',
      search: false,
      width: 120,
    },
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
          title="确定删除该部门？"
          onConfirm={async () => {
            if (record.id) {
              await deleteDept(record.id);
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
      <ProTable<DeptVO>
        headerTitle="部门列表"
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 'auto' }}
        pagination={false}
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
          const res = await getDeptList({
            name: params.name,
            status: params.status,
          });
          const tree = buildDeptTree(res.data || []);
          return { data: tree, success: res.code === 0 };
        }}
        columns={columns}
      />

      <ModalForm
        title={currentRow ? '编辑部门' : '新增部门'}
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialValues={currentRow || { parentId: 0, sort: 0, status: 0 }}
        modalProps={{ destroyOnClose: true }}
        onFinish={async (values) => {
          if (currentRow?.id) {
            await updateDept({ ...values, id: currentRow.id });
          } else {
            await createDept(values);
          }
          message.success(currentRow ? '编辑成功' : '新增成功');
          actionRef.current?.reload();
          return true;
        }}
      >
        <ProFormTreeSelect
          name="parentId"
          label="上级部门"
          request={async () => {
            const res = await getSimpleDeptList();
            return buildDeptTreeSelect(res.data || []);
          }}
          fieldProps={{ showSearch: true, treeDefaultExpandAll: true }}
        />
        <ProFormText
          name="name"
          label="部门名称"
          rules={[{ required: true, message: '请输入部门名称' }]}
        />
        <ProFormDigit
          name="sort"
          label="排序"
          min={0}
          fieldProps={{ precision: 0 }}
        />
        <ProFormSelect
          name="leaderUserId"
          label="负责人"
          request={async () => {
            const res = await getSimpleUserList();
            return (res.data || []).map((u: any) => ({
              label: u.nickname,
              value: u.id,
            }));
          }}
          fieldProps={{ showSearch: true }}
        />
        <ProFormText name="phone" label="联系电话" />
        <ProFormText name="email" label="邮箱" />
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

export default DeptPage;
