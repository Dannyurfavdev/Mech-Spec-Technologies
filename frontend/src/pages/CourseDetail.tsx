import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Spinner, Alert, Button, Badge, ListGroup, Modal } from 'react-bootstrap';
import * as coursesApi from '../api/courses';
import * as enrollmentsApi from '../api/enrollments';
import { useAuth } from '../auth/AuthContext';
import type { CourseDetail as CourseDetailType } from '../types';

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState<CourseDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState('');
  const [enrollSuccess, setEnrollSuccess] = useState(false);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentReference, setPaymentReference] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!id) return;
    coursesApi.getCourseDetail(Number(id))
      .then((res) => setCourse(res.data as CourseDetailType))
      .catch(() => setError('Course not found or unavailable.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'student') {
      setEnrollError('Only student accounts can enroll in courses.');
      return;
    }
    setEnrolling(true);
    setEnrollError('');
    try {
      const { data } = await enrollmentsApi.checkout(Number(id));

        if (!data.transaction) {
          setEnrollError('You have a pending order for this course. Please contact support or try again.');
          return;
        }

        setPaymentReference(data.transaction.reference);
        setShowPaymentModal(true);
    } catch (err: any) {
      setEnrollError(err.response?.data?.detail || 'Enrollment failed. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!paymentReference) return;
    setConfirming(true);
    setEnrollError('');
    try {
      await enrollmentsApi.confirmPayment(paymentReference);
      setShowPaymentModal(false);
      setEnrollSuccess(true);
    } catch (err: any) {
      setEnrollError(err.response?.data?.detail || 'Payment confirmation failed.');
      setShowPaymentModal(false);
    } finally {
      setConfirming(false);
    }
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  if (error) return <Container className="mt-4"><Alert variant="danger">{error}</Alert></Container>;
  if (!course) return null;

  return (
    <Container className="mb-5" fluid>
      <h2>{course.title}</h2>
      {course.instructor_name && (
        <p className="text-muted">By {course.instructor_name}</p>
      )}
      {course.price !== undefined && (
        <Badge bg="secondary" className="mb-3">KES {course.price}</Badge>
      )}

      <p>{course.description}</p>

      {course.objectives && course.objectives.length > 0 && (
        <>
          <h5 className="mt-4">What You'll Learn</h5>
          <ListGroup variant="flush" className="mb-4">
            {course.objectives.map((obj) => (
              <ListGroup.Item key={obj.id}>✓ {obj.text}</ListGroup.Item>
            ))}
          </ListGroup>
        </>
      )}

      {course.modules && course.modules.length > 0 && (
        <>
          <h5 className="mt-4">Course Content</h5>
          <ListGroup className="mb-4">
            {course.modules.map((mod) => (
              <ListGroup.Item key={mod.id}>
                <strong>{mod.title}</strong>
                {mod.lessons?.length > 0 && (
                  <ul className="mt-2 mb-0">
                    {mod.lessons.map((lesson) => (
                      <li key={lesson.id}>{lesson.title}</li>
                    ))}
                  </ul>
                )}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </>
      )}

      {enrollError && <Alert variant="danger">{enrollError}</Alert>}
      {enrollSuccess ? (
        <Alert variant="success">
          Enrolled! Head to <a href="/my-courses">My Courses</a> to start learning.
        </Alert>
      ) : (
        <Button onClick={handleEnroll} disabled={enrolling} size="lg">
          {enrolling ? 'Starting checkout...' : 'Enroll Now'}
        </Button>
      )}

      <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>This is a simulated payment for <strong>{course.title}</strong>.</p>
          {course.price !== undefined && <p>Amount: KES {course.price}</p>}
          <p className="text-muted small">Reference: {paymentReference}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirmPayment} disabled={confirming}>
            {confirming ? 'Confirming...' : 'Confirm Payment'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}