from django.db import models

class Institution(models.Model):
    name = models.CharField(max_length=255)
    address = models.TextField(blank=True)
    code = models.CharField(max_length=20, unique=True, default='TEMP', help_text="Unique code for institution login/registration")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
