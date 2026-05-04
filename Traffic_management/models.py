from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from django.db.models.signals import post_save
from django.dispatch import receiver

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    position = models.CharField(max_length=100, blank=True, null=True)
    department = models.CharField(max_length=100, blank=True, null=True)
    date_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"

# Signal to create a profile when a user is created
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()

class Camera(models.Model):
    CAMERA_STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('maintenance', 'Maintenance'),
    ]

    CAMERA_QUALITY_CHOICES = [
        ('high', 'High (1080p)'),
        ('medium', 'Medium (720p)'),
        ('low', 'Low (480p)'),
    ]

    name = models.CharField(max_length=100)
    location = models.CharField(max_length=200)
    ip_address = models.GenericIPAddressField()
    status = models.CharField(max_length=20, choices=CAMERA_STATUS_CHOICES, default='active')
    quality = models.CharField(max_length=20, choices=CAMERA_QUALITY_CHOICES, default='high')
    is_recording = models.BooleanField(default=True)
    last_active = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.location}"

class TrafficData(models.Model):
    DIRECTION_CHOICES = [
        ('northbound', 'Northbound'),
        ('southbound', 'Southbound'),
        ('eastbound', 'Eastbound'),
        ('westbound', 'Westbound'),
    ]

    camera = models.ForeignKey(Camera, on_delete=models.CASCADE, related_name='traffic_data')
    direction = models.CharField(max_length=20, choices=DIRECTION_CHOICES)
    vehicle_count = models.IntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_prediction = models.BooleanField(default=False)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.camera.name} - {self.direction} - {self.vehicle_count} vehicles"

class Incident(models.Model):
    INCIDENT_TYPE_CHOICES = [
        ('accident', 'Accident'),
        ('congestion', 'Traffic Congestion'),
        ('signal', 'Signal Failure'),
        ('weather', 'Weather Condition'),
        ('emergency', 'Emergency Vehicle'),
        ('other', 'Other'),
    ]

    SEVERITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('resolved', 'Resolved'),
        ('investigating', 'Investigating'),
    ]

    type = models.CharField(max_length=20, choices=INCIDENT_TYPE_CHOICES)
    location = models.CharField(max_length=200)
    description = models.TextField()
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    reported_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    camera = models.ForeignKey(Camera, on_delete=models.SET_NULL, null=True, related_name='incidents')

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_type_display()} at {self.location}"

class Alert(models.Model):
    ALERT_TYPE_CHOICES = [
        ('traffic', 'Traffic Congestion'),
        ('emergency', 'Emergency Vehicle'),
        ('weather', 'Weather Condition'),
        ('system', 'System Status'),
    ]

    type = models.CharField(max_length=20, choices=ALERT_TYPE_CHOICES)
    message = models.TextField()
    severity = models.CharField(max_length=20, choices=Incident.SEVERITY_CHOICES)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    incident = models.ForeignKey(Incident, on_delete=models.SET_NULL, null=True, related_name='alerts')

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_type_display()} Alert - {self.message[:50]}"

class TrafficSettings(models.Model):
    congestion_threshold = models.IntegerField(default=100)
    signal_timing = models.CharField(max_length=20, choices=[
        ('dynamic', 'Dynamic (Auto-adjust)'),
        ('fixed', 'Fixed Timing'),
        ('peak', 'Peak Hours'),
        ('offpeak', 'Off-Peak Hours'),
    ], default='dynamic')
    emergency_priority = models.CharField(max_length=20, choices=[
        ('high', 'High Priority'),
        ('medium', 'Medium Priority'),
        ('low', 'Low Priority'),
    ], default='high')
    enable_optimization = models.BooleanField(default=True)
    enable_predictions = models.BooleanField(default=True)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return "Traffic Management Settings"

class CameraSettings(models.Model):
    camera = models.OneToOneField(Camera, on_delete=models.CASCADE, related_name='settings')
    recording_duration = models.IntegerField(choices=[
        (24, '24 Hours'),
        (48, '48 Hours'),
        (72, '72 Hours'),
        (168, '7 Days'),
    ], default=24)
    enable_motion = models.BooleanField(default=True)
    enable_night = models.BooleanField(default=True)
    enable_auto_focus = models.BooleanField(default=True)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Settings for {self.camera.name}"

class TrafficLight(models.Model):
    STATUS_CHOICES = [
        ('red', 'Red'),
        ('yellow', 'Yellow'),
        ('green', 'Green'),
    ]

    MODE_CHOICES = [
        ('normal', 'Normal Operation'),
        ('emergency', 'Emergency Mode'),
        ('maintenance', 'Maintenance'),
    ]

    location = models.CharField(max_length=200)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='red')
    mode = models.CharField(max_length=20, choices=MODE_CHOICES, default='normal')
    duration = models.IntegerField(default=30)  # Duration in seconds
    last_updated = models.DateTimeField(auto_now=True)
    is_connected = models.BooleanField(default=True)
    camera = models.ForeignKey(Camera, on_delete=models.SET_NULL, null=True, related_name='traffic_lights')

    def __str__(self):
        return f"Traffic Light at {self.location}"

    def update_status(self, new_status, duration=None):
        self.status = new_status
        if duration:
            self.duration = duration
        self.save()

