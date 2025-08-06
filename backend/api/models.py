from django.db import models
from django.contrib.auth.models import User

class WeatherProfile(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='weather_profiles'
    )
    city_name = models.CharField(max_length=100)
    last_temp = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}'s weather profile for {self.city_name}"


class WeatherSettings(models.Model):
    UNIT_CHOICES = (
        ('metric', 'Metric'),
        ('imperial', 'Imperial')
    )

    profile = models.OneToOneField(
        WeatherProfile,
        on_delete=models.CASCADE,
        related_name='settings'
    )
    units = models.CharField(
        max_length=10,
        choices=UNIT_CHOICES
    )
    include_forecast = models.BooleanField(default=False)

    def __str__(self):
        return f"Settings for {self.profile.city_name}"


class Tag(models.Model):
    name = models.CharField(max_length=100, unique=True)
    profiles = models.ManyToManyField(
        WeatherProfile,
        related_name='tags'
    )

    def __str__(self):
        return self.name
