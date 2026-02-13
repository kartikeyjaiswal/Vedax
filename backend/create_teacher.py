import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import User

def create_test_teacher():
    username = 'testteacher'
    password = 'password123'
    email = 'teacher@vedax.com'
    
    if not User.objects.filter(username=username).exists():
        User.objects.create_user(
            username=username, 
            email=email, 
            password=password, 
            role='teacher',
            school_name='Green Valley High'
        )
        print(f"Teacher account created: {username} / {password}")
    else:
        print(f"Teacher account already exists: {username}")

if __name__ == '__main__':
    create_test_teacher()
