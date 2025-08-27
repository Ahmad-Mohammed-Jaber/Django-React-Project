from rest_framework import serializers
from .models import Blog, Comment
from api.models import WeatherProfile

class BlogSerializer(serializers.ModelSerializer):
    author = serializers.HiddenField(default=serializers.CurrentUserDefault())
    weather_profiles = serializers.PrimaryKeyRelatedField(queryset = WeatherProfile.objects.none(), many = True, required = False)
    class Meta: 
        model =  Blog
        fields = ['id', 'author', 'weather_profiles', 'title', 'body', 'created_on', 'updated_on']  
        read_only_fields = ['id', 'author', 'created_on', 'updated_on']
        
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            self.fields["weather_profiles"].queryset = WeatherProfile.objects.filter(user=request.user)
        else:
            self.fields["weather_profiles"].queryset = WeatherProfile.objects.none()

class CommentSerializer(serializers.ModelSerializer): 
    class Meta: 
        model = Comment
        fields = ['id', 'author', 'blog', 'parent', 'body', 'created_on', 'updated_on']
        read_only_fields = ['id', 'author', 'created_on', 'updated_on']




