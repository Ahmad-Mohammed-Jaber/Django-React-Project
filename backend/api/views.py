from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics # importing generic views for API
from .serializers import UserSerializer 
from rest_framework.permissions import IsAuthenticated, AllowAny # Importing permissions for access control


# Create your views here.
class CreateUserView(generics.CreateAPIView):
    # Here we are overriding some methods in the CreateAPIView to customize the user creation process.
    # queryset is set to an empty queryset since we are not retrieving any users here, however, we need to define it.
    
    queryset = User.objects.none()  
    serializer_class = UserSerializer 
    permission_classes = [AllowAny]  