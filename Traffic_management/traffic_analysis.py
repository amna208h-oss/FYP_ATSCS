from datetime import datetime, timedelta
from django.utils import timezone
from django.db.models import Avg, Count, Max, Min
import numpy as np
import pandas as pd
import json
import os
from io import BytesIO

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

def generate_report_data(traffic_data, incidents_data, start_date, end_date, period='daily'):
    """
    Generate detailed traffic report data based on period
    
    Parameters:
    - traffic_data: QuerySet of TrafficData
    - incidents_data: QuerySet of Incident
    - start_date: Start date of the report period
    - end_date: End date of the report period
    - period: 'daily', 'weekly', or 'monthly'
    
    Returns:
    - Dictionary with report data
    """
    filtered_traffic = [d for d in traffic_data if start_date <= d.timestamp <= end_date]
    filtered_incidents = [i for i in incidents_data if start_date <= i.created_at <= end_date]
    
    if not filtered_traffic:
        return {
            'status': 'error',
            'message': 'No traffic data available for selected period',
            'period': period,
            'start_date': start_date,
            'end_date': end_date
        }
    
    # Calculate total and average traffic volumes
    total_vehicles = sum(d.vehicle_count for d in filtered_traffic)
    avg_vehicles = total_vehicles / len(filtered_traffic)
    
    # Direction distribution
    direction_counts = {
        'northbound': 0,
        'southbound': 0,
        'eastbound': 0,
        'westbound': 0
    }
    
    for data in filtered_traffic:
        direction_counts[data.direction] += data.vehicle_count
    
    # Peak traffic times
    peak_hours = calculate_peak_hours(filtered_traffic)
    
    # Incident summary
    incident_summary = {
        'total': len(filtered_incidents),
        'by_type': {},
        'by_severity': {}
    }
    
    for incident in filtered_incidents:
        # Count by type
        if incident.type not in incident_summary['by_type']:
            incident_summary['by_type'][incident.type] = 0
        incident_summary['by_type'][incident.type] += 1
        
        # Count by severity
        if incident.severity not in incident_summary['by_severity']:
            incident_summary['by_severity'][incident.severity] = 0
        incident_summary['by_severity'][incident.severity] += 1
    
    # Generate time series data based on period
    time_series_data = generate_time_series(filtered_traffic, period, start_date, end_date)
    
    return {
        'status': 'success',
        'period': period,
        'start_date': start_date,
        'end_date': end_date,
        'summary': {
            'total_vehicles': total_vehicles,
            'average_vehicles_per_reading': round(avg_vehicles, 2),
            'direction_distribution': direction_counts,
            'peak_times': peak_hours,
            'congestion_level': calculate_congestion_level(avg_vehicles)
        },
        'incidents': incident_summary,
        'time_series': time_series_data
    }

def generate_time_series(traffic_data, period, start_date, end_date):
    """Generate time series data based on the report period"""
    time_series = []
    
    if period == 'daily':
        # Group by hour
        hour_data = {}
        for data in traffic_data:
            hour = data.timestamp.hour
            if hour not in hour_data:
                hour_data[hour] = []
            hour_data[hour].append(data.vehicle_count)
        
        # Calculate average for each hour
        for hour in range(24):
            avg_value = 0
            if hour in hour_data and hour_data[hour]:
                avg_value = sum(hour_data[hour]) / len(hour_data[hour])
            
            time_series.append({
                'label': f"{hour:02d}:00",
                'value': round(avg_value, 2)
            })
    
    elif period == 'weekly':
        # Group by day of week
        day_data = {}
        for data in traffic_data:
            day = data.timestamp.weekday()
            if day not in day_data:
                day_data[day] = []
            day_data[day].append(data.vehicle_count)
        
        # Calculate average for each day
        day_names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        for day in range(7):
            avg_value = 0
            if day in day_data and day_data[day]:
                avg_value = sum(day_data[day]) / len(day_data[day])
            
            time_series.append({
                'label': day_names[day],
                'value': round(avg_value, 2)
            })
    
    elif period == 'monthly':
        # Group by day of month
        days_in_month = (end_date - start_date).days + 1
        day_data = {}
        
        for data in traffic_data:
            day = data.timestamp.day
            if day not in day_data:
                day_data[day] = []
            day_data[day].append(data.vehicle_count)
        
        # Calculate average for each day
        for day in range(1, days_in_month + 1):
            day_date = start_date + timedelta(days=day-1)
            avg_value = 0
            
            if day in day_data and day_data[day]:
                avg_value = sum(day_data[day]) / len(day_data[day])
            
            time_series.append({
                'label': f"{day_date.strftime('%b %d')}",
                'value': round(avg_value, 2)
            })
    
    return time_series

