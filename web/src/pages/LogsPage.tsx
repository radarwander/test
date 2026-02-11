import { Table } from 'antd';
import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function LogsPage() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { api.get('/logs?page=1&pageSize=50').then((r) => setRows(r.data.data)); }, []);
  return <Table rowKey="id" dataSource={rows} columns={[{ title: '时间', dataIndex: 'createdAt' }, { title: '操作者', render: (_: any, r: any) => r.actor?.name }, { title: '对象', dataIndex: 'entityType' }, { title: '动作', dataIndex: 'action' }, { title: '实体ID', dataIndex: 'entityId' }]} />;
}
