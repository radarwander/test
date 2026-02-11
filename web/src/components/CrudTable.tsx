import { Button, Form, Input, Modal, Popconfirm, Space, Table, message } from 'antd';
import { useEffect, useState } from 'react';
import { api } from '../api/client';

export function CrudTable({
  title,
  endpoint,
  columns,
  fields,
  extraActions
}: {
  title: string;
  endpoint: string;
  columns: any[];
  fields: { name: string; label: string; required?: boolean }[];
  extraActions?: (record: any, reload: () => void) => React.ReactNode;
}) {
  const [rows, setRows] = useState<any[]>([]);
  const [meta, setMeta] = useState({ page: 1, pageSize: 10, total: 0 });
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [form] = Form.useForm();

  const load = async (page = meta.page, pageSize = meta.pageSize) => {
    setLoading(true);
    const res = await api.get(endpoint, { params: { page, pageSize, search } });
    setRows(res.data.data);
    setMeta(res.data.meta);
    setLoading(false);
  };

  useEffect(() => { load(1); }, [search]);

  const submit = async () => {
    const values = await form.validateFields();
    if (editing) await api.patch(`${endpoint}/${editing.id}`, values);
    else await api.post(endpoint, values);
    message.success('操作成功');
    setOpen(false);
    form.resetFields();
    setEditing(null);
    load();
  };

  return (
    <>
      <Space style={{ marginBottom: 12 }}>
        <Input.Search placeholder={`搜索${title}`} onSearch={(v) => setSearch(v)} allowClear />
        <Button type="primary" onClick={() => setOpen(true)}>新建</Button>
      </Space>
      <Table
        rowKey="id"
        loading={loading}
        dataSource={rows}
        columns={[
          ...columns,
          {
            title: '操作',
            render: (_: any, record: any) => (
              <Space>
                <Button size="small" onClick={() => { setEditing(record); form.setFieldsValue(record); setOpen(true); }}>编辑</Button>
                {extraActions?.(record, load)}
                <Popconfirm title="确认删除?" onConfirm={async () => { await api.delete(`${endpoint}/${record.id}`); load(); }}>
                  <Button danger size="small">删除</Button>
                </Popconfirm>
              </Space>
            )
          }
        ]}
        pagination={{
          current: meta.page,
          pageSize: meta.pageSize,
          total: meta.total,
          onChange: (p, s) => load(p, s)
        }}
      />
      <Modal title={`${editing ? '编辑' : '新建'}${title}`} open={open} onCancel={() => { setOpen(false); setEditing(null); }} onOk={submit}>
        <Form form={form} layout="vertical">
          {fields.map((f) => (
            <Form.Item key={f.name} name={f.name} label={f.label} rules={[{ required: !!f.required, message: `${f.label}必填` }]}>
              <Input />
            </Form.Item>
          ))}
        </Form>
      </Modal>
    </>
  );
}
