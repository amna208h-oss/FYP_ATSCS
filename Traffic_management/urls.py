from django.urls import path, include
from django.contrib.auth import views as auth_views
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from . import views

router = DefaultRouter()
router.register(r'cameras', views.CameraViewSet)
router.register(r'traffic-data', views.TrafficDataViewSet)
router.register(r'incidents', views.IncidentViewSet)
router.register(r'alerts', views.AlertViewSet)
router.register(r'traffic-settings', views.TrafficSettingsViewSet)
router.register(r'traffic-lights', views.TrafficLightViewSet)
router.register(r'emergency-vehicles', views.EmergencyVehicleViewSet)
router.register(r'traffic-light-schedules', views.TrafficLightScheduleViewSet)
router.register(r'emergency-routes', views.EmergencyRouteViewSet)
router.register(r'traffic-reports', views.TrafficReportViewSet)
router.register(r'report-schedules', views.ReportScheduleViewSet)

urlpatterns = [
    path('', include('traffic.urls')),
    path('api/', include(router.urls)),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('generate-sample-data/', views.generate_sample_data, name='generate-sample-data'),
    
] 