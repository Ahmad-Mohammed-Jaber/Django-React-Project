from django.shortcuts import render
from django.contrib.auth import get_user_model
from rest_framework import generics, viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authentication import SessionAuthentication
from dj_rest_auth.views import LoginView

from .models import WeatherProfile, WeatherSettings, Tag
from .serializers import (
    UserSerializer,
    WeatherProfileSerializer,
    WeatherSettingsSerializer,
    TagSerializer
)

User = get_user_model()

# ---- USER AUTH ----

class CreateUserView(generics.CreateAPIView):
    """
    Allows registration of new users.
    Public endpoint (no authentication required).
    """
    queryset = User.objects.all()
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
        return WeatherProfile.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class WeatherSettingsViewSet(viewsets.ModelViewSet):
    """
    ViewSet for WeatherSettings.
    Only authenticated users can access.
    """
    serializer_class = WeatherSettingsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return WeatherSettings.objects.filter(profile__user=self.request.user)


class TagViewSet(viewsets.ModelViewSet):
    serializer_class = TagSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Tag.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)