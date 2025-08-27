from rest_framework.permissions import BasePermission, SAFE_METHODS
from django.utils import timezone
from datetime import timedelta;
class BlogPermissions(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return obj.author == request.user
    
class CommentPermissions(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        
        user_id = getattr(request.user, "id")
        is_comment_user = (user_id == obj.author_id)
        
        if request.method in ("POST", "PATCH"):
            return is_comment_user and obj.created_on >= (timezone.now() - obj.created_on)  <= timedelta(minutes= 5)
        