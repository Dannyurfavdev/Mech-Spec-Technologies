import { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Spinner, Alert, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import * as coursesApi from '../api/courses';
import CourseCard from '../components/courses/CourseCard';
import type { Course, Category } from '../types';

const testimonials = [
  {
    name: 'Amina O.',
    role: 'Web Development student',
    quote: 'I went from knowing nothing about React to building my own projects in six weeks. The lessons are structured so well that I never felt lost.',
  },
  {
    name: 'David K.',
    role: 'Design student',
    quote: 'Being able to track my progress lesson by lesson kept me motivated. I finished a course for the first time in my life.',
  },
  {
    name: 'Grace M.',
    role: 'Instructor',
    quote: 'Building my course here was simple — I could focus on teaching instead of fighting with tools to publish content.',
  },
];

export default function Home() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    coursesApi.getCategories().then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    const categoryId = selectedCategory ? Number(selectedCategory) : undefined;
    coursesApi.getCourses(categoryId)
      .then((res) => setCourses(res.data))
      .catch(() => setError('Could not load courses. Is the backend running?'))
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  const uniqueInstructors = new Set(courses.map((c) => c.instructor)).size;

  return (
    <>
      {/* HERO SECTION */}
      <div
        style={{
          position: 'relative',
          minHeight: '580px',
          width: '100%',
          backgroundImage: `linear-gradient(120deg, rgba(15,42,67,0.92) 10%, rgba(30,111,217,0.55) 100%), url('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2000&auto=format&fit=crop')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Container fluid className="px-4 px-md-5">
          <Row>
            <Col lg={7}>
              <h1 className="text-white fw-bold" style={{ fontSize: '3.2rem', lineHeight: 1.15 }}>
                Learn new skills.<br />Teach what you know.
              </h1>
              <p className="text-white-50 fs-5 mb-4" style={{ maxWidth: '560px' }}>
                Mech-Spec Technologies connects students with industry instructors —
                build real, practical skills through structured courses, hands-on
                lessons, and a community built around growth.
              </p>
              <div className="d-flex gap-3">
                <Button as={Link as any} to={user ? '/my-courses' : '/register'} variant="light" size="lg" className="fw-semibold">
                  {user ? 'Go to My Courses' : 'Get Started Free'}
                </Button>
                <Button
                  variant="outline-light"
                  size="lg"
                  onClick={() => document.getElementById('browse')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Browse Courses
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* STATS STRIP */}
      <div className="bg-dark text-white py-4">
        <Container fluid className="px-4 px-md-5">
          <Row className="text-center g-3">
            <Col xs={6} md={3}>
              <h2 className="fw-bold mb-0">{courses.length}+</h2>
              <p className="text-white-50 small mb-0">Courses available</p>
            </Col>
            <Col xs={6} md={3}>
              <h2 className="fw-bold mb-0">{categories.length}+</h2>
              <p className="text-white-50 small mb-0">Categories</p>
            </Col>
            <Col xs={6} md={3}>
              <h2 className="fw-bold mb-0">{uniqueInstructors || '—'}+</h2>
              <p className="text-white-50 small mb-0">Instructors</p>
            </Col>
            <Col xs={6} md={3}>
              <h2 className="fw-bold mb-0">100%</h2>
              <p className="text-white-50 small mb-0">Self-paced learning</p>
            </Col>
          </Row>
        </Container>
      </div>

      <Container fluid className="px-4 px-md-5 py-5">
        {/* FEATURES */}
        <Row className="text-center g-4 mb-5">
          <Col md={4}>
            <h3 className="fw-bold text-primary">Learn at your pace</h3>
            <p className="text-muted">Self-paced lessons with progress tracking so you always know where you left off.</p>
          </Col>
          <Col md={4}>
            <h3 className="fw-bold text-primary">Real instructors</h3>
            <p className="text-muted">Courses built by working professionals sharing practical, applicable skills.</p>
          </Col>
          <Col md={4}>
            <h3 className="fw-bold text-primary">Simple, secure enrollment</h3>
            <p className="text-muted">Enroll and pay in a few clicks, with instant access to your course content.</p>
          </Col>
        </Row>

        {/* TESTIMONIALS */}
        <Row className="g-4 mb-5">
          {testimonials.map((t) => (
            <Col md={4} key={t.name}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body>
                  <p className="fst-italic text-muted">"{t.quote}"</p>
                  <p className="fw-semibold mb-0">{t.name}</p>
                  <p className="text-muted small">{t.role}</p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* COURSE BROWSING */}
        <div id="browse">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Browse Courses</h2>
            <Form.Select
              style={{ width: '220px' }}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </Form.Select>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          {loading ? (
            <div className="text-center mt-5"><Spinner animation="border" /></div>
          ) : courses.length === 0 ? (
            <p className="text-muted">No courses available yet.</p>
          ) : (
            <Row xs={1} md={2} lg={3} className="g-4">
              {courses.map((course) => (
                <Col key={course.id}>
                  <CourseCard course={course} />
                </Col>
              ))}
            </Row>
          )}
        </div>
        <div
          className="rounded-4 text-white p-5 mt-5 text-center"
          style={{ background: 'linear-gradient(135deg, #0F2A43 0%, #1E6FD9 100%)' }}
        >
          <h3 className="fw-bold mb-2">Never miss a new course</h3>
          <p className="text-white-50 mb-4">
            Join our mailing list and be the first to know when new courses go live.
          </p>
          <Form className="d-flex justify-content-center gap-2" style={{ maxWidth: '420px', margin: '0 auto' }}>
            <Form.Control type="email" placeholder="Enter your email" />
            <Button variant="light" className="fw-semibold px-4">Subscribe</Button>
          </Form>
        </div>
      </Container>
    </>
  );
}