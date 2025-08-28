from rest_framework import serializers
from .models import Blog, Comment
from api.models import WeatherProfile

class BlogSerializer(serializers.ModelSerializer):
    author = serializers.HiddenField(default=serializers.CurrentUserDefault())
    weather_profiles = serializers.PrimaryKeyRelatedField(many=True, queryset=WeatherProfile.objects.all(), required=False)

    class Meta:
        model = Blog
        fields = ['id', 'author', 'weather_profiles', 'title', 'body', 'created_on', 'updated_on']
        read_only_fields = ['id', 'author', 'created_on', 'updated_on']

    def validate_weather_profiles(self, value):
        user = self.context['request'].user
        for profile in value:
            if profile.user != user:
                raise serializers.ValidationError(f"Weather profile {profile.id} does not belong to the current user")
        return value

    def create(self, validated_data):
        weather_profiles = validated_data.pop('weather_profiles', [])
        blog = Blog.objects.create(**validated_data)
        if weather_profiles:
            blog.weather_profiles.set(weather_profiles)
        return blog

    def update(self, instance, validated_data):
        weather_profiles = validated_data.pop('weather_profiles', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if weather_profiles is not None:
            instance.weather_profiles.set(weather_profiles)
        instance.save()
        return instance

class CommentSerializer(serializers.ModelSerializer): 
    author = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta: 
        model = Comment
        fields = ['id', 'author', 'blog', 'parent', 'body', 'created_on', 'updated_on']
        # read_only_fields = ['id', 'created_on', 'updated_on']




