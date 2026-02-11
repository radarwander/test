import { CrudTable } from '../components/CrudTable';

export default function CustomersPage() {
  return (
    <CrudTable
      title="客户"
      endpoint="/customers"
      columns={[{ title: '名称', dataIndex: 'name' }, { title: '行业', dataIndex: 'industry' }, { title: '等级', dataIndex: 'level' }, { title: '负责人', render: (_: any, r: any) => r.owner?.name || r.ownerId }]}
      fields={[{ name: 'name', label: '名称', required: true }, { name: 'industry', label: '行业' }, { name: 'level', label: '等级' }, { name: 'phone', label: '电话' }, { name: 'email', label: '邮箱' }, { name: 'address', label: '地址' }, { name: 'remark', label: '备注' }]}
    />
  );
}
