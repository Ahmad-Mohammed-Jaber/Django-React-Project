from django.db import models
from django.contrib.auth.models import User


# Create your models here.
class WeatherProfile(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    city_name = models.CharField(max_length=100)
    last_temp = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}'s weather profile for {self.city_name}"

class WeatherSettings(models.Model):
    id = models.AutoField(primary_key=True)
    profile = models.OneToOneField(WeatherProfile, on_delete=models.CASCADE)
    units = models.CharField(max_length=10)        
    include_forecast = models.BooleanField(default=False)

    def __str__(self):
        return f"Settings for {self.profile.city_name}"
    
class Tags(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, unique=True)
    profiles = models.ManyToManyField(WeatherProfile)

    def __str__(self):
        return self.name
