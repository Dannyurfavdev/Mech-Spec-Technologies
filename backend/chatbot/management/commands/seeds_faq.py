from django.core.management.base import BaseCommand

from chatbot.models import FAQEntry

FAQS = [
    {
        'category': FAQEntry.Category.REGISTRATION,
        'question': 'How do I register for an account?',
        'answer': (
            'Go to the registration page and submit your username, email, '
            'password, and role (student or instructor). You can log in '
            'immediately after registering.'
        ),
        'keywords': 'register, sign up, create account, new account',
    },
    {
        'category': FAQEntry.Category.COURSES,
        'question': 'How do I upload or create a course as an instructor?',
        'answer': (
            'From your instructor dashboard, go to "My Courses" and click '
            '"Create Course." Fill in the title, description, category, '
            'price, and thumbnail, then add modules and lessons. The '
            'course stays unpublished until you toggle "Publish."'
        ),
        'keywords': 'upload course, create course, add course, new course, publish',
    },
    {
        'category': FAQEntry.Category.COURSES,
        'question': 'How do I publish or unpublish my course?',
        'answer': (
            'Open the course from your instructor dashboard and toggle the '
            '"Published" setting. Unpublished courses are hidden from the '
            'public course browse page.'
        ),
        'keywords': 'publish, unpublish, visibility, make live',
    },
    {
        'category': FAQEntry.Category.PAYMENTS,
        'question': 'How do I purchase a course?',
        'answer': (
            'Open the course page and click "Checkout." This starts a '
            'simulated payment; confirm it on the payment confirmation '
            'step and you will be enrolled automatically.'
        ),
        'keywords': 'purchase, buy, checkout, payment, enroll',
    },
    {
        'category': FAQEntry.Category.PASSWORD,
        'question': 'I forgot my password, what do I do?',
        'answer': (
            'Password resets are handled by an administrator for this MVP. '
            'Contact support with your username and they can help you '
            'regain access.'
        ),
        'keywords': 'password, forgot password, reset password, locked out',
    },
    {
        'category': FAQEntry.Category.DASHBOARD,
        'question': 'How do I navigate my dashboard?',
        'answer': (
            'Students see "My Courses" (enrolled courses and progress) and '
            '"Browse Courses." Instructors see "My Courses" (courses they '
            'teach), course creation tools, and their enrolled-student '
            'lists per course.'
        ),
        'keywords': 'dashboard, navigation, menu, where is',
    },
    {
        'category': FAQEntry.Category.COURSES,
        'question': 'How do I track my progress in a course?',
        'answer': (
            'Each lesson has a "Mark Complete" action. Your course page '
            'shows a progress percentage based on completed lessons.'
        ),
        'keywords': 'progress, track, completed lessons, percent complete',
    },
]


class Command(BaseCommand):
    help = 'Seeds the FAQEntry table with starter platform-usage FAQs.'

    def handle(self, *args, **options):
        created = 0
        for entry in FAQS:
            _, was_created = FAQEntry.objects.get_or_create(
                question=entry['question'], defaults=entry,
            )
            created += int(was_created)
        self.stdout.write(self.style.SUCCESS(
            f'Seeded {created} new FAQ entries ({len(FAQS)} total defined).'
        ))
