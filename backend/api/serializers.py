from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import WeatherProfile, WeatherSettings, Tag
from .weather_client import fetch_weather
User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'password', 'dob']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class WeatherSettingsSerializer(serializers.ModelSerializer):
    profile = serializers.PrimaryKeyRelatedField(
        queryset=WeatherProfile.objects.all()
    )

    class Meta:
        model = WeatherSettings
        fields = ['id', 'profile', 'units', 'include_forecast']


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ["id", "name"]  

class WeatherProfileSerializer(serializers.ModelSerializer):
    settings = WeatherSettingsSerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        write_only=True,
        queryset=Tag.objects.all(),   
        source="tags",
        required=False
    )
    user = serializers.ReadOnlyField(source="user.id")

    class Meta:
        model = WeatherProfile
        fields = ["id","user","city_name","last_temp","created_at","settings","tags","tag_ids"]
        extra_kwargs = {"last_temp": {"required": False, "allow_null": True}}

    def create(self, validated_data):
        tags = validated_data.pop("tags", [])
        city = validated_data['city_name']
        
        try:
            temporary_temprature = fetch_weather(city)
        except Exception as e:
            raise serializers.ValidationError({"city_name": f"Weather fetch failed: {e}"})
        
        profile = WeatherProfile.objects.create(last_temp=temporary_temprature,**validated_data)
        
        if tags:
            profile.tags.set(tags)
        return profile

    def update(self, instance, validated_data):
        tags = validated_data.pop("tags", None)
        for k, v in validated_data.items():
            setattr(instance, k, v)
        instance.save()
        if tags is not None:
            instance.tags.set(tags)
        return instance
