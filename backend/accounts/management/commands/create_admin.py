import os

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model


from decouple import config


class Command(BaseCommand):
    help = "Create the default admin superuser if it does not exist."

    def handle(self, *args, **options):
        User = get_user_model()

        username = config("DJANGO_SUPERUSER_USERNAME", default='admin')
        email = config("DJANGO_SUPERUSER_EMAIL", default='admin@admin.com')
        password = config("DJANGO_SUPERUSER_PASSWORD", default='---------')

        if not username or not email or not password:
            self.stdout.write(
                self.style.WARNING(
                    "Superuser environment variables are not configured. "
                    "Skipping superuser creation."
                )
            )
            return

        if User.objects.filter(username=username).exists():
            self.stdout.write(
                self.style.SUCCESS(
                    f"Superuser '{username}' already exists."
                )
            )
            return

        User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"Superuser '{username}' created successfully."
            )
        )