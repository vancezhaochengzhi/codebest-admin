import { PlusOutlined } from '@ant-design/icons';
import {
  type ActionType,
  ModalForm,
  PageContainer,
  type ProColumns,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { Button, message, Popconfirm, Tag } from 'antd';
import React, { useRef, useState } from 'react';
import { deleteMusicMy, generateMusic, getMusicMyPage } from '../service';
import type { AiMusicVO } from '../types';

const MUSIC_STATUS: Record<number, { text: string; color: string }> = {
  10: { text: '进行中', color: 'blue' },
  20: { text: '成功', color: 'green' },
  30: { text: '失败', color: 'red' },
};

const MusicPage: React.FC = () => {
  const actionRef = useRef<ActionType>(null);
  const [genOpen, setGenOpen] = useState(false);

  const columns: ProColumns<AiMusicVO>[] = [
    { title: '编号', dataIndex: 'id', width: 70, search: false },
    { title: '标题', dataIndex: 'title', ellipsis: true },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      search: false,
      render: (_, r) => {
        const s = MUSIC_STATUS[r.status ?? 0];
        return s ? <Tag color={s.color}>{s.text}</Tag> : '-';
      },
    },
    { title: '平台', dataIndex: 'platform', width: 80, search: false },
    { title: '模型', dataIndex: 'model', width: 120, search: false },
    { title: '时长(秒)', dataIndex: 'duration', width: 80, search: false },
    {
      title: '音频',
      dataIndex: 'audioUrl',
      width: 200,
      search: false,
      render: (_, r) =>
        r.audioUrl ? (
          <audio controls src={r.audioUrl} style={{ height: 32, width: 180 }}>
            <track kind="captions" />
          </audio>
        ) : (
          '-'
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
      width: 80,
      render: (_, record) => [
        <Popconfirm
          key="del"
          title="确定删除？"
          onConfirm={async () => {
            if (record.id) {
              await deleteMusicMy(record.id);
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
      <ProTable<AiMusicVO>
        headerTitle="我的音乐"
        actionRef={actionRef}
        rowKey="id"
        search={false}
        toolBarRender={() => [
          <Button
            key="gen"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setGenOpen(true)}
          >
            生成音乐
          </Button>,
        ]}
        request={async (params) => {
          const res = await getMusicMyPage({
            pageNo: params.current,
            pageSize: params.pageSize,
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
        title="生成音乐"
        open={genOpen}
        onOpenChange={setGenOpen}
        modalProps={{ destroyOnClose: true }}
        initialValues={{
          platform: 'Suno',
          generateMode: 1,
          model: 'chirp-v3.5',
        }}
        onFinish={async (values) => {
          const res = await generateMusic(values as any);
          if (res.code === 0) {
            message.success('生成任务已提交');
            actionRef.current?.reload();
            return true;
          }
          return false;
        }}
      >
        <ProFormSelect
          name="platform"
          label="平台"
          options={[{ label: 'Suno', value: 'Suno' }]}
          rules={[{ required: true }]}
        />
        <ProFormSelect
          name="generateMode"
          label="模式"
          options={[
            { label: '描述模式', value: 1 },
            { label: '歌词模式', value: 2 },
          ]}
          rules={[{ required: true }]}
        />
        <ProFormText name="model" label="模型" rules={[{ required: true }]} />
        <ProFormTextArea
          name="prompt"
          label="提示词/歌词"
          rules={[{ required: true }]}
          placeholder="描述模式：描述你想要的音乐风格；歌词模式：输入歌词"
        />
        <ProFormText name="title" label="标题" />
        <ProFormSwitch name="makeInstrumental" label="纯音乐" />
      </ModalForm>
    </PageContainer>
  );
};

export default MusicPage;
