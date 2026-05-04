from datetime import datetime, timedelta
from django.utils import timezone
from django.db.models import Avg, Count, Max, Min
import numpy as np

def calculate_congestion_level(vehicle_count):
    """Calculate congestion level based on vehicle count"""
    if vehicle_count < 20:
        return "Low"
    elif vehicle_count < 50:
        return "Moderate"
    elif vehicle_count < 80:
        return "High"
    else:
        return "Severe"

def predict_traffic_flow(historical_data):
    """Simple traffic flow prediction based on historical data"""
    if not historical_data:
        return 0
    
    # Calculate weighted average with more recent data having higher weight
    total_weight = 0
    weighted_sum = 0
    
    for i, data in enumerate(historical_data):
        weight = len(historical_data) - i
        weighted_sum += data.vehicle_count * weight
        total_weight += weight
    
    return round(weighted_sum / total_weight if total_weight > 0 else 0)

def calculate_peak_hours(traffic_data):
    """Calculate peak hours based on traffic data"""
    hourly_averages = {}
    
    for data in traffic_data:
        hour = data.timestamp.hour
        if hour not in hourly_averages:
            hourly_averages[hour] = {'total': 0, 'count': 0}
        hourly_averages[hour]['total'] += data.vehicle_count
        hourly_averages[hour]['count'] += 1
    
    peak_hours = []
    for hour, data in hourly_averages.items():
        avg = data['total'] / data['count']
        peak_hours.append({'hour': hour, 'average_vehicles': avg})
    
    # Sort by average vehicles in descending order
    peak_hours.sort(key=lambda x: x['average_vehicles'], reverse=True)
    return peak_hours[:3]  # Return top 3 peak hours

def analyze_emergency_impact(emergency_routes, traffic_data):
    """Analyze impact of emergency vehicles on traffic flow"""
    impact_data = {
        'total_emergency_routes': len(emergency_routes),
        'affected_areas': set(),
        'average_congestion_increase': 0
    }
    
    for route in emergency_routes:
        # Add start and end locations to affected areas
        impact_data['affected_areas'].add(route.start_location)
        impact_data['affected_areas'].add(route.end_location)
    
    impact_data['affected_areas'] = list(impact_data['affected_areas'])
    return impact_data

def generate_traffic_report(traffic_data, time_period=24):
    """Generate comprehensive traffic report"""
    end_time = timezone.now()
    start_time = end_time - timedelta(hours=time_period)
    
    filtered_data = [d for d in traffic_data if start_time <= d.timestamp <= end_time]
    
    if not filtered_data:
        return {
            'status': 'No data available',
            'period': f'Last {time_period} hours'
        }
    
    total_vehicles = sum(d.vehicle_count for d in filtered_data)
    avg_vehicles = total_vehicles / len(filtered_data)
    
    direction_counts = {
        'northbound': 0,
        'southbound': 0,
        'eastbound': 0,
        'westbound': 0
    }
    
    for data in filtered_data:
        direction_counts[data.direction] += data.vehicle_count
    
    peak_hours = calculate_peak_hours(filtered_data)
    
    return {
        'status': 'success',
        'period': f'Last {time_period} hours',
        'total_vehicles': total_vehicles,
        'average_vehicles_per_reading': round(avg_vehicles, 2),
        'direction_distribution': direction_counts,
        'peak_hours': peak_hours,
        'congestion_level': calculate_congestion_level(avg_vehicles)
    } 