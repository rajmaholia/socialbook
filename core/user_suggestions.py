from django.contrib.auth.models import User
from .models import FollowRelation
import random

class UserSuggestions:
    @staticmethod
    def get_suggestions(user, count=4):
        # Fetch users not followed by the current user, ordered randomly
        suggestions = (
            User.objects
            .exclude(username=user.username)
            .exclude(id__in=FollowRelation.objects.filter(follower=user).values('following'))
            .order_by('?')[:count]
        )
        return suggestions
