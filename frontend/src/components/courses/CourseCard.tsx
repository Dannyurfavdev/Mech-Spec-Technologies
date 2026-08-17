import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import type { Course } from '../../types';

const PRIMARY = '#1E6FD9';
const TEAL = '#2BA9C9';

export default function CourseCard({ course }: { course: Course }) {
  return (
    <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '12px', overflow: 'hidden' }}>
      <div
        style={{
          height: '120px',
          background: `linear-gradient(135deg, ${PRIMARY}, ${TEAL})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ color: 'rgba(255,255,255,0.55)', fontWeight: 600, fontSize: '13px' }}>
          {course.title}
        </span>
      </div>
      <Card.Body className="d-flex flex-column">
        {(course as any).category_name && (
          <span
            className="mb-2"
            style={{
              display: 'inline-block',
              width: 'fit-content',
              padding: '4px 10px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: 700,
              backgroundColor: '#EAF3FD',
              color: PRIMARY,
            }}
          >
            {(course as any).category_name}
          </span>
        )}
        <Card.Title style={{ fontSize: '15px', fontWeight: 700 }}>{course.title}</Card.Title>
        <Card.Text className="text-muted flex-grow-1" style={{ fontSize: '13px' }}>
          {course.description?.slice(0, 100)}
          {course.description && course.description.length > 100 ? '...' : ''}
        </Card.Text>
        {course.price !== undefined && (
          <p className="fw-bold mb-3" style={{ fontSize: '16px' }}>USD {course.price}</p>
        )}
        <Link
          to={`/courses/${course.id}`}
          className="text-center fw-bold text-decoration-none"
          style={{
            background: `linear-gradient(135deg, ${PRIMARY}, ${TEAL})`,
            color: '#fff',
            borderRadius: '8px',
            padding: '11px',
            fontSize: '14px',
          }}
        >
          View Course
        </Link>
      </Card.Body>
    </Card>
  );
}