import { Button, message } from 'antd';
import { CrudTable } from '../components/CrudTable';
import { api } from '../api/client';

export default function LeadsPage() {
  return (
    <CrudTable
      title="线索"
      endpoint="/leads"
      columns={[{ title: '名称', dataIndex: 'name' }, { title: '来源', dataIndex: 'source' }, { title: '状态', dataIndex: 'status' }, { title: '负责人', render: (_: any, r: any) => r.owner?.name || r.ownerId }]}
      fields={[{ name: 'name', label: '名称', required: true }, { name: 'source', label: '来源', required: true }, { name: 'status', label: '状态' }, { name: 'phone', label: '电话' }, { name: 'email', label: '邮箱' }, { name: 'remark', label: '备注' }]}
      extraActions={(record, reload) => <Button size="small" onClick={async () => { await api.post(`/leads/${record.id}/convert`); message.success('转化成功'); reload(); }}>转化</Button>}
    />
  );
}
