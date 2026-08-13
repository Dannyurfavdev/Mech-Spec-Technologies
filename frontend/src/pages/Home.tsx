import { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Spinner, Alert } from 'react-bootstrap';
import * as coursesApi from '../api/courses';
import CourseCard from '../components/courses/CourseCard';
import type { Course, Category } from '../types';

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    coursesApi.getCategories()
      .then((res) => setCategories(res.data))
      .catch(() => {}); // non-critical if this fails
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

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
      <h2 style={{ color: 'black' }}>Browse Courses</h2>
        <Form.Select
          style={{ width: '220px'}}
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
    </Container>
  );
}