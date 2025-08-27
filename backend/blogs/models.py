from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from django.db.models import Q

class Blog(models.Model):
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="blogs")
    title = models.CharField(max_length=200)
    body = models.TextField()
    created_on = models.DateTimeField(auto_now_add=True)
    updated_on = models.DateTimeField(auto_now=True)

    
    class Meta: 
        ordering = ["-created_on"]
    
    def __str__(self):
        return f"{self.title} by {self.author}"
    
class Comment(models.Model):
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="comments")    
    blog =  models.ForeignKey(Blog, on_delete=models.CASCADE, related_name="comments", null=True, blank=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, related_name="replies", null=True, blank=True)
    body = models.TextField()
    created_on = models.DateTimeField(auto_now_add=True)
    updated_on = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ["-created_on"]
        indexes = [
            models.Index(fields=["blog", "created_on"]),
            models.Index(fields=["parent", "created_on"]),
        ]
        constraints = [
            models.CheckConstraint(
                name= "top_or_reply_comment",
                check= (Q(parent__isnull=True, blog__isnull=False) | Q(parent__isnull=False, blog__isnull=True))
            )
        ]
        
    def clean(self):
        super().clean()
        
        if bool(self.blog) == bool(self.parent):
            raise ValidationError("Provide exactly one of: blog (top-level) OR parent (reply).")
        
        if self.pk and self.parent_id == self.pk:
            raise ValidationError("A comment cannot be its own parent.")
        
    def save(self, *args, **kwargs):
        self.full_clean()
        return super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Comment<{self.pk}> by {self.author}"

