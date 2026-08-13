import { useEffect, useState } from 'react';
import { Container, Table, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import * as adminApi from '../../api/admin';
import type { Course } from '../../types';

export default function ManageCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actioningId, setActioningId] = useState<number | null>(null);

  const loadCourses = () => {
    setLoading(true);
    setError('');
    adminApi.getAdminCourses()
      .then((res) => setCourses(res.data))
      .catch(() => setError('Could not load courses.'))
      .finally(() => setLoading(false));
  };

  useEffect(loadCourses, []);

  const handleToggleRemoved = async (course: Course) => {
    setActioningId(course.id);
    setError('');
    try {
      if (course.is_removed) {
        await adminApi.restoreCourse(course.id);
      } else {
        await adminApi.removeCourse(course.id);
      }
      setCourses(courses.map((c) =>
        c.id === course.id ? { ...c, is_removed: !c.is_removed } : c
      ));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Action failed.');
    } finally {
      setActioningId(null);
    }
  };

  const getStatusBadge = (course: Course) => {
    if (course.is_removed) return <Badge bg="danger">Removed</Badge>;
    if (course.is_published) return <Badge bg="success">Published</Badge>;
    return <Badge bg="secondary">Draft</Badge>;
  };

  return (
    <Container fluid>
      <h2 className="mb-4">Manage Courses</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center mt-5"><Spinner animation="border" /></div>
      ) : (
        <Table striped hover responsive>
          <thead>
            <tr>
              <th>Title</th>
              <th>Instructor</th>
              <th>Price</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id}>
                <td>{course.title}</td>
                <td>{course.instructor_name || '—'}</td>
                <td>{course.price !== undefined ? `KES ${course.price}` : '—'}</td>
                <td>{getStatusBadge(course)}</td>
                <td>
                  <Button
                    size="sm"
                    variant={course.is_removed ? 'outline-success' : 'outline-danger'}
                    disabled={actioningId === course.id}
                    onClick={() => handleToggleRemoved(course)}
                  >
                    {actioningId === course.id
                      ? '...'
                      : course.is_removed ? 'Restore' : 'Remove'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {!loading && courses.length === 0 && (
        <p className="text-muted">No courses found.</p>
      )}
    </Container>
  );
}