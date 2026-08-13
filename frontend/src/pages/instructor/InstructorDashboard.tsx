import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Button, Table, Badge, Spinner, Alert } from 'react-bootstrap';
import * as instructorApi from '../../api/instructorCourses';
import apiClient from '../../api/client';
import type { Course } from '../../types';

export default function InstructorDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiClient.get('/courses/instructor/courses/')
      .then((res) => setCourses(res.data))
      .catch(() => setError('Could not load your courses.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{color : 'black'}}>Instructor Dashboard</h2>
        <Button as={Link as any} to="/instructor/courses/new">+ New Course</Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center mt-5"><Spinner animation="border" /></div>
      ) : courses.length === 0 ? (
        <p className="text-muted">You haven't created any courses yet.</p>
      ) : (
        <Table striped hover responsive>
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id}>
                <td>{course.title}</td>
                <td>
                  <Badge bg={course.is_published ? 'success' : 'secondary'}>
                    {course.is_published ? 'Published' : 'Draft'}
                  </Badge>
                </td>
                <td>
                  <Link to={`/instructor/courses/${course.id}/students`} className="btn btn-sm btn-outline-primary">
                    View Roster
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}