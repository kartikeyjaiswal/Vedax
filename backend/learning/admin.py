from django.contrib import admin
from .models import Lesson, Quiz, Question

class QuestionInline(admin.TabularInline):
    model = Question

class QuizAdmin(admin.ModelAdmin):
    inlines = [QuestionInline]

admin.site.register(Lesson)
admin.site.register(Quiz, QuizAdmin)
admin.site.register(Question)
