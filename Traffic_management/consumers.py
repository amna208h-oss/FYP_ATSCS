import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import TrafficData, Camera, Alert, Incident
from django.utils import timezone
from datetime import timedelta

class TrafficDataConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add(
            "traffic_data",
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            "traffic_data",
            self.channel_name
        )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            if data.get('type') == 'subscribe':
                # Handle subscription to specific data types
                await self.handle_subscription(data)
            elif data.get('type') == 'update':
                # Handle data updates from client
                await self.handle_update(data)
        except json.JSONDecodeError:
            await self.send_error("Invalid JSON data")

    async def handle_subscription(self, data):
        subscriptions = data.get('subscriptions', [])
        if 'traffic' in subscriptions:
            # Send current traffic data
            traffic_data = await self.get_traffic_data()
            await self.send_traffic_data(traffic_data)
        if 'alerts' in subscriptions:
            # Send active alerts
            alerts = await self.get_active_alerts()
            await self.send_alerts(alerts)
        if 'incidents' in subscriptions:
            # Send active incidents
            incidents = await self.get_active_incidents()
            await self.send_incidents(incidents)

    async def handle_update(self, data):
        # Process updates from client (e.g., new incident report)
        if data.get('update_type') == 'incident':
            await self.create_incident(data)
        elif data.get('update_type') == 'alert':
            await self.create_alert(data)

    @database_sync_to_async
    def get_traffic_data(self):
        # Get traffic data for the last 5 minutes
        time_threshold = timezone.now() - timedelta(minutes=5)
        data = TrafficData.objects.filter(timestamp__gte=time_threshold)
        
        return {
            'type': 'traffic_data',
            'data': {
                'northbound': sum(d.vehicle_count for d in data if d.direction == 'northbound'),
                'southbound': sum(d.vehicle_count for d in data if d.direction == 'southbound'),
                'eastbound': sum(d.vehicle_count for d in data if d.direction == 'eastbound'),
                'westbound': sum(d.vehicle_count for d in data if d.direction == 'westbound'),
                'total': sum(d.vehicle_count for d in data),
                'timestamp': timezone.now().isoformat()
            }
        }

    @database_sync_to_async
    def get_active_alerts(self):
        alerts = Alert.objects.filter(is_active=True)
        return {
            'type': 'alerts',
            'data': [{
                'id': alert.id,
                'type': alert.type,
                'message': alert.message,
                'severity': alert.severity,
                'created_at': alert.created_at.isoformat()
            } for alert in alerts]
        }

    @database_sync_to_async
    def get_active_incidents(self):
        incidents = Incident.objects.filter(status='active')
        return {
            'type': 'incidents',
            'data': [{
                'id': incident.id,
                'type': incident.type,
                'location': incident.location,
                'severity': incident.severity,
                'created_at': incident.created_at.isoformat()
            } for incident in incidents]
        }

    @database_sync_to_async
    def create_incident(self, data):
        camera = Camera.objects.first()  # For demo, use first camera
        incident = Incident.objects.create(
            type=data.get('incident_type'),
            location=data.get('location'),
            description=data.get('description'),
            severity=data.get('severity', 'medium'),
            camera=camera
        )
        return incident

    @database_sync_to_async
    def create_alert(self, data):
        alert = Alert.objects.create(
            type=data.get('alert_type'),
            message=data.get('message'),
            severity=data.get('severity', 'medium')
        )
        return alert

    async def send_traffic_data(self, data):
        await self.send(text_data=json.dumps(data))

    async def send_alerts(self, data):
        await self.send(text_data=json.dumps(data))

    async def send_incidents(self, data):
        await self.send(text_data=json.dumps(data))

    async def send_error(self, message):
        await self.send(text_data=json.dumps({
            'type': 'error',
            'message': message
        }))

    async def traffic_update(self, event):
        # Send traffic data updates to all connected clients
        await self.send(text_data=json.dumps(event['data']))

    async def alert_update(self, event):
        # Send alert updates to all connected clients
        await self.send(text_data=json.dumps(event['data']))

    async def incident_update(self, event):
        # Send incident updates to all connected clients
        await self.send(text_data=json.dumps(event['data'])) 