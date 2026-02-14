from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from accounts.views import UserViewSet, RegisterView
from institutions.views import InstitutionViewSet
from learning.views import LessonViewSet
from eco_tasks.views import EcoTaskViewSet
from gamification.views import LeaderboardViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'tasks', EcoTaskViewSet)
router.register(r'lessons', LessonViewSet)
router.register(r'leaderboard', LeaderboardViewSet)
router.register(r'institutions', InstitutionViewSet)

from rest_framework.authtoken import views
from django.http import JsonResponse

def root_view(request):
    return JsonResponse({"message": "Welcome to Vedax API"})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/register/', RegisterView.as_view(), name='auth_register'),
    path('api-token-auth/', views.obtain_auth_token),
    path('', root_view),
]

from django.conf import settings
from django.conf.urls.static import static

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
