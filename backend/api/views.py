from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics, viewsets  # Importing generic views and viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authentication import SessionAuthentication

from .models import WeatherProfile, WeatherSettings, Tag
from .serializers import (
    UserSerializer,
    WeatherProfileSerializer,
    WeatherSettingsSerializer,
    TagSerializer
)

# ---- USER AUTH ----

class CreateUserView(generics.CreateAPIView):
    """
    Allows registration of new users.
    Public endpoint (no authentication required).
    """
    queryset = User.objects.none()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


# ---- MAIN API VIEWSETS ----

class WeatherProfileViewSet(viewsets.ModelViewSet):
    """
    ViewSet for WeatherProfile.
    Only authenticated users can access.
    Auto-assigns the profile to request.user on creation.
    """
    serializer_class = WeatherProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Returns only the profiles belonging to the authenticated user
        return WeatherProfile.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Automatically set the user when creating a new profile
        serializer.save(user=self.request.user)


class WeatherSettingsViewSet(viewsets.ModelViewSet):
    """
    ViewSet for WeatherSettings.
    Only authenticated users can access.
    """
    serializer_class = WeatherSettingsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Ensures users only access settings related to their own profiles
        return WeatherSettings.objects.filter(profile__user=self.request.user)


class TagViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Tags.
    Tags are shared across users (or could be made private if needed).
    """
    serializer_class = TagSerializer
    permission_classes = [IsAuthenticated]
    queryset = Tag.objects.all()
