from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Lesson
from .serializers import LessonSerializer, QuizSerializer

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
        
        # Simple evaluation assuming order matches
        for idx, question in enumerate(questions):
             if idx < len(user_answers) and user_answers[idx] == question.correct_option_index:
                 correct_count += 1
        
        score_percent = (correct_count / len(questions)) * 100
        passed = score_percent >= 70
        
        points_awarded = 0
        if passed:
            points_awarded = quiz.points_reward
            request.user.xp_points += points_awarded
            request.user.save()
            
        return Response({
            'passed': passed,
            'score': correct_count,
            'total': len(questions),
            'points_awarded': points_awarded
        })
