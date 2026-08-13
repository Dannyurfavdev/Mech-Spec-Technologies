import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Card, ListGroup, ProgressBar, Spinner, Alert, Form } from 'react-bootstrap';
import * as enrollmentsApi from '../../api/enrollments';
import type { CourseProgress } from '../../types';

export default function CourseLearn() {
  const { courseId } = useParams<{ courseId: string }>();
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completingId, setCompletingId] = useState<number | null>(null);

  const loadProgress = () => {
    if (!courseId) return;
    setLoading(true);
    enrollmentsApi.getCourseProgress(Number(courseId))
      .then((res) => setProgress(res.data))
      .catch(() => setError('Could not load course progress. Make sure you are enrolled.'))
      .finally(() => setLoading(false));
  };

  useEffect(loadProgress, [courseId]);

  const handleCompleteLesson = async (lessonId: number) => {
    setCompletingId(lessonId);
    try {
      await enrollmentsApi.completeLesson(lessonId);
      loadProgress(); // refresh to get updated percentage
    } catch {
      setError('Could not mark lesson complete.');
    } finally {
      setCompletingId(null);
    }
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  if (error) return <Container className="mt-4"><Alert variant="danger">{error}</Alert></Container>;
  if (!progress) return null;

  const percentage = progress.percentage ??
    (progress.total_lessons > 0
      ? Math.round((progress.completed_lessons / progress.total_lessons) * 100)
      : 0);

  const completedIds = new Set(progress.completed_lesson_ids || []);

  return (
    <Container className="mb-5">
      <h2>Course Progress</h2>
      <ProgressBar now={percentage} label={`${percentage}%`} className="mb-4" style={{ height: '25px' }} />
      <p className="text-muted">
        {progress.completed_lessons} of {progress.total_lessons} lessons completed
      </p>

      {progress.modules?.map((mod) => (
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
    </Container>
  );
}