from django.shortcuts import render
from .models import Blog, Comment
from rest_framework import viewsets
from .permissions import BlogPermissions, CommentPermissions
from .serializers import BlogSerializer, CommentSerializer

# Create your views here.
class BlogView(viewsets.ModelViewSet):
    queryset = Blog.objects.all()
    serializer_class = BlogSerializer
    permission_classes = [BlogPermissions]

class CommentView(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [CommentPermissions]