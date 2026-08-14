import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import * as adminApi from '../../api/admin';
import type { PlatformStats } from '../../api/admin';

export default function AdminDashboard() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.getStats()
      .then((res) => setStats(res.data))
      .catch(() => setError('Could not load platform stats.'))
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { label: 'Total Users', value: stats.users.total },
    { label: 'Students', value: stats.users.students },
    { label: 'Instructors', value: stats.users.instructors },
    { label: 'Admins', value: stats.users.admins },
    { label: 'Suspended', value: stats.users.suspended },
    { label: 'Active Courses', value: stats.courses.total_active },
    { label: 'Published', value: stats.courses.published },
    { label: 'Removed', value: stats.courses.removed },
    { label: 'Enrollments', value: stats.enrollments.total },
    { label: 'Orders', value: stats.orders.total },
    { label: 'Paid Orders', value: stats.orders.paid },
    { label: 'Pending Orders', value: stats.orders.pending },
  ] : [];

  return (
    <Container fluid> 
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Admin Dashboard</h2>
        <div className="d-flex gap-2">
          <Link to="/admin/users" className="btn btn-outline-primary btn-sm">Manage Users</Link>
          <Link to="/admin/courses" className="btn btn-outline-primary btn-sm">Manage Courses</Link>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center mt-5"><Spinner animation="border" /></div>
      ) : (
        <Row xs={2} md={4} className="g-3">
          {statCards.map((s) => (
            <Col key={s.label}>
              <Card className="text-center shadow-sm h-100">
                <Card.Body>
                  <h3>{s.value ?? '—'}</h3>
                  <p className="text-muted mb-0 small">{s.label}</p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}