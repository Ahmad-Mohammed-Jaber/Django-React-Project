from django.db import models
from django.conf import settings
from .weather_client import fetch_weather


class Tag(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="tags",
        null=True,
        blank=True
    )
    name = models.CharField(max_length=100)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user", "name"], name="unique_user_tag_name")
        ]

    def __str__(self):
        return self.name


class WeatherProfile(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="weather_profiles"
    )
    city_name = models.CharField(max_length=100)
    last_temp = models.FloatField(blank= True, null= True)
    created_at = models.DateTimeField(auto_now_add=True)
    tags = models.ManyToManyField(
        Tag,
        related_name="profiles",
        blank=True
    )

    def __str__(self):
        return f"{self.user} - {self.city_name}"


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
        return f"Settings for {self.profile.city_name}"
