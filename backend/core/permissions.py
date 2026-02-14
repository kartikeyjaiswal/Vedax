from rest_framework import permissions

class IsSuperAdmin(permissions.BasePermission):
    """
    Allows access only to super admins.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'super_admin')

class IsInstitutionAdmin(permissions.BasePermission):
    """
    Allows access only to institution admins.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'institution_admin')

class IsTeacher(permissions.BasePermission):
    """
    Allows access only to teachers.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'teacher')

class IsStudent(permissions.BasePermission):
    """
    Allows access only to students.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'student')

class IsSameInstitution(permissions.BasePermission):
    """
    Custom permission to only allow access to objects within the same institution.
    Assumes the model instance has an 'institution' field or related 'user.institution'.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any user,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        # (Optional: restrict read to same institution too?)
        # Let's restrict strict read/write to same institution for now.
        
        if not request.user.is_authenticated:
            return False

        if request.user.role == 'super_admin':
            return True

        # Check if the object has an institution field directly
        if hasattr(obj, 'institution'):
            return obj.institution == request.user.institution
        
        # Check if the object is a User
        if hasattr(obj, 'role'): # It's a User model
             return obj.institution == request.user.institution

        # Check if object has a user/student field that links to institution
        if hasattr(obj, 'student'):
            return obj.student.institution == request.user.institution
            
        return False
