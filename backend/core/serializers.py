from rest_framework import serializers
from .models import User, EcoTask, Lesson, Quiz, Question

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'role', 'school_name', 'xp_points', 'streak_days', 'badges']
        read_only_fields = ['xp_points', 'streak_days', 'badges']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            role=validated_data.get('role', 'student'),
            school_name=validated_data.get('school_name', '')
        )
        return user

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

class EcoTaskSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source='student.username')
    
    class Meta:
        model = EcoTask
        fields = ['id', 'student', 'student_name', 'title', 'description', 'image', 'status', 'points_earned', 'submitted_at']
        read_only_fields = ['student', 'status', 'points_earned', 'verified_at', 'verified_by']
    
    def create(self, validated_data):
        # Assign current user as student
        user = self.context['request'].user
        validated_data['student'] = user
        return super().create(validated_data)
