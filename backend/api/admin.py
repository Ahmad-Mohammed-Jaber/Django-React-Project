# api/admin.py
from django.contrib import admin
from .models import WeatherProfile, WeatherSettings, Tag

@admin.register(WeatherProfile)
class WeatherProfileAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "city_name", "last_temp", "created_at")
    list_filter = ("user", "city_name", "created_at")
    search_fields = ("city_name", "user__username", "user__email", "user__full_name")
    filter_horizontal = ("tags",)  #

@admin.register(WeatherSettings)
class WeatherSettingsAdmin(admin.ModelAdmin):
    list_display = ("id", "profile", "units", "include_forecast")
    list_filter = ("units", "include_forecast")
    search_fields = ("profile__city_name",)

class TagProfileInline(admin.TabularInline):
    model = WeatherProfile.tags.through
    extra = 1
    verbose_name = "Attached profile"
    verbose_name_plural = "Attached profiles"

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "name")
    list_filter = ("user",)
    search_fields = ("name", "user__email", "user__username")
    inlines = [TagProfileInline]
