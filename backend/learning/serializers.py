from rest_framework import serializers
from .models import Lesson, Quiz, Question

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'text', 'options', 'correct_option_index']

class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    class Meta:
        model = Quiz
        fields = ['id', 'title', 'description', 'points_reward', 'questions']

class LessonSerializer(serializers.ModelSerializer):
    has_quiz = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = ['id', 'title', 'slug', 'content', 'points_reward', 'order', 'has_quiz', 'created_at']

    def get_has_quiz(self, obj):
        return hasattr(obj, 'quiz')
