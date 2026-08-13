import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, ProgressBar, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import * as enrollmentsApi from '../../api/enrollments';
import type { EnrolledCourse } from '../../types';

export default function MyCourses() {
  const [enrollments, setEnrollments] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    enrollmentsApi.getMyEnrollments()
      .then((res) => setEnrollments(res.data))
      .catch(() => setError('Could not load your courses.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;

  return (
    <Container>
      <h2 className="mb-4">My Courses</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      {!loading && enrollments.length === 0 && !error && (
        <div className="text-center mt-5">
          <p className="text-muted">You haven't enrolled in any courses yet.</p>
          <Button as={Link as any} to="/">Browse Courses</Button>
        </div>
      )}

      <Row xs={1} md={2} lg={3} className="g-4">
        {enrollments.map((enrollment) => (
          <Col key={enrollment.id}>
            <Card className="h-100 shadow-sm">
            <Card.Body>
              <Card.Title>{enrollment.course_detail.title}</Card.Title>
              <p className="text-muted small mb-2">{enrollment.course_detail.category_name}</p>
              <p className="fw-bold">USD {enrollment.course_detail.price}</p>
              <Button
                as={Link as any}
                to={`/my-courses/${enrollment.course}`}
                variant="primary"
                className="mt-2"
              >
                Continue Learning
              </Button>
            </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}