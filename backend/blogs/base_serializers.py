from rest_framework import serializers
from blogs.models import Blog

class BlogMinimalSerializer(serializers.ModelSerializer):
    """Minimal Blog serializer to avoid circular imports"""
    class Meta:
        model = Blog
        fields = ['id', 'title', 'created_on']