def generate_report_file(report_data, report_format):
    """
    Generate report file in the specified format
    
    Parameters:
    - report_data: Dictionary with report data
    - report_format: 'csv', 'excel', or 'pdf'
    
    Returns:
    - BytesIO object with the file content
    """
    if report_format == 'csv':
        return generate_csv_report(report_data)
    elif report_format == 'excel':
        return generate_excel_report(report_data)
    elif report_format == 'pdf':
        return generate_pdf_report(report_data)
    else:
        raise ValueError(f"Unsupported report format: {report_format}")

def generate_csv_report(report_data):
    """Generate a CSV report from the report data"""
    output = BytesIO()
    
    # Convert time series data to dataframe
    time_series_df = pd.DataFrame([
        {'Time': ts['label'], 'Traffic Volume': ts['value']} 
        for ts in report_data['time_series']
    ])
    
    # Write time series data
    time_series_df.to_csv(output, index=False)
    
    # Reset buffer position
    output.seek(0)
    return output

def generate_excel_report(report_data):
    """Generate an Excel report from the report data"""
    output = BytesIO()
    
    # Create Excel writer
    writer = pd.ExcelWriter(output, engine='xlsxwriter')
    
    # Convert time series data to dataframe
    time_series_df = pd.DataFrame([
        {'Time': ts['label'], 'Traffic Volume': ts['value']} 
        for ts in report_data['time_series']
    ])
    
    # Create summary dataframe
    summary_data = [
        {'Metric': 'Total Vehicles', 'Value': report_data['summary']['total_vehicles']},
        {'Metric': 'Average Vehicles per Reading', 'Value': report_data['summary']['average_vehicles_per_reading']},
        {'Metric': 'Congestion Level', 'Value': report_data['summary']['congestion_level']}
    ]
    
    # Add direction distribution
    for direction, count in report_data['summary']['direction_distribution'].items():
        summary_data.append({'Metric': f'{direction.capitalize()} Vehicles', 'Value': count})
    
    summary_df = pd.DataFrame(summary_data)
    
    # Create incidents dataframe
    incident_data = []
    for incident_type, count in report_data['incidents']['by_type'].items():
        incident_data.append({'Incident Type': incident_type, 'Count': count})
    
    incident_df = pd.DataFrame(incident_data) if incident_data else pd.DataFrame({'Incident Type': [], 'Count': []})
    
    # Write to Excel
    time_series_df.to_excel(writer, sheet_name='Traffic Volume', index=False)
    summary_df.to_excel(writer, sheet_name='Summary', index=False)
    incident_df.to_excel(writer, sheet_name='Incidents', index=False)
    
    # Save workbook
    writer.save()
    
    # Reset buffer position
    output.seek(0)
    return output

def generate_pdf_report(report_data):
    """Generate a PDF report from the report data"""
    # Note: In a real application, you would use a library like ReportLab or WeasyPrint
    # For this implementation, we'll return a simple JSON representation for demonstration
    
    output = BytesIO()
    
    # Convert report data to JSON format
    json.dump(report_data, output)
    
    # Reset buffer position
    output.seek(0)
    return output

def get_report_period_dates(period, custom_start=None, custom_end=None):
    """
    Calculate start and end dates based on report period
    
    Parameters:
    - period: 'daily', 'weekly', 'monthly', or 'custom'
    - custom_start: Custom start date for 'custom' period
    - custom_end: Custom end date for 'custom' period
    
    Returns:
    - Tuple of (start_date, end_date)
    """
    now = timezone.now()
    
    if period == 'daily':
        # Last 24 hours
        end_date = now
        start_date = end_date - timedelta(days=1)
    
    elif period == 'weekly':
        # Last 7 days
        end_date = now
        start_date = end_date - timedelta(days=7)
    
    elif period == 'monthly':
        # Last 30 days
        end_date = now
        start_date = end_date - timedelta(days=30)
    
    elif period == 'custom':
        # Custom date range
        if not custom_start or not custom_end:
            raise ValueError("Custom start and end dates must be provided for custom period")
        
        start_date = custom_start
        end_date = custom_end
    
    else:
        raise ValueError(f"Invalid report period: {period}")
    
    return (start_date, end_date) 