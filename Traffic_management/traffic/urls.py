from django.urls import path, include
from traffic import views
from rest_framework.routers import DefaultRouter

# Create a REST API router
router = DefaultRouter()

urlpatterns = [
    path('', views.Home, name='home'),
    path('dashboard/', views.traffic_dashboard, name='traffic-dashboard'),
    path('register/', views.RegisterView, name='register'),
    path('login/', views.LoginView, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('profile/', views.user_profile, name='profile'),
    path('traffic-dashboard/', views.traffic_dashboard_view, name='traffic_dashboard'),
    path('forgot-password/', views.ForgotPassword, name='forgot-password'),
    path('reset-password/<str:reset_id>', views.ResetPassword, name='reset-password'),
    path('password-reset-sent/<str:reset_id>', views.PasswordResetSent, name='password-reset-sent'),
    
    # Direct API endpoints
    path('api/traffic-data/real_time/', views.api_real_time_traffic, name='api_real_time_traffic'),
    path('api/traffic-data/analysis/', views.api_traffic_analysis, name='api_traffic_analysis'),
    path('api/traffic-data/historical/', views.api_historical_traffic, name='api_historical_traffic'),
    path('api/traffic-data/generate_dummy_data/', views.generate_dummy_data, name='api-generate-data'),
    path('monitoring/', views.monitoring_view, name='monitoring'),
    path('settings/', views.settings_view, name='settings'),
]