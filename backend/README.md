# Mech-Spec Technologies (LMS Backend)

Backend API for a role-based Learning Management System (LMS), built for
the Mech-Spec Technologies challenge. Instructors publish and sell
courses, students purchase (simulated) and complete them, and
administrators oversee the platform. Includes an AI support assistant
grounded in platform FAQ content.

Frontend docs: see `https://github.com/Dannyurfavdev/Mech-Spec-Technologies/new/master/frontend` in
this repository, built by Martins Wakaba.

## Tech Stack

- **Python 3 / Django 6.0**
- **Django REST Framework** — function-based views throughout
- **djangorestframework-simplejwt** — JWT auth with refresh rotation + blacklist on logout
- **SQLite** — development database
- **Anthropic API (Claude)** — grounded AI support assistant
- **Pillow** — course thumbnail image handling

## Features

- JWT authentication with role-based access control (Admin / Instructor / Student)
- Instructor course management: courses, modules, lessons, learning objectives, publish/unpublish
- Public course catalog with category filtering
- Simulated checkout, payment confirmation, and enrollment flow
- Per-lesson progress tracking for students
- Admin portal: user suspend/activate, course removal (soft-delete) and restore, platform statistics
- AI support assistant — answers platform-usage questions, grounded in a retrieved FAQ context, out of scope for course-content tutoring
- Audit logging of key platform events (logins, purchases, admin actions, etc.), viewable in the Django admin

## Project Structure

\```
mech_spec_lms/    Django project settings, root urlconf
accounts/         Custom User model, JWT auth endpoints, role permissions, admin user management
courses/          Categories, courses, modules, lessons, instructor CRUD, admin course oversight
enrollments/      Checkout, simulated payment, enrollment, progress tracking
chatbot/          FAQ entries, retrieval, LLM-grounded assistant endpoint
logs/             AuditLog model + log_action() helper used by the other apps
\```

## Getting Started

### Prerequisites

- Python 3.11+

### Setup

\```bash
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
\```

### Environment variables

\```bash
export DJANGO_SECRET_KEY="dev-only-change-me"
export DJANGO_DEBUG=True
export ANTHROPIC_API_KEY="sk-ant-..."     # required for the chatbot endpoint to respond
export ANTHROPIC_MODEL="claude-..."       # optional override; verify current model names at docs.claude.com
\```

Without `ANTHROPIC_API_KEY`, everything else works — only
`POST /api/chatbot/ask/` will return a `503` until it's set.

### Database

\```bash
python manage.py migrate
python manage.py seed_faqs        # loads starter FAQ entries for the chatbot
python manage.py createsuperuser  # then set role manually (see below)
\```

`createsuperuser` doesn't prompt for the custom `role` field, so set it
right after:

\```bash
python manage.py shell -c "
from accounts.models import User
u = User.objects.get(username='<your superuser username>')
u.role = 'admin'
u.save()
"
\```

### Run

\```bash
python manage.py runserver
\```

API is served at `http://localhost:8000/api/`. Django admin at
`http://localhost:8000/admin/`.

If running the frontend alongside this backend, it expects CORS to allow
`http://localhost:5173` — add and configure `django-cors-headers` if it
isn't already set up.

## API Overview

Base paths: `/api/auth/`, `/api/courses/`, `/api/enrollments/`,
`/api/chatbot/`. All non-public endpoints require
`Authorization: Bearer <access_token>`.

## will add routes soon ...

## Known Limitations

- SQLite and local media storage — fine for MVP/demo, not production load.
- FAQ retrieval uses keyword overlap rather than semantic search — adequate for the current fixed FAQ set.
- No self-service password reset flow; resets are handled manually by an admin for this MVP.

## License

Built for the Mech-Spec Technologies challenge.
