from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .models import EcoTask
from .serializers import EcoTaskSerializer
from accounts.permissions import IsTeacher, IsInstitutionAdmin

class EcoTaskViewSet(viewsets.ModelViewSet):
    queryset = EcoTask.objects.all()
    serializer_class = EcoTaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return EcoTask.objects.none()

        if user.role == 'student':
            return EcoTask.objects.filter(student=user)
        elif user.role == 'teacher':
             # Teachers see tasks from their institution
             if user.institution:
                 return EcoTask.objects.filter(student__institution=user.institution)
             return EcoTask.objects.none()
        elif user.role == 'institution_admin':
             # Admin sees all from their institution
             if user.institution:
                 return EcoTask.objects.filter(student__institution=user.institution)
             return EcoTask.objects.none()
        elif user.role == 'super_admin':
            return EcoTask.objects.all()
            
        return EcoTask.objects.none()

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsTeacher | IsInstitutionAdmin])
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
