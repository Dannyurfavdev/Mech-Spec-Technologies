import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import type { Course } from '../../types';

export default function CourseCard({ course }: { course: Course }) {
  return (
    <Card className="h-100 shadow-sm">
      <Card.Body className="d-flex flex-column">
        <Card.Title>{course.title}</Card.Title>
        <Card.Text className="text-muted flex-grow-1">
          {course.description?.slice(0, 100)}
          {course.description?.length > 100 ? '...' : ''}
        </Card.Text>
        {course.price !== undefined && (
          <p className="fw-bold mb-2">KES {course.price}</p>
        )}
        <Button as={Link as any} to={`/courses/${course.id}`} variant="primary">
          View Course
        </Button>
      </Card.Body>
    </Card>
  );
}