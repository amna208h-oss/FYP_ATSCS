from django.shortcuts import render, redirect
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta
import random
from .models import (
    Camera, TrafficData, Incident, Alert, TrafficSettings, CameraSettings,
    TrafficLight, EmergencyVehicle, TrafficLightSchedule, EmergencyRoute,
    TrafficReport, ReportSchedule, UserProfile
)
from .serializers import (
    CameraSerializer, TrafficDataSerializer, IncidentSerializer,
    AlertSerializer, TrafficSettingsSerializer, CameraSettingsSerializer,
    TrafficLightSerializer, EmergencyVehicleSerializer, TrafficLightScheduleSerializer,
    EmergencyRouteSerializer, TrafficReportSerializer, ReportScheduleSerializer
)
from django.contrib import messages
from django.contrib.auth.models import User
from .traffic_analysis import (
    calculate_congestion_level,
    predict_traffic_flow,
    calculate_peak_hours,
    analyze_emergency_impact,
    generate_traffic_report,
    generate_report_data,
    generate_report_file,
    get_report_period_dates
)
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, FileResponse
import mimetypes
import json
from django.views.decorators.csrf import csrf_exempt

class CameraViewSet(viewsets.ModelViewSet):
    queryset = Camera.objects.all()
    serializer_class = CameraSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['get'])
    def feed(self, request, pk=None):
        camera = self.get_object()
        # Here you would typically get the actual camera feed
        # For now, return a placeholder
        return Response({
            'camera_id': camera.id,
            'status': camera.status,
            'feed_url': f'rtsp://{camera.ip_address}/stream',
            'last_active': camera.last_active
        })

    @action(detail=True, methods=['post'])
    def update_settings(self, request, pk=None):
        camera = self.get_object()
        settings, created = CameraSettings.objects.get_or_create(camera=camera)
        serializer = CameraSettingsSerializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TrafficDataViewSet(viewsets.ModelViewSet):
    queryset = TrafficData.objects.all()
    serializer_class = TrafficDataSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = TrafficData.objects.all()
        minutes = self.request.query_params.get('minutes', None)
        if minutes:
            time_threshold = timezone.now() - timedelta(minutes=int(minutes))
            queryset = queryset.filter(timestamp__gte=time_threshold)
        return queryset

    @action(detail=False, methods=['post'])
    def generate_dummy_data(self, request):
        """Generate dummy traffic data for testing"""
        camera = Camera.objects.first()
        if not camera:
            return Response({'error': 'No camera available'}, status=status.HTTP_400_BAD_REQUEST)

        # Generate data for the last 24 hours
        end_time = timezone.now()
        start_time = end_time - timedelta(hours=24)
        current_time = start_time

        dummy_data = []
        while current_time <= end_time:
            # Generate different patterns based on time of day
            hour = current_time.hour
            
            # Morning rush hour (7-9 AM)
            if 7 <= hour <= 9:
                base_count = random.randint(60, 100)
            # Evening rush hour (4-6 PM)
            elif 16 <= hour <= 18:
                base_count = random.randint(70, 110)
            # Normal hours
            elif 6 <= hour <= 22:
                base_count = random.randint(20, 50)
            # Night hours
            else:
                base_count = random.randint(5, 20)

            # Create entries for all directions
            for direction in ['northbound', 'southbound', 'eastbound', 'westbound']:
                # Add some random variation for each direction
                vehicle_count = max(0, base_count + random.randint(-10, 10))
                
                TrafficData.objects.create(
                    camera=camera,
                    direction=direction,
                    vehicle_count=vehicle_count,
                    timestamp=current_time
                )
                dummy_data.append({
                    'timestamp': current_time,
                    'direction': direction,
                    'vehicle_count': vehicle_count
                })
            
            current_time += timedelta(minutes=15)  # 15-minute intervals

        return Response({
            'message': f'Generated {len(dummy_data)} traffic data points',
            'sample_data': dummy_data[:8]  # Show first 2 hours of data
        })

    @action(detail=False, methods=['get'], permission_classes=[])
    def analysis(self, request):
        """Get comprehensive traffic analysis"""
        time_period = int(request.query_params.get('hours', 24))
        end_time = timezone.now()
        start_time = end_time - timedelta(hours=time_period)
        
        # Get traffic data
        traffic_data = TrafficData.objects.filter(timestamp__gte=start_time)
        
        # Get emergency routes
        emergency_routes = EmergencyRoute.objects.filter(created_at__gte=start_time)
        
        # Generate analysis
        report = generate_traffic_report(traffic_data, time_period)
        
        # Add emergency impact analysis
        emergency_impact = analyze_emergency_impact(emergency_routes, traffic_data)
        report['emergency_impact'] = emergency_impact
        
        # Add predictions for next hour
        historical_data = list(traffic_data.order_by('-timestamp')[:12])  # Last 3 hours of data
        predicted_flow = predict_traffic_flow(historical_data)
        report['predictions'] = {
            'next_hour': predicted_flow,
            'predicted_congestion': calculate_congestion_level(predicted_flow)
        }
        
        return Response(report)

    @action(detail=False, methods=['get'], permission_classes=[])
    def real_time(self, request):
        """Get real-time traffic status"""
        # Get last 15 minutes of data
        time_threshold = timezone.now() - timedelta(minutes=15)
        recent_data = TrafficData.objects.filter(timestamp__gte=time_threshold)
        
        if not recent_data.exists():
            return Response({
                'status': 'No recent data available',
                'last_updated': None,
                'current_flow': {
                    'total_vehicles': 0,
                    'average_per_direction': 0,
                    'congestion_level': 'Low'
                },
                'direction_status': {
                    'northbound': {'vehicle_count': 0, 'congestion_level': 'Low'},
                    'southbound': {'vehicle_count': 0, 'congestion_level': 'Low'},
                    'eastbound': {'vehicle_count': 0, 'congestion_level': 'Low'},
                    'westbound': {'vehicle_count': 0, 'congestion_level': 'Low'}
                }
            })
        
        total_vehicles = sum(d.vehicle_count for d in recent_data)
        avg_vehicles = total_vehicles / len(recent_data)
        
        response = {
            'status': 'active',
            'last_updated': recent_data.latest('timestamp').timestamp,
            'current_flow': {
                'total_vehicles': total_vehicles,
                'average_per_direction': round(avg_vehicles, 2),
                'congestion_level': calculate_congestion_level(avg_vehicles)
            },
            'direction_status': {}
        }
        
        # Calculate status for each direction
        for direction in ['northbound', 'southbound', 'eastbound', 'westbound']:
            direction_data = recent_data.filter(direction=direction)
            if direction_data.exists():
                avg = sum(d.vehicle_count for d in direction_data) / len(direction_data)
                response['direction_status'][direction] = {
                    'vehicle_count': round(avg, 2),
                    'congestion_level': calculate_congestion_level(avg)
                }
        
        return Response(response)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        # Get traffic summary for the last hour
        time_threshold = timezone.now() - timedelta(hours=1)
        data = TrafficData.objects.filter(timestamp__gte=time_threshold)
        
        summary = {
            'total_vehicles': sum(d.vehicle_count for d in data),
            'average_traffic': sum(d.vehicle_count for d in data) / 60 if data else 0,
            'peak_time': max(data, key=lambda x: x.vehicle_count).timestamp if data else None,
            'direction_distribution': {
                'northbound': sum(d.vehicle_count for d in data if d.direction == 'northbound'),
                'southbound': sum(d.vehicle_count for d in data if d.direction == 'southbound'),
                'eastbound': sum(d.vehicle_count for d in data if d.direction == 'eastbound'),
                'westbound': sum(d.vehicle_count for d in data if d.direction == 'westbound'),
            }
        }
        return Response(summary)

