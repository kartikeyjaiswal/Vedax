from rest_framework import serializers
from .models import EcoTask

class EcoTaskSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source='student.email')
    
    class Meta:
        model = EcoTask
        fields = ['id', 'student', 'student_name', 'title', 'description', 'image', 'status', 'points_earned', 'submitted_at']
        read_only_fields = ['student', 'status', 'points_earned', 'verified_at', 'verified_by']
    
    def create(self, validated_data):
        # Assign current user as student
        user = self.context['request'].user
        validated_data['student'] = user
        return super().create(validated_data)
