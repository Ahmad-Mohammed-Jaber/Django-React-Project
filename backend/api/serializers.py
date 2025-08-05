# serializers.py
# Serializers allows us to convert complex data types, like Django models, into JSON format.
# This is useful for APIs to send and receive data in a structured way.

from django.contrib.auth.models import User
from rest_framework import serializers

class UserSerializer(serializers.ModelSerializer):
    # Meta inner class defines the model and fields to be serialized.
    class Meta:
        model = User
        fields = ['id', 'username', 'password']
        extra_kwargs = {
            'password': {'write_only': True} # Ensures password is write-only for security
        }
    
    # Create funtion to handle create user with validated data.
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user
    
 