from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    CreateUserView,
    WeatherProfileViewSet,
    WeatherSettingsViewSet,
    TagViewSet
)

# Create a DRF router and register our viewsets
router = DefaultRouter()
router.register(r'profiles', WeatherProfileViewSet, basename='profile')
router.register(r'settings', WeatherSettingsViewSet, basename='settings')
router.register(r'tags', TagViewSet, basename='tag')

urlpatterns = [
    # User registration endpoint (not part of the router)
    path('register/', CreateUserView.as_view(), name='register'),
    
    # All viewsets (profiles, settings, tags) will be auto-routed here
    path('', include(router.urls)),
]
