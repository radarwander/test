import { CrudTable } from '../components/CrudTable';

export default function UsersPage() {
  return (
    <CrudTable
      title="用户"
      endpoint="/users"
      columns={[{ title: '姓名', dataIndex: 'name' }, { title: '邮箱', dataIndex: 'email' }, { title: '角色', dataIndex: 'role' }]}
      fields={[{ name: 'name', label: '姓名', required: true }, { name: 'email', label: '邮箱', required: true }, { name: 'password', label: '密码', required: true }, { name: 'role', label: '角色', required: true }]}
    />
  );
}
