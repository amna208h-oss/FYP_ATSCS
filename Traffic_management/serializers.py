from rest_framework import serializers
from .models import (
    Camera, TrafficData, Incident, Alert,
    TrafficSettings, CameraSettings,
    TrafficLight, EmergencyVehicle, TrafficLightSchedule, EmergencyRoute,
    TrafficReport, ReportSchedule
)

class CameraSerializer(serializers.ModelSerializer):
    class Meta:
        model = Camera
        fields = '__all__'
        read_only_fields = ('last_active', 'created_at')

class TrafficDataSerializer(serializers.ModelSerializer):
    camera_name = serializers.CharField(source='camera.name', read_only=True)
    direction_display = serializers.CharField(source='get_direction_display', read_only=True)

    class Meta:
        model = TrafficData
        fields = '__all__'
        read_only_fields = ('timestamp',)

class IncidentSerializer(serializers.ModelSerializer):
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    reported_by_name = serializers.CharField(source='reported_by.username', read_only=True)
    camera_name = serializers.CharField(source='camera.name', read_only=True)

    class Meta:
        model = Incident
        fields = '__all__'
        read_only_fields = ('created_at', 'resolved_at')

class AlertSerializer(serializers.ModelSerializer):
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)
    incident_type = serializers.CharField(source='incident.type', read_only=True)
    incident_location = serializers.CharField(source='incident.location', read_only=True)

    class Meta:
        model = Alert
        fields = '__all__'
        read_only_fields = ('created_at', 'resolved_at')

class TrafficSettingsSerializer(serializers.ModelSerializer):
    signal_timing_display = serializers.CharField(source='get_signal_timing_display', read_only=True)
    emergency_priority_display = serializers.CharField(source='get_emergency_priority_display', read_only=True)

    class Meta:
        model = TrafficSettings
        fields = '__all__'
        read_only_fields = ('last_updated',)

class CameraSettingsSerializer(serializers.ModelSerializer):
    camera_name = serializers.CharField(source='camera.name', read_only=True)

    class Meta:
        model = CameraSettings
        fields = '__all__'
        read_only_fields = ('last_updated',)

class TrafficLightSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrafficLight
        fields = '__all__'

class EmergencyVehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmergencyVehicle
        fields = '__all__'

class TrafficLightScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrafficLightSchedule
        fields = '__all__'

class EmergencyRouteSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmergencyRoute
        fields = '__all__'

class TrafficReportSerializer(serializers.ModelSerializer):
    created_by_name = serializers.ReadOnlyField(source='created_by.username')
    
    class Meta:
        model = TrafficReport
        fields = '__all__'
        read_only_fields = ['created_at', 'report_data', 'report_file']

class ReportScheduleSerializer(serializers.ModelSerializer):
    created_by_name = serializers.ReadOnlyField(source='created_by.username')
    
    class Meta:
        model = ReportSchedule
        fields = '__all__'
        read_only_fields = ['created_at', 'last_run'] 