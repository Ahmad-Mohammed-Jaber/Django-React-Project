# accounts/serializers.py
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["full_name"] = user.full_name
        token["email"]     = user.email
        return token

    def validate(self, attrs):
        # this gives you {'refresh':..., 'access':...}
        data = super().validate(attrs)
        # now tack on your custom fields
        data["full_name"] = self.user.full_name
        data["email"]     = self.user.email
        return data