class EmergencyVehicle(models.Model):
    VEHICLE_TYPE_CHOICES = [
        ('ambulance', 'Ambulance'),
        ('fire_truck', 'Fire Truck'),
        ('police', 'Police Car'),
        ('other', 'Other Emergency Vehicle'),
    ]

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('maintenance', 'Maintenance'),
    ]

    vehicle_id = models.CharField(max_length=50, unique=True)
    vehicle_type = models.CharField(max_length=20, choices=VEHICLE_TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    current_location = models.CharField(max_length=200, null=True, blank=True)
    destination = models.CharField(max_length=200, null=True, blank=True)
    priority_level = models.IntegerField(default=1)  # 1 being highest priority
    last_updated = models.DateTimeField(auto_now=True)
    is_responding = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.get_vehicle_type_display()} - {self.vehicle_id}"

    def update_location(self, new_location):
        self.current_location = new_location
        self.last_updated = timezone.now()
        self.save()

class TrafficLightSchedule(models.Model):
    traffic_light = models.ForeignKey(TrafficLight, on_delete=models.CASCADE, related_name='schedules')
    start_time = models.TimeField()
    end_time = models.TimeField()
    status = models.CharField(max_length=20, choices=TrafficLight.STATUS_CHOICES)
    duration = models.IntegerField()  # Duration in seconds
    day_of_week = models.IntegerField(choices=[
        (0, 'Monday'),
        (1, 'Tuesday'),
        (2, 'Wednesday'),
        (3, 'Thursday'),
        (4, 'Friday'),
        (5, 'Saturday'),
        (6, 'Sunday'),
    ])

    def __str__(self):
        return f"Schedule for {self.traffic_light.location} - {self.get_day_of_week_display()}"

class EmergencyRoute(models.Model):
    emergency_vehicle = models.ForeignKey(EmergencyVehicle, on_delete=models.CASCADE, related_name='routes')
    start_location = models.CharField(max_length=200)
    end_location = models.CharField(max_length=200)
    route_path = models.JSONField()  # Store the route coordinates
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Route for {self.emergency_vehicle.vehicle_id}"

class TrafficReport(models.Model):
    PERIOD_CHOICES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('custom', 'Custom Range'),
    ]
    
    FORMAT_CHOICES = [
        ('csv', 'CSV'),
        ('excel', 'Excel'),
        ('pdf', 'PDF'),
    ]
    
    name = models.CharField(max_length=100)
    period = models.CharField(max_length=20, choices=PERIOD_CHOICES, default='daily')
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='reports')
    created_at = models.DateTimeField(auto_now_add=True)
    report_format = models.CharField(max_length=10, choices=FORMAT_CHOICES, default='pdf')
    report_data = models.JSONField(null=True, blank=True)  # Store the report data
    report_file = models.FileField(upload_to='reports/', null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.get_period_display()}"
    
    def get_time_range(self):
        return {
            'start': self.start_date,
            'end': self.end_date,
            'period': self.period
        }

class ReportSchedule(models.Model):
    FREQUENCY_CHOICES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
    ]
    
    DAY_CHOICES = [
        (0, 'Monday'),
        (1, 'Tuesday'),
        (2, 'Wednesday'),
        (3, 'Thursday'),
        (4, 'Friday'),
        (5, 'Saturday'),
        (6, 'Sunday'),
    ]
    
    name = models.CharField(max_length=100)
    report_type = models.CharField(max_length=50)
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES)
    time = models.TimeField()
    day_of_week = models.IntegerField(choices=DAY_CHOICES, null=True, blank=True)  # For weekly schedules
    day_of_month = models.IntegerField(null=True, blank=True)  # For monthly schedules
    recipient_email = models.EmailField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='report_schedules')
    created_at = models.DateTimeField(auto_now_add=True)
    last_run = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    report_format = models.CharField(max_length=10, choices=TrafficReport.FORMAT_CHOICES, default='pdf')
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.get_frequency_display()} ({self.recipient_email})"
    
    def is_due(self):
        """Check if the schedule is due to run"""
        if not self.last_run:
            return True
            
        now = timezone.now()
        
        if self.frequency == 'daily':
            next_run = self.last_run.replace(hour=self.time.hour, minute=self.time.minute)
            next_run += timedelta(days=1)
            return now >= next_run
            
        elif self.frequency == 'weekly':
            days_ahead = self.day_of_week - self.last_run.weekday()
            if days_ahead <= 0:  # Target day already happened this week
                days_ahead += 7
            next_run = self.last_run.replace(hour=self.time.hour, minute=self.time.minute)
            next_run += timedelta(days=days_ahead)
            return now >= next_run
            
        elif self.frequency == 'monthly':
            last_run_month = self.last_run.month
            last_run_year = self.last_run.year
            
            next_month = last_run_month + 1
            next_year = last_run_year
            
            if next_month > 12:
                next_month = 1
                next_year += 1
                
            try:
                next_run = self.last_run.replace(
                    year=next_year,
                    month=next_month,
                    day=self.day_of_month,
                    hour=self.time.hour,
                    minute=self.time.minute
                )
            except ValueError:
                # Handle invalid dates (e.g., February 30)
                if next_month in [4, 6, 9, 11]:
                    max_day = 30
                elif next_month == 2:
                    max_day = 29 if (next_year % 4 == 0 and next_year % 100 != 0) or (next_year % 400 == 0) else 28
                else:
                    max_day = 31
                    
                next_run = self.last_run.replace(
                    year=next_year,
                    month=next_month,
                    day=min(self.day_of_month, max_day),
                    hour=self.time.hour,
                    minute=self.time.minute
                )
                
            return now >= next_run
        
        return False 