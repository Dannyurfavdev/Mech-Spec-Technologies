import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ background: '#0F2A43' }} className="text-white pt-5 pb-4 mt-5">
      <Container fluid className="px-4 px-md-5">
        <Row className="g-4">
          <Col md={4}>
            <h5 className="fw-bold mb-3">LMS | Mech-Spec</h5>
            <p className="text-white-50 small">
              A learning platform connecting students with industry instructors —
              build real, practical skills through structured, hands-on courses.
            </p>
          </Col>

          <Col md={2}>
            <h6 className="fw-semibold mb-3">Platform</h6>
            <ul className="list-unstyled small">
              <li className="mb-2"><Link to="/" className="text-white-50 text-decoration-none">Courses</Link></li>
              <li className="mb-2"><Link to="/register" className="text-white-50 text-decoration-none">Become an Instructor</Link></li>
              <li className="mb-2"><Link to="/login" className="text-white-50 text-decoration-none">Log In</Link></li>
            </ul>
          </Col>

          <Col md={2}>
            <h6 className="fw-semibold mb-3">Company</h6>
            <ul className="list-unstyled small">
              <li className="mb-2"><span className="text-white-50">About</span></li>
              <li className="mb-2"><span className="text-white-50">Contact</span></li>
              <li className="mb-2"><span className="text-white-50">FAQs</span></li>
            </ul>
          </Col>

          <Col md={4}>
            <h6 className="fw-semibold mb-3">Stay updated</h6>
            <p className="text-white-50 small mb-3">
              Get notified about new courses and platform updates.
            </p>
            <Form className="d-flex gap-2">
              <Form.Control
                type="email"
                placeholder="Your email"
                size="sm"
                className="bg-transparent text-white border-secondary"
              />
              <Button variant="light" size="sm" className="fw-semibold">
                Subscribe
              </Button>
            </Form>
          </Col>
        </Row>

        <hr className="border-secondary my-4" />

        <div className="d-flex justify-content-between flex-wrap text-white-50 small">
          <span>© {new Date().getFullYear()} Mech-Spec Technologies. All rights reserved.</span>
          <span>Built with care</span>
        </div>
      </Container>
    </footer>
  );
}