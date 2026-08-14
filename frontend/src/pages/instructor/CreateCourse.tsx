import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useEffect } from 'react';
import type { FormEvent } from 'react';
import { Container, Form, Button, Alert, Card, ListGroup, Row, Col } from 'react-bootstrap';
import * as instructorApi from '../../api/instructorCourses';
import * as coursesApi from '../../api/courses';
import type { Category, DraftModule } from '../../types';

export default function CreateCourse() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'basic' | 'content'>('basic');


  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');


  const [courseId, setCourseId] = useState<number | null>(null);
  const [objectives, setObjectives] = useState<string[]>([]);
  const [objectiveInput, setObjectiveInput] = useState('');
  const [modules, setModules] = useState<DraftModule[]>([]);
  const [moduleInput, setModuleInput] = useState('');
  const [lessonInputs, setLessonInputs] = useState<Record<number, { title: string; content: string }>>({});

  useEffect(() => {
    coursesApi.getCategories().then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  const handleCreateCourse = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const { data } = await instructorApi.createCourse({
        title,
        description,
        category: Number(category),
        price: price ? Number(price) : undefined,
      });
      setCourseId(data.id);
      setStep('content');
    } catch (err: any) {
      const data = err.response?.data;
      setError(data ? Object.values(data).flat().join(' ') : 'Failed to create course.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddObjective = async () => {
    if (!objectiveInput.trim() || !courseId) return;
    try {
      await instructorApi.addObjective(courseId, objectiveInput.trim());
      setObjectives([...objectives, objectiveInput.trim()]);
      setObjectiveInput('');
    } catch {
      setError('Failed to add objective.');
    }
  };

  const handleAddModule = async () => {
    if (!moduleInput.trim() || !courseId) return;
    try {
      const { data } = await instructorApi.addModule(courseId, moduleInput.trim());
      setModules([...modules, { id: data.id, title: moduleInput.trim(), lessons: [] }]);
      setModuleInput('');
    } catch {
      setError('Failed to add module.');
    }
  };

  const handleAddLesson = async (moduleId: number) => {
    const lesson = lessonInputs[moduleId];
    if (!lesson?.title?.trim() || !lesson?.content?.trim() || !courseId) return;
    try {
      const { data } = await instructorApi.addLesson(courseId, moduleId, lesson.title.trim(), lesson.content.trim());
      setModules(modules.map((m) =>
        m.id === moduleId
          ? { ...m, lessons: [...m.lessons, { id: data.id, title: lesson.title.trim() }] }
          : m
      ));
      setLessonInputs({ ...lessonInputs, [moduleId]: { title: '', content: '' } });
    } catch {
      setError('Failed to add lesson.');
    }
  };

  const handleFinish = async () => {
    if (!courseId) return;
    try {
      await instructorApi.publishCourse(courseId);
      navigate('/instructor');
    } catch {
      setError('Course saved, but publishing failed. You can publish it later from your dashboard.');
    }
  };

  if (step === 'basic') {
    return (
      <Container style={{ maxWidth: '600px' }} fluid>
        <h2 className="mb-4">Create a New Course</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleCreateCourse}>
          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control value={title} onChange={(e) => setTitle(e.target.value)} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </Form.Group>
          <Row>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Select value={category} onChange={(e) => setCategory(e.target.value)} required>
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Price (USD)</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>
          <Button type="submit" disabled={saving}>
            {saving ? 'Creating...' : 'Continue to Course Content'}
          </Button>
        </Form>
      </Container>
    );
  }

  return (
    <Container style={{ maxWidth: '700px' }}>
      <h2 className="mb-1">{title}</h2>
      <p className="text-muted mb-4">Now add learning objectives and course content.</p>
      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Learning Objectives</Card.Title>
          <ListGroup variant="flush" className="mb-3">
            {objectives.map((obj, i) => <ListGroup.Item key={i}>✓ {obj}</ListGroup.Item>)}
          </ListGroup>
          <div className="d-flex gap-2">
            <Form.Control
              placeholder="e.g. Build a REST API from scratch"
              value={objectiveInput}
              onChange={(e) => setObjectiveInput(e.target.value)}
            />
            <Button onClick={handleAddObjective}>Add</Button>
          </div>
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Modules & Lessons</Card.Title>
          {modules.map((mod) => (
            <Card key={mod.id} className="mb-3 bg-light">
              <Card.Body>
                <strong>{mod.title}</strong>
                <ListGroup variant="flush" className="my-2">
                  {mod.lessons.map((lesson) => (
                    <ListGroup.Item key={lesson.id}>{lesson.title}</ListGroup.Item>
                  ))}
                </ListGroup>
                <div className="d-flex flex-column gap-2">
                    <Form.Control
                      size="sm"
                      placeholder="Lesson title"
                      value={lessonInputs[mod.id]?.title || ''}
                      onChange={(e) => setLessonInputs({
                        ...lessonInputs,
                        [mod.id]: { ...lessonInputs[mod.id], title: e.target.value, content: lessonInputs[mod.id]?.content || '' }
                      })}
                    />
                    <Form.Control
                      as="textarea"
                      size="sm"
                      rows={2}
                      placeholder="Lesson content"
                      value={lessonInputs[mod.id]?.content || ''}
                      onChange={(e) => setLessonInputs({
                        ...lessonInputs,
                        [mod.id]: { ...lessonInputs[mod.id], content: e.target.value, title: lessonInputs[mod.id]?.title || '' }
                      })}
                    />
                    <Button size="sm" onClick={() => handleAddLesson(mod.id)}>Add Lesson</Button>
                </div>
              </Card.Body>
            </Card>
          ))}
          <div className="d-flex gap-2 mt-3">
            <Form.Control
              placeholder="e.g. Module 1: Introduction"
              value={moduleInput}
              onChange={(e) => setModuleInput(e.target.value)}
            />
            <Button onClick={handleAddModule}>Add Module</Button>
          </div>
        </Card.Body>
      </Card>

      <Button variant="success" size="lg" onClick={handleFinish}>
        Publish Course
      </Button>
    </Container>
  );
}