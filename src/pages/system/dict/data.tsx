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
import { history, useSearchParams } from '@umijs/max';
import { Button, message, Popconfirm } from 'antd';
import React, { useRef, useState } from 'react';
import {
  createDictData,
  deleteDictData,
  getDictDataPage,
  updateDictData,
} from './service';
import type { DictDataVO } from './types';

const DictDataPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const dictType = searchParams.get('dictType') || '';
  const actionRef = useRef<ActionType>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState<DictDataVO>();

  const columns: ProColumns<DictDataVO>[] = [
    { title: '数据编号', dataIndex: 'id', width: 80, search: false },
    { title: '字典标签', dataIndex: 'label' },
    { title: '字典值', dataIndex: 'value', search: false },
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
    { title: '颜色类型', dataIndex: 'colorType', search: false, width: 100 },
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
          title="确定删除该字典数据？"
          onConfirm={async () => {
            if (record.id) {
              await deleteDictData(record.id);
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
    <PageContainer
      header={{
        title: '字典数据',
        subTitle: dictType ? `字典类型：${dictType}` : undefined,
        onBack: () => history.push('/system/dict'),
      }}
    >
      <ProTable<DictDataVO>
        headerTitle="字典数据列表"
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
          const res = await getDictDataPage({
            pageNo: params.current,
            pageSize: params.pageSize,
            label: params.label,
            dictType,
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
        title={currentRow ? '编辑字典数据' : '新增字典数据'}
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialValues={currentRow || { dictType, sort: 0, status: 0 }}
        modalProps={{ destroyOnClose: true }}
        onFinish={async (values) => {
          const data = { ...values, dictType: values.dictType || dictType };
          if (currentRow?.id) {
            await updateDictData({ ...data, id: currentRow.id });
          } else {
            await createDictData(data);
          }
          message.success(currentRow ? '编辑成功' : '新增成功');
          actionRef.current?.reload();
          return true;
        }}
      >
        <ProFormText
          name="dictType"
          label="字典类型"
          disabled
          initialValue={dictType}
        />
        <ProFormText
          name="label"
          label="字典标签"
          rules={[{ required: true, message: '请输入字典标签' }]}
        />
        <ProFormText
          name="value"
          label="字典值"
          rules={[{ required: true, message: '请输入字典值' }]}
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
        <ProFormText name="colorType" label="颜色类型" />
        <ProFormText name="cssClass" label="CSS Class" />
        <ProFormTextArea name="remark" label="备注" />
      </ModalForm>
    </PageContainer>
  );
};

export default DictDataPage;
