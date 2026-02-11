import { CrudTable } from '../components/CrudTable';

export default function OpportunitiesPage() {
  return (
    <CrudTable
      title="商机"
      endpoint="/opportunities"
      columns={[{ title: '标题', dataIndex: 'title' }, { title: '阶段', dataIndex: 'stage' }, { title: '金额', dataIndex: 'amount' }, { title: '客户', render: (_: any, r: any) => r.customer?.name || r.customerId }]}
      fields={[{ name: 'title', label: '标题', required: true }, { name: 'customerId', label: '客户ID', required: true }, { name: 'stage', label: '阶段' }, { name: 'amount', label: '金额', required: true }, { name: 'probability', label: '概率(0-100)' }, { name: 'remark', label: '备注' }]}
    />
  );
}
