from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class WeatherProfile(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='weather_profiles'  # Enables reverse access: user.weather_profiles.all()
    )
    city_name = models.CharField(max_length=100)
    last_temp = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}'s weather profile for {self.city_name}"


class WeatherSettings(models.Model):
    UNIT_CHOICES = (
        ('metric', 'Metric'),     # Celsius, meters/sec, etc.
        ('imperial', 'Imperial')  # Fahrenheit, miles/hour, etc.
    )

    id = models.AutoField(primary_key=True)
    profile = models.OneToOneField(
        WeatherProfile,
        on_delete=models.CASCADE,
        related_name='settings'  # Enables: profile.settings
    )
    units = models.CharField(
        max_length=10,
        choices=UNIT_CHOICES     # Only allows "metric" or "imperial"
    )
    include_forecast = models.BooleanField(default=False)

    def __str__(self):
        return f"Settings for {self.profile.city_name}"


class Tag(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, unique=True)
    profiles = models.ManyToManyField(
        WeatherProfile,
        related_name='tags'  # Enables: profile.tags.all()
    )

    def __str__(self):
        return self.name