class IncidentViewSet(viewsets.ModelViewSet):
    queryset = Incident.objects.all()
    serializer_class = IncidentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Incident.objects.all()
        status = self.request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(status=status)
        return queryset

    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        incident = self.get_object()
        incident.status = 'resolved'
        incident.resolved_at = timezone.now()
        incident.save()
        
        # Create resolution alert
        Alert.objects.create(
            type='system',
            message=f'Incident {incident.id} has been resolved',
            severity='low',
            incident=incident
        )
        
        return Response({'status': 'resolved'})

class AlertViewSet(viewsets.ModelViewSet):
    queryset = Alert.objects.filter(is_active=True)
    serializer_class = AlertSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['post'])
    def dismiss(self, request, pk=None):
        alert = self.get_object()
        alert.is_active = False
        alert.resolved_at = timezone.now()
        alert.save()
        return Response({'status': 'dismissed'})

class TrafficSettingsViewSet(viewsets.ModelViewSet):
    queryset = TrafficSettings.objects.all()
    serializer_class = TrafficSettingsSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        # Get or create settings
        settings, created = TrafficSettings.objects.get_or_create(pk=1)
        return settings

    @action(detail=False, methods=['get'])
    def current(self, request):
        settings = self.get_object()
        serializer = self.get_serializer(settings)
        return Response(serializer.data)

