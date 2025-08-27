from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import BlogView, CommentView

router = DefaultRouter()
router.register(r'blogs', BlogView, basename='blog')
router.register(r'comments', CommentView, basename='comment')

urlpatterns = [
    path('', include(router.urls))
]

