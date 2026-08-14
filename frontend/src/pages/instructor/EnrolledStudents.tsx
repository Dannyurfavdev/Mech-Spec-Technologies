import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Table, Spinner, Alert, Badge } from 'react-bootstrap';
import * as instructorApi from '../../api/instructorCourses';
import type { EnrolledStudent } from '../../types';

export default function EnrolledStudents() {
  const { courseId } = useParams<{ courseId: string }>();
  const [students, setStudents] = useState<EnrolledStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!courseId) return;
    instructorApi.getEnrolledStudents(Number(courseId))
      .then((res) => setStudents(res.data))
      .catch((err) => {
        if (err.response?.status === 403) {
          setError("You don't have permission to view this course's roster.");
        } else {
          setError('Could not load enrolled students.');
        }
      })
      .finally(() => setLoading(false));
  }, [courseId]);

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;

  return (
    <Container fluid>
      <h2 className="mb-4" style={{color: 'black'}}>Enrolled Students</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      {!error && students.length === 0 && (
        <p className="text-muted">No students enrolled in this course yet.</p>
      )}

      {!error && students.length > 0 && (
        <Table striped hover responsive>
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Enrolled</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id}>
              <td>{s.student.username}</td>
              <td>{s.student.email}</td>
              <td>{new Date(s.enrolled_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      )}
    </Container>
  );
}