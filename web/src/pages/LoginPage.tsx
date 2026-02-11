import { Button, Card, Form, Input, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <Card title="CRM 登录" style={{ width: 360 }}>
        <Form onFinish={async (v) => { try { await login(v.email, v.password); navigate('/'); } catch { message.error('登录失败'); } }}>
          <Form.Item name="email" rules={[{ required: true, type: 'email' }]}><Input placeholder="邮箱" /></Form.Item>
          <Form.Item name="password" rules={[{ required: true }]}><Input.Password placeholder="密码" /></Form.Item>
          <Button type="primary" htmlType="submit" block>登录</Button>
        </Form>
      </Card>
    </div>
  );
}
