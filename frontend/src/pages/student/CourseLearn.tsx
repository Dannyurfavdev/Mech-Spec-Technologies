import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Card, ListGroup, ProgressBar, Spinner, Alert, Form } from 'react-bootstrap';
import * as enrollmentsApi from '../../api/enrollments';
import * as coursesApi from '../../api/courses';
import type { CourseProgress, CourseDetail } from '../../types';

export default function CourseLearn() {
  const { courseId } = useParams<{ courseId: string }>();
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completingId, setCompletingId] = useState<number | null>(null);

  const loadData = () => {
    if (!courseId) return;
    setLoading(true);
    setError('');
    Promise.all([
      enrollmentsApi.getCourseProgress(Number(courseId)),
      coursesApi.getCourseDetail(Number(courseId)),
    ])
      .then(([progressRes, courseRes]) => {
        setProgress(progressRes.data);
        setCourse(courseRes.data as CourseDetail);
      })
      .catch(() => setError('Could not load course content. Make sure you are enrolled.'))
      .finally(() => setLoading(false));
  };

  useEffect(loadData, [courseId]);

  const handleCompleteLesson = async (lessonId: number) => {
    setCompletingId(lessonId);
    try {
      await enrollmentsApi.completeLesson(lessonId);
      loadData(); // refresh progress after marking complete
    } catch {
      setError('Could not mark lesson complete.');
    } finally {
      setCompletingId(null);
    }
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  if (error) return <Container className="mt-4"><Alert variant="danger">{error}</Alert></Container>;
  if (!progress || !course) return null;

  const completedIds = new Set(progress.completed_lesson_ids || []);

  return (
    <Container className="mb-5">
      <h2>{course.title}</h2>
      <ProgressBar
        now={progress.percent_complete}
        label={`${progress.percent_complete}%`}
        className="mb-3"
        style={{ height: '25px' }}
      />
      <p className="text-muted">
        {progress.completed_count} of {progress.total_lessons} lessons completed
      </p>

      {course.modules?.map((mod) => (
        <Card key={mod.id} className="mb-3">
          <Card.Header>{mod.title}</Card.Header>
          <ListGroup variant="flush">
            {mod.lessons.map((lesson) => {
              const isComplete = completedIds.has(lesson.id);
              return (
                <ListGroup.Item
                  key={lesson.id}
                  className="d-flex justify-content-between align-items-center"
                >
                  <span className={isComplete ? 'text-decoration-line-through text-muted' : ''}>
                    {lesson.title}
                  </span>
                  <Form.Check
                    type="checkbox"
                    checked={isComplete}
                    disabled={isComplete || completingId === lesson.id}
                    onChange={() => !isComplete && handleCompleteLesson(lesson.id)}
                  />
                </ListGroup.Item>
              );
            })}
          </ListGroup>
        </Card>
      ))}

      {(!course.modules || course.modules.length === 0) && (
        <p className="text-muted">This course has no content yet.</p>
      )}
    </Container>
  );
}