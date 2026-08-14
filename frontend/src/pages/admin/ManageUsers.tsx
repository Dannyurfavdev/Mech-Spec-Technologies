import { useEffect, useState } from 'react';
import { Container, Table, Badge, Button, Form, Spinner, Alert } from 'react-bootstrap';
import * as adminApi from '../../api/admin';
import type { User, Role } from '../../types';

export default function ManageUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [roleFilter, setRoleFilter] = useState<Role | ''>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actioningId, setActioningId] = useState<number | null>(null);

  const loadUsers = () => {
    setLoading(true);
    setError('');
    adminApi.getUsers(roleFilter || undefined)
      .then((res) => setUsers(res.data))
      .catch(() => setError('Could not load users.'))
      .finally(() => setLoading(false));
  };

  useEffect(loadUsers, [roleFilter]);

  const handleToggleStatus = async (user: User) => {
    setActioningId(user.id);
    setError('');
    try {
      if (user.is_suspended) {
        await adminApi.activateUser(user.id);
      } else {
        await adminApi.suspendUser(user.id);
      }
      setUsers(users.map((u) =>
        u.id === user.id ? { ...u, is_suspended: !u.is_suspended } : u
      ));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Action failed.');
    } finally {
      setActioningId(null);
    }
  };

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Manage Users</h2>
        <Form.Select
          style={{ width: '200px' }}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as Role | '')}
        >
          <option value="">All Roles</option>
          <option value="student">Students</option>
          <option value="instructor">Instructors</option>
        </Form.Select>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center mt-5"><Spinner animation="border" /></div>
      ) : (
        <Table striped hover responsive>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td className="text-capitalize">{user.role}</td>
                <td>
                  <Badge bg={user.is_suspended ? 'secondary' : 'success'}>
                    {user.is_suspended ? 'Suspended' : 'Active'}
                  </Badge>
                </td>
                <td>
                  <Button
                    size="sm"
                    variant={user.is_suspended ? 'outline-success' : 'outline-danger'}
                    disabled={actioningId === user.id}
                    onClick={() => handleToggleStatus(user)}
                  >
                    {actioningId === user.id
                      ? '...'
                      : user.is_suspended ? 'Activate' : 'Suspend'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {!loading && users.length === 0 && (
        <p className="text-muted">No users found.</p>
      )}
    </Container>
  );
}