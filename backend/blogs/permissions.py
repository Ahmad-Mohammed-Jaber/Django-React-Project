from rest_framework.permissions import BasePermission, SAFE_METHODS
from django.utils import timezone
from datetime import timedelta;
class BlogPermissions(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return obj.author == request.user
    
class CommentPermissions(BasePermission):
    def has_permission(self, request, view):
        # Allow GET requests and authenticated users to create comments
        if request.method in SAFE_METHODS:
            return True
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Allow read operations
        if request.method in SAFE_METHODS:
            return True
            
        # Check if user owns the comment
        if obj.author != request.user:
            return False
            
        # For edit operations, check the time window
        if request.method in ("PUT", "PATCH"):
            edit_window = timezone.now() - timedelta(minutes=5)
            return obj.created_on >= edit_window
        
        if request.method == "DELETE":
            return True
        
        return False