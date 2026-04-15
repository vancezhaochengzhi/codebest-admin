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
import { history } from '@umijs/max';
import { Button, message, Popconfirm } from 'antd';
import React, { useRef, useState } from 'react';
import {
  createDictType,
  deleteDictType,
  getDictTypePage,
  updateDictType,
} from './service';
import type { DictTypeVO } from './types';

const DictTypePage: React.FC = () => {
  const actionRef = useRef<ActionType>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState<DictTypeVO>();

  const columns: ProColumns<DictTypeVO>[] = [
    { title: '字典编号', dataIndex: 'id', width: 80, search: false },
    {
      title: '字典名称',
      dataIndex: 'name',
      render: (_, record) => (
        <a
          onClick={() =>
            history.push(`/system/dict-data?dictType=${record.type}`)
          }
        >
          {record.name}
        </a>
      ),
    },
    { title: '字典类型', dataIndex: 'type' },
    {
      title: '状态',
      dataIndex: 'status',
      valueEnum: {
        0: { text: '正常', status: 'Success' },
        1: { text: '停用', status: 'Error' },
      },
      width: 100,
    },
    { title: '备注', dataIndex: 'remark', search: false, ellipsis: true },
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
          title="确定删除该字典类型？"
          onConfirm={async () => {
            if (record.id) {
              await deleteDictType(record.id);
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
      <ProTable<DictTypeVO>
        headerTitle="字典类型列表"
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
          const res = await getDictTypePage({
            pageNo: params.current,
            pageSize: params.pageSize,
            name: params.name,
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
        title={currentRow ? '编辑字典类型' : '新增字典类型'}
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialValues={currentRow || { status: 0 }}
        modalProps={{ destroyOnClose: true }}
        onFinish={async (values) => {
          if (currentRow?.id) {
            await updateDictType({ ...values, id: currentRow.id });
          } else {
            await createDictType(values);
          }
          message.success(currentRow ? '编辑成功' : '新增成功');
          actionRef.current?.reload();
          return true;
        }}
      >
        <ProFormText
          name="name"
          label="字典名称"
          rules={[{ required: true, message: '请输入字典名称' }]}
        />
        <ProFormText
          name="type"
          label="字典类型"
          rules={[{ required: true, message: '请输入字典类型' }]}
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

export default DictTypePage;