class TrafficLightViewSet(viewsets.ModelViewSet):
    queryset = TrafficLight.objects.all()
    serializer_class = TrafficLightSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        traffic_light = self.get_object()
        new_status = request.data.get('status')
        duration = request.data.get('duration')
        
        if new_status not in [choice[0] for choice in TrafficLight.STATUS_CHOICES]:
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        
        traffic_light.update_status(new_status, duration)
        return Response(self.get_serializer(traffic_light).data)

    @action(detail=True, methods=['post'])
    def set_emergency_mode(self, request, pk=None):
        traffic_light = self.get_object()
        traffic_light.mode = 'emergency'
        traffic_light.save()
        return Response(self.get_serializer(traffic_light).data)

class EmergencyVehicleViewSet(viewsets.ModelViewSet):
    queryset = EmergencyVehicle.objects.all()
    serializer_class = EmergencyVehicleSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['post'])
    def update_location(self, request, pk=None):
        vehicle = self.get_object()
        new_location = request.data.get('location')
        
        if not new_location:
            return Response({'error': 'Location is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        vehicle.update_location(new_location)
        return Response(self.get_serializer(vehicle).data)

    @action(detail=True, methods=['post'])
    def start_emergency(self, request, pk=None):
        vehicle = self.get_object()
        destination = request.data.get('destination')
        
        if not destination:
            return Response({'error': 'Destination is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        vehicle.destination = destination
        vehicle.is_responding = True
        vehicle.save()
        
        # Create an incident for the emergency vehicle
        Incident.objects.create(
            type='emergency',
            location=vehicle.current_location,
            description=f"{vehicle.get_vehicle_type_display()} {vehicle.vehicle_id} responding to emergency",
            severity='critical',
            reported_by=request.user
        )
        
        return Response(self.get_serializer(vehicle).data)

class TrafficLightScheduleViewSet(viewsets.ModelViewSet):
    queryset = TrafficLightSchedule.objects.all()
    serializer_class = TrafficLightScheduleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = TrafficLightSchedule.objects.all()
        traffic_light_id = self.request.query_params.get('traffic_light', None)
        if traffic_light_id:
            queryset = queryset.filter(traffic_light_id=traffic_light_id)
        return queryset

class EmergencyRouteViewSet(viewsets.ModelViewSet):
    queryset = EmergencyRoute.objects.all()
    serializer_class = EmergencyRouteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = EmergencyRoute.objects.all()
        active = self.request.query_params.get('active', None)
        if active is not None:
            queryset = queryset.filter(is_active=active == 'true')
        return queryset

    @action(detail=True, methods=['post'])
    def optimize_route(self, request, pk=None):
        # Logic to optimize route would go here
        return Response({'status': 'Route optimized'})

class TrafficReportViewSet(viewsets.ModelViewSet):
    queryset = TrafficReport.objects.all()
    serializer_class = TrafficReportSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def get_queryset(self):
        queryset = TrafficReport.objects.all()
        user = self.request.user
        period = self.request.query_params.get('period', None)
        
        # Filter by user's own reports
        if not user.is_staff:
            queryset = queryset.filter(created_by=user)
            
        # Filter by period if specified
        if period:
            queryset = queryset.filter(period=period)
            
        return queryset

    @action(detail=False, methods=['post'])
    def generate(self, request):
        """Generate a new traffic report"""
        try:
            # Get parameters
            name = request.data.get('name', f"Traffic Report {timezone.now().strftime('%Y-%m-%d')}")
            period = request.data.get('period', 'daily')
            report_format = request.data.get('format', 'pdf')
            
            # Get date range
            custom_start = request.data.get('start_date', None)
            custom_end = request.data.get('end_date', None)
            
            if custom_start and custom_end:
                try:
                    # Parse string dates to datetime
                    custom_start = timezone.datetime.fromisoformat(custom_start.replace('Z', '+00:00'))
                    custom_end = timezone.datetime.fromisoformat(custom_end.replace('Z', '+00:00'))
                except ValueError:
                    return Response(
                        {'error': 'Invalid date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Calculate start and end dates
            try:
                start_date, end_date = get_report_period_dates(period, custom_start, custom_end)
            except ValueError as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
            # Get data
            traffic_data = TrafficData.objects.filter(timestamp__gte=start_date, timestamp__lte=end_date)
            incidents_data = Incident.objects.filter(created_at__gte=start_date, created_at__lte=end_date)
            
            # Generate report data
            report_data = generate_report_data(traffic_data, incidents_data, start_date, end_date, period)
            
            if report_data['status'] == 'error':
                return Response({'error': report_data['message']}, status=status.HTTP_400_BAD_REQUEST)
            
            # Create report record
            report = TrafficReport.objects.create(
                name=name,
                period=period,
                start_date=start_date,
                end_date=end_date,
                created_by=request.user,
                report_format=report_format,
                report_data=report_data
            )
            
            # Generate report file
            try:
                report_file = generate_report_file(report_data, report_format)
                
                # Save file to report
                file_name = f"traffic_report_{timezone.now().strftime('%Y%m%d_%H%M%S')}.{report_format}"
                report.report_file.save(file_name, report_file)
                
            except Exception as e:
                # Log error but continue with report creation
                print(f"Error generating report file: {str(e)}")
            
            serializer = TrafficReportSerializer(report)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Download the report file"""
        report = self.get_object()
        
        if not report.report_file:
            # If file doesn't exist, generate it now
            try:
                report_file = generate_report_file(report.report_data, report.report_format)
                
                # Save file to report
                file_name = f"traffic_report_{timezone.now().strftime('%Y%m%d_%H%M%S')}.{report.report_format}"
                report.report_file.save(file_name, report_file)
                
            except Exception as e:
                return Response({'error': f"Error generating report file: {str(e)}"}, 
                               status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Determine content type
        content_types = {
            'csv': 'text/csv',
            'excel': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'pdf': 'application/pdf'
        }
        content_type = content_types.get(report.report_format, 'application/octet-stream')
        
        # Open the file and return it as FileResponse
        response = FileResponse(report.report_file.open('rb'), content_type=content_type)
        response['Content-Disposition'] = f'attachment; filename="{report.report_file.name}"'
        return response

class ReportScheduleViewSet(viewsets.ModelViewSet):
    queryset = ReportSchedule.objects.all()
    serializer_class = ReportScheduleSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def get_queryset(self):
        queryset = ReportSchedule.objects.all()
        user = self.request.user
        
        # Filter by user's own schedules unless staff
        if not user.is_staff:
            queryset = queryset.filter(created_by=user)
            
        # Filter by active status if specified
        active = self.request.query_params.get('active', None)
        if active is not None:
            queryset = queryset.filter(is_active=active == 'true')
            
        return queryset

    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """Toggle the active status of a schedule"""
        schedule = self.get_object()
        schedule.is_active = not schedule.is_active
        schedule.save()
        
        return Response({
            'id': schedule.id,
            'is_active': schedule.is_active
        })

    @action(detail=False, methods=['get'])
    def run_due(self, request):
        """API endpoint to run all due report schedules (could be called by cron job)"""
        if not request.user.is_staff:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        # Get all active schedules
        schedules = ReportSchedule.objects.filter(is_active=True)
        
        results = []
        for schedule in schedules:
            if schedule.is_due():
                try:
                    # Calculate date range based on report frequency
                    period = schedule.frequency
                    start_date, end_date = get_report_period_dates(period)
                    
                    # Get data
                    traffic_data = TrafficData.objects.filter(timestamp__gte=start_date, timestamp__lte=end_date)
                    incidents_data = Incident.objects.filter(created_at__gte=start_date, created_at__lte=end_date)
                    
                    # Generate report data
                    report_data = generate_report_data(traffic_data, incidents_data, start_date, end_date, period)
                    
                    if report_data['status'] == 'success':
                        # Create report
                        report = TrafficReport.objects.create(
                            name=f"{schedule.name} - {timezone.now().strftime('%Y-%m-%d')}",
                            period=period,
                            start_date=start_date,
                            end_date=end_date,
                            created_by=schedule.created_by,
                            report_format=schedule.report_format,
                            report_data=report_data
                        )
                        
                        # Generate report file
                        try:
                            report_file = generate_report_file(report_data, schedule.report_format)
                            
                            # Save file to report
                            file_name = f"scheduled_report_{timezone.now().strftime('%Y%m%d_%H%M%S')}.{schedule.report_format}"
                            report.report_file.save(file_name, report_file)
                            
                            # TODO: Email the report to recipient_email
                            # In a real app, you would implement email sending here
                            
                            results.append({
                                'schedule_id': schedule.id,
                                'status': 'success',
                                'report_id': report.id
                            })
                            
                        except Exception as e:
                            results.append({
                                'schedule_id': schedule.id,
                                'status': 'error',
                                'error': f"Error generating report file: {str(e)}"
                            })
                    else:
                        results.append({
                            'schedule_id': schedule.id,
                            'status': 'error',
                            'error': report_data.get('message', 'Unknown error')
                        })
                    
                    # Update last_run regardless of success
                    schedule.last_run = timezone.now()
                    schedule.save()
                    
                except Exception as e:
                    results.append({
                        'schedule_id': schedule.id,
                        'status': 'error',
                        'error': str(e)
                    })
        
        return Response({
            'processed': len(results),
            'results': results
        })

def index(request):
    return render(request, 'index.html')

@login_required
def profile(request):
    if not request.user.is_authenticated:
        return redirect('login')
    
    # Get or create the user profile
    profile, created = UserProfile.objects.get_or_create(user=request.user)
    
    if request.method == 'POST':
        # Debug output to see what's in the request
        print(f"POST DATA: {request.POST}")
        print(f"FILES: {request.FILES}")
        
        # Handle form submission
        if 'update_profile' in request.POST:
            # Update user information
            request.user.first_name = request.POST.get('first_name', request.user.first_name)
            request.user.last_name = request.POST.get('last_name', request.user.last_name)
            request.user.email = request.POST.get('email', request.user.email)
            request.user.save()
            
            # Update profile information
            profile.bio = request.POST.get('bio', profile.bio)
            profile.phone_number = request.POST.get('phone_number', profile.phone_number)
            profile.address = request.POST.get('address', profile.address)
            profile.position = request.POST.get('position', profile.position)
            profile.department = request.POST.get('department', profile.department)
            profile.save()
            
            messages.success(request, 'Profile updated successfully')
        
        # Handle profile picture upload
        if 'profile_picture' in request.FILES:
            profile.profile_picture = request.FILES['profile_picture']
            profile.save()
            messages.success(request, 'Profile picture updated successfully')
            
        return redirect('profile')
    
    context = {
        'user': request.user,
        'profile': profile
    }
    return render(request, 'profile.html', context)

def register(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')
        password2 = request.POST.get('password2')
        
        if password == password2:
            if User.objects.filter(username=username).exists():
                messages.error(request, 'Username already exists')
            elif User.objects.filter(email=email).exists():
                messages.error(request, 'Email already exists')
            else:
                user = User.objects.create_user(username=username, email=email, password=password)
                user.save()
                messages.success(request, 'Account created successfully')
                return redirect('login')
        else:
            messages.error(request, 'Passwords do not match')
    
    return render(request, 'register.html')

def forgot_password(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        try:
            user = User.objects.get(email=email)
            # Here you would typically send a password reset email
            messages.success(request, 'Password reset link has been sent to your email')
            return redirect('login')
        except User.DoesNotExist:
            messages.error(request, 'No account found with this email')
    
    return render(request, 'forgot_password.html')

@login_required
def traffic_dashboard(request):
    """Display the traffic management dashboard"""
    return render(request, 'traffic_dashboard.html')

def generate_sample_data(request):
    """Generate sample traffic data for public viewing"""
    try:
        # First check if we have a camera
        camera = Camera.objects.first()
        if not camera:
            # Create a test camera
            camera = Camera.objects.create(
                name="Test Camera",
                location="Main Street",
                ip_address="192.168.1.100",
                status="active",
                quality="high",
                is_recording=True
            )

        # Generate data for the last 24 hours
        end_time = timezone.now()
        start_time = end_time - timedelta(hours=24)
        current_time = start_time

        # Delete existing data to avoid duplication
        TrafficData.objects.all().delete()

        data_count = 0
        while current_time <= end_time:
            # Generate different patterns based on time of day
            hour = current_time.hour
            
            # Morning rush hour (7-9 AM)
            if 7 <= hour <= 9:
                base_count = random.randint(60, 100)
            # Evening rush hour (4-6 PM)
            elif 16 <= hour <= 18:
                base_count = random.randint(70, 110)
            # Normal hours
            elif 6 <= hour <= 22:
                base_count = random.randint(20, 50)
            # Night hours
            else:
                base_count = random.randint(5, 20)

            # Create entries for all directions
            for direction in ['northbound', 'southbound', 'eastbound', 'westbound']:
                # Add some random variation for each direction
                vehicle_count = max(0, base_count + random.randint(-10, 10))
                
                TrafficData.objects.create(
                    camera=camera,
                    direction=direction,
                    vehicle_count=vehicle_count,
                    timestamp=current_time
                )
                data_count += 1
            
            current_time += timedelta(minutes=15)  # 15-minute intervals

        return HttpResponse(f"Generated {data_count} traffic data points successfully!")
    except Exception as e:
        return HttpResponse(f"Error generating data: {str(e)}") 