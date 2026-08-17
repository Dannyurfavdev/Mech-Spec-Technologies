import { Navbar as BSNavbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { PersonCircle, BoxArrowRight, BoxArrowInRight, PersonPlus } from 'react-bootstrap-icons';


export default function AppNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dashboardLink = () => {
    if (user?.role === 'instructor') return '/instructor';
    if (user?.role === 'admin') return '/admin';
    return '/my-courses';
  };

  return (
    <BSNavbar bg="dark" variant="dark" expand="lg">
      <Container fluid>
      <BSNavbar.Brand as={Link} to="/" className="d-flex flex-column lh-1 py-0">
          <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>Mech-Spec|LMS</span>
          <span style={{ fontSize: '0.7rem', fontWeight: 400, opacity: 0.7 }}>
            Learning Made Easy
          </span>
      </BSNavbar.Brand>
        <BSNavbar.Toggle aria-controls="main-navbar" />
        <BSNavbar.Collapse id="main-navbar">
          <Nav className="mx-auto">
            <Nav.Link as={Link} to="/" style={{ fontSize: '19px', fontWeight: 600 }}>Courses</Nav.Link>
            {user &&  <Nav.Link as={Link} to={dashboardLink()}>Dashboard</Nav.Link> }
          </Nav>
          <Nav className="align-items-center gap-2">
          {user ? (
            <>
              <Nav.Link
                as={Link}
                to="/profile"
                className="d-flex align-items-center gap-2 text-white"
              >
                <PersonCircle size={20} />
                <span className="d-none d-md-inline">{user.username}</span>
              </Nav.Link>
              <Button
                variant="light"
                size="sm"
                className="rounded-pill px-3 fw-semibold d-flex align-items-center gap-1"
                onClick={handleLogout}
              >
                <BoxArrowRight size={16} />
                Log Out
              </Button>
            </>
          ) : (
            <>
              <Button
                as={Link as any}
                to="/login"
                variant="outline-light"
                size="sm"
                className="rounded-pill px-3 fw-semibold d-flex align-items-center gap-1"
              >
                <BoxArrowInRight size={16} />
                Log In
              </Button>
              <Button
                as={Link as any}
                to="/register"
                variant="light"
                size="sm"
                className="rounded-pill px-3 fw-semibold d-flex align-items-center gap-1"
              >
                <PersonPlus size={16} />
                Register
              </Button>
            </>
          )}
        </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
}