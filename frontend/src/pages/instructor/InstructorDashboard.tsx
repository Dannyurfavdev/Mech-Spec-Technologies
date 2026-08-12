import { Link } from 'react-router-dom';
import { Container, Button } from 'react-bootstrap';

export default function InstructorDashboard() {
  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Instructor Dashboard</h2>
        <Button as={Link as any} to="/instructor/courses/new">+ New Course</Button>
      </div>
      <p className="text-muted">Your courses will appear here once loaded.</p>
    </Container>
  );
}