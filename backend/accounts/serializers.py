from rest_framework import serializers
from .models import User
from institutions.models import Institution

class UserSerializer(serializers.ModelSerializer):
    institution_code = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['id', 'email', 'password', 'full_name', 'role', 'institution', 'institution_code', 'xp_points', 'streak_days', 'badges', 'is_verified', 'profile_image']
        read_only_fields = ['xp_points', 'streak_days', 'badges', 'institution', 'is_verified', 'role']

    def create(self, validated_data):
        institution_code = validated_data.pop('institution_code', None)
        role = validated_data.get('role', 'student')
        
        institution = None
        if institution_code:
            try:
                institution = Institution.objects.get(code=institution_code)
            except Institution.DoesNotExist:
                raise serializers.ValidationError({"institution_code": "Invalid institution code."})

        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            full_name=validated_data.get('full_name', ''),
            role=role,
            institution=institution,
            is_verified=False 
        )
        return user
