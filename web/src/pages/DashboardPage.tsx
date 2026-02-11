import { Card, Col, Row } from 'antd';
import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function DashboardPage() {
  const [data, setData] = useState({ customers: 0, leads: 0, opportunityAmount: 0 });
  useEffect(() => { api.get('/stats').then((r) => setData(r.data.data)); }, []);
  return (
    <Row gutter={16}>
      <Col span={8}><Card title="客户数">{data.customers}</Card></Col>
      <Col span={8}><Card title="线索数">{data.leads}</Card></Col>
      <Col span={8}><Card title="商机总金额">¥{data.opportunityAmount}</Card></Col>
    </Row>
  );
}
