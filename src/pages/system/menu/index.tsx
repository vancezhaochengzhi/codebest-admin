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
import { Button, message, Popconfirm, Tag } from 'antd';
import React, { useRef, useState } from 'react';
import {
  createMenu,
  deleteMenu,
  getMenuList,
  getSimpleMenuList,
  updateMenu,
} from './service';
import type { MenuVO } from './types';

const MENU_TYPE_MAP: Record<number, { text: string; color: string }> = {
  1: { text: '目录', color: 'blue' },
  2: { text: '菜单', color: 'green' },
  3: { text: '按钮', color: 'orange' },
};

/** 将平铺列表转换为树形结构 */
const buildMenuTree = (list: MenuVO[]): MenuVO[] => {
  const map = new Map<number, MenuVO>();
  const roots: MenuVO[] = [];
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

/** 将菜单列表转为 TreeSelect 数据 */
const buildMenuTreeSelect = (list: MenuVO[]): any[] => {
  const tree = buildMenuTree(list);
  const convert = (nodes: MenuVO[]): any[] =>
    nodes.map((n) => ({
      title: n.name,
      value: n.id,
      children: n.children?.length ? convert(n.children) : undefined,
    }));
  return [{ title: '顶级菜单', value: 0, children: convert(tree) }];
};

const MenuPage: React.FC = () => {
  const actionRef = useRef<ActionType>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState<MenuVO>();

  const columns: ProColumns<MenuVO>[] = [
    { title: '菜单名称', dataIndex: 'name', width: 200 },
    { title: '图标', dataIndex: 'icon', search: false, width: 80 },
    {
      title: '类型',
      dataIndex: 'type',
      search: false,
      width: 80,
      render: (_, record) => {
        const t = MENU_TYPE_MAP[record.type ?? 0];
        return t ? <Tag color={t.color}>{t.text}</Tag> : '-';
      },
    },
    { title: '排序', dataIndex: 'sort', search: false, width: 80 },
    {
      title: '权限标识',
      dataIndex: 'permission',
      search: false,
      ellipsis: true,
    },
    { title: '路由路径', dataIndex: 'path', search: false, ellipsis: true },
    {
      title: '组件路径',
      dataIndex: 'component',
      search: false,
      ellipsis: true,
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
      title: '操作',
      valueType: 'option',
      width: 180,
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
        record.type !== 3 && (
          <a
            key="add"
            onClick={() => {
              setCurrentRow(undefined);
              setModalOpen(true);
              // 通过 setTimeout 等弹窗打开后设置默认 parentId
              setTimeout(() => {
                // 这里通过 initialValues 处理
              }, 0);
            }}
          >
            新增子项
          </a>
        ),
        <Popconfirm
          key="delete"
          title="确定删除该菜单？"
          onConfirm={async () => {
            if (record.id) {
              await deleteMenu(record.id);
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
      <ProTable<MenuVO>
        headerTitle="菜单列表"
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
          const res = await getMenuList({
            name: params.name,
            status: params.status,
          });
          const tree = buildMenuTree(res.data || []);
          return { data: tree, success: res.code === 0 };
        }}
        columns={columns}
      />

      <ModalForm
        title={currentRow ? '编辑菜单' : '新增菜单'}
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialValues={
          currentRow || { parentId: 0, type: 1, sort: 0, status: 0 }
        }
        modalProps={{ destroyOnClose: true }}
        onFinish={async (values) => {
          if (currentRow?.id) {
            await updateMenu({ ...values, id: currentRow.id });
          } else {
            await createMenu(values);
          }
          message.success(currentRow ? '编辑成功' : '新增成功');
          actionRef.current?.reload();
          return true;
        }}
      >
        <ProFormTreeSelect
          name="parentId"
          label="上级菜单"
          request={async () => {
            const res = await getSimpleMenuList();
            return buildMenuTreeSelect(res.data || []);
          }}
          fieldProps={{ showSearch: true, treeDefaultExpandAll: true }}
        />
        <ProFormSelect
          name="type"
          label="菜单类型"
          rules={[{ required: true }]}
          options={[
            { label: '目录', value: 1 },
            { label: '菜单', value: 2 },
            { label: '按钮', value: 3 },
          ]}
        />
        <ProFormText
          name="name"
          label="菜单名称"
          rules={[{ required: true, message: '请输入菜单名称' }]}
        />
        <ProFormText name="icon" label="图标" />
        <ProFormDigit
          name="sort"
          label="排序"
          min={0}
          fieldProps={{ precision: 0 }}
        />
        <ProFormText name="path" label="路由路径" />
        <ProFormText name="component" label="组件路径" />
        <ProFormText name="componentName" label="组件名称" />
        <ProFormText name="permission" label="权限标识" />
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

export default MenuPage;
