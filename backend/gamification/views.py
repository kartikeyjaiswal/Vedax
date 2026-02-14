from rest_framework import viewsets
from accounts.models import User
from accounts.serializers import UserSerializer

class LeaderboardViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.order_by('-xp_points')[:10]
    serializer_class = UserSerializer

    def get_queryset(self):
        # Leaderboard should be institution specific?
        user = self.request.user
        qs = User.objects.order_by('-xp_points')
        if user.is_authenticated and user.institution:
            qs = qs.filter(institution=user.institution)
        return qs[:10]
