import { useState } from 'react';
import { useEffect } from 'react';
import type { FormEvent } from 'react';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import * as profileApi from '../../api/profile';

export default function InstructorProfile() {
  const [bio, setBio] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    profileApi.getInstructorProfile()
      .then((res) => {
        setBio(res.data.bio || '');
        setTitle(res.data.title || '');
      })
      .catch(() => setError('Could not load instructor profile.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      await profileApi.updateInstructorProfile({ bio, title });
      setSuccess(true);
    } catch {
      setError('Could not update instructor profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;

  return (
    <Container style={{ maxWidth: '500px' }} fluid>
      <h2 className="mb-4">Instructor Profile</h2>
      <Card>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">Profile updated.</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Professional Title</Form.Label>
              <Form.Control
                placeholder="e.g. Senior Software Engineer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Bio</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </Form.Group>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}