from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import User, EcoTask, Lesson
from .serializers import UserSerializer, EcoTaskSerializer, LessonSerializer, QuizSerializer
import os

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserSerializer

class LessonViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @action(detail=True, methods=['get'])
    def quiz(self, request, pk=None):
        lesson = self.get_object()
        if hasattr(lesson, 'quiz'):
            serializer = QuizSerializer(lesson.quiz)
            return Response(serializer.data)
        return Response({'detail': 'No quiz for this lesson'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def attempt_quiz(self, request, pk=None):
        lesson = self.get_object()
        if not hasattr(lesson, 'quiz'):
            return Response({'detail': 'No quiz for this lesson'}, status=status.HTTP_404_NOT_FOUND)
        
        quiz = lesson.quiz
        user_answers = request.data.get('answers', []) # List of indices
        
        if len(user_answers) != quiz.questions.count():
             return Response({'detail': 'Incomplete answers'}, status=status.HTTP_400_BAD_REQUEST)

        correct_count = 0
        questions = quiz.questions.all()
        
        # Simple evaluation assuming order matches (should be robustified in prod)
        for idx, question in enumerate(questions):
             if idx < len(user_answers) and user_answers[idx] == question.correct_option_index:
                 correct_count += 1
        
        score_percent = (correct_count / len(questions)) * 100
        passed = score_percent >= 70
        
        points_awarded = 0
        if passed:
            # Check if already awarded (simple check: if badges contains quiz_id? For now just add)
            # Better: Create a UserQuizAttempt model. For MVP, just add points to user.
            points_awarded = quiz.points_reward
            request.user.xp_points += points_awarded
            request.user.save()
            
        return Response({
            'passed': passed,
            'score': correct_count,
            'total': len(questions),
            'points_awarded': points_awarded
        })

from rest_framework.parsers import MultiPartParser, FormParser

class EcoTaskViewSet(viewsets.ModelViewSet):
    queryset = EcoTask.objects.all()
    serializer_class = EcoTaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            return EcoTask.objects.filter(student=user)
        elif user.role == 'teacher':
            # Teachers see tasks from their school (simplified: all for now)
            return EcoTask.objects.all()
        return EcoTask.objects.all()

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def verify(self, request, pk=None):
        task = self.get_object()
        # Admin or Teacher verification logic
        task.status = 'verified'
        task.points_earned = 50 # Example points
        task.verified_by = request.user
        task.save()
        
        # Update user points
        student = task.student
        student.xp_points += task.points_earned
        student.save()
        
        return Response({'status': 'verified', 'points': 50})

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

class LeaderboardViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.order_by('-xp_points')[:10]
    serializer_class = UserSerializer


