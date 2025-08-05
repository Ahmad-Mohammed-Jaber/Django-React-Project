# serializers.py
# Serializers allow us to convert complex data types, like Django models, into JSON format.
# This is useful for APIs to send and receive data in a structured way.

from django.contrib.auth.models import User
from rest_framework import serializers

from .models import WeatherProfile, WeatherSettings, Tag

class UserSerializer(serializers.ModelSerializer):
    # Meta inner class defines the model and fields to be serialized.
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
        extra_kwargs = {
            'password': {'write_only': True}  # Ensures password is write-only for security
        }

    # Create function to handle creating a user with hashed password
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class WeatherSettingsSerializer(serializers.ModelSerializer):
    """
    Serializer for WeatherSettings.
    - unit choices enforced via the model.
    - profile field links back to WeatherProfile by its PK.
    """
    profile = serializers.PrimaryKeyRelatedField(
        queryset=WeatherProfile.objects.all()
    )

    class Meta:
        model = WeatherSettings
        fields = ['id', 'profile', 'units', 'include_forecast']


class TagSerializer(serializers.ModelSerializer):
    """
    Serializer for Tag.
    - Used both for listing tags and assigning them to profiles.
    """
    class Meta:
        model = Tag
        fields = ['id', 'name']


class WeatherProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for WeatherProfile.
    - Nested read-only settings and tags.
    - tag_ids write-only field for assigning tags by their IDs.
    """
    settings = WeatherSettingsSerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        write_only=True,
        queryset=Tag.objects.all(),
        source='tags'
    )

    class Meta:
        model = WeatherProfile
        fields = [
            'id',
            'user',
            'city_name',
            'last_temp',
            'created_at',
            'settings',
            'tags',
            'tag_ids',
        ]

    def create(self, validated_data):
        # Pop out the tags list, then create the profile and assign tags
        tags = validated_data.pop('tags', [])
        profile = WeatherProfile.objects.create(**validated_data)
        profile.tags.set(tags)
        return profile
