import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from accounts.models import User

from dotenv import load_dotenv

load_dotenv()

email = os.getenv("SUPER_ADMIN_EMAIL", "jaikartik5044@gmail.com")
password = os.getenv("SUPER_ADMIN_PASSWORD", "Kartik@2026")

try:
    if User.objects.filter(email=email).exists():
        print(f"User with email {email} already exists.")
        user = User.objects.get(email=email)
        user.set_password(password)
        user.role = User.Roles.SUPER_ADMIN
        user.is_superuser = True
        user.is_staff = True
        user.save()
        print(f"Updated user {email} to super_admin.")
    else:
        user = User.objects.create_superuser(
            email=email, 
            password=password,
            full_name="Admin User",
            role=User.Roles.SUPER_ADMIN
        )
        print(f"Created super_admin {email}.")

except Exception as e:
    print(f"Error: {e}")
