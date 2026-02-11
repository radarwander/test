import { Layout, Menu, Button } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Header, Sider, Content } = Layout;

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const pathname = useLocation().pathname;
  const items = [
    { key: '/', label: <Link to="/">首页</Link> },
    { key: '/customers', label: <Link to="/customers">客户</Link> },
    { key: '/leads', label: <Link to="/leads">线索</Link> },
    { key: '/opportunities', label: <Link to="/opportunities">商机</Link> },
    { key: '/logs', label: <Link to="/logs">日志</Link> },
    ...(user?.role === 'admin' ? [{ key: '/users', label: <Link to="/users">用户管理</Link> }] : [])
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider><Menu theme="dark" selectedKeys={[pathname]} items={items} /></Sider>
      <Layout>
        <Header style={{ color: '#fff', display: 'flex', justifyContent: 'space-between' }}>
          <span>CRM MVP - {user?.name}</span>
          <Button onClick={() => { logout(); navigate('/login'); }}>退出</Button>
        </Header>
        <Content style={{ padding: 16 }}>{children}</Content>
      </Layout>
    </Layout>
  );
};
