from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from traffic.models import UserProfile


class Command(BaseCommand):
    help = 'Creates user profiles for all users that do not have one'

    def handle(self, *args, **kwargs):
        users_without_profile = []
        profiles_created = 0

        for user in User.objects.all():
            try:
                # Check if user has profile
                user.profile
            except UserProfile.DoesNotExist:
                # Create a profile for this user
                UserProfile.objects.create(user=user)
                users_without_profile.append(user.username)
                profiles_created += 1

        self.stdout.write(f'Created {profiles_created} user profiles')
        if users_without_profile:
            self.stdout.write(f'Profiles created for users: {", ".join(users_without_profile)}')
        
        if profiles_created == 0:
            self.stdout.write(self.style.SUCCESS('All users already have profiles'))
        else:
            self.stdout.write(self.style.SUCCESS('Successfully created user profiles')) 