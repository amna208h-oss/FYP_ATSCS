from django.shortcuts import render,redirect
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.conf import settings
from django.core.mail import EmailMessage
from django.utils import timezone
from django.urls import reverse
from .models import *
from django.http import JsonResponse
from .models import UserProfile
from .forms import UserProfileForm
import random
from datetime import timedelta, datetime
import json
from django.views.decorators.csrf import csrf_exempt


@login_required
def Home(request):
    return render(request ,"index.html")

@login_required
def traffic_dashboard_view(request):
    return render(request, "traffic_dashboard.html")

@login_required
def monitoring_view(request):
    return render(request, 'monitoring.html')

@login_required
def settings_view(request):
    return render(request, 'settings.html')

def RegisterView(request):
    if request.method =="POST":
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')
        password1 = request.POST.get('password1')





        user_data_has_error = False

        if User.objects.filter(username=username).exists():
             user_data_has_error = True
             messages.error(request,"Username already taken") 
        if User.objects.filter(email=email).exists():
             user_data_has_error = True
             messages.error(request,"This email already exists") 
             #make condition for password is at least 5 Characters long
        if len(password)< 5:
             user_data_has_error = True
             messages.error(request,"Password must be at least 5 characters")
         #make condition if password is not equal to confirm Password
        if password!=password1:
             user_data_has_error = True
             messages.error(request,"Your passwords didn't match")
        if user_data_has_error:
             return redirect('register')    
         # if not any error create a user 
        else:
             new_user =User.objects.create_user(
                 username= username,
                 email = email,
                 password=password
             )   
             messages.success(request,"Account created. Please login now")
             return redirect('login')



    return render(request, 'register.html')

def LoginView(request):
    if request.method == "POST":
         username = request.POST.get("username")
         password = request.POST.get("password")

         user = authenticate(request, username=username,password=password)
         if user is not None:
              login(request,user)
              return redirect('home')
         else:
              messages.error(request,"Invalid login credentials")
              return redirect('login')

    
    
    
    return render(request, 'login.html')

def LogoutView(request):
     logout(request)
     messages.success(request, "You have been logged out successfully")
     return redirect('login')

def ForgotPassword(request):
     if request.method == "POST":
          email= request.POST.get('email')

          try:
               user = User.objects.get(email=email)
               #create a new reset id 
               new_password_reset = PasswordReset(user=user)
               new_password_reset.save()

               password_reset_url = reverse('reset-password',kwargs={'reset_id': new_password_reset.reset_id})

               full_password_reset_url = f'{request.scheme}://{request.get_host()}{password_reset_url}'
               #email body
               email_body = f'Reset your password using the link below:\n\n{full_password_reset_url}'
               # create Message
               email_message = EmailMessage(
                    'Reset Your Password',
                    email_body,
                    settings.EMAIL_HOST_USER,
                    [email],
                    
                    )
               email_message.fail_silently = True
               email_message.send()
               return redirect('password-reset-sent', reset_id=new_password_reset.reset_id)

          

          except User.DoesNotExist:
               messages.error(request,f"No user with email'{email}' found ")
               return redirect('forgot-password')
               

     


     return render(request, 'forgot_password.html')




def PasswordResetSent(request, reset_id):
     if PasswordReset.objects.filter(reset_id=reset_id).exists():
        return render(request, 'reset_password_sent.html')
     else:
          messages.error(request,'Invalid reset id')
          return redirect('forgot-password')

def ResetPassword(request, reset_id):
     try:
          password_reset = PasswordReset.objects.get(reset_id=reset_id)
          if request.method == "POST":
               password = request.POST.get('password')
               password2 = request.POST.get('password2')

               passwords_have_error = False

               if password != password2:
                    passwords_have_error = True
                    messages.error(request,'Passwords do not match')
               if len(password) < 5:
                  passwords_have_error = True
                  messages.error(request,"Password must be at least 5 characters")

               expiration_time = password_reset.created_when + timezone.timedelta(minutes=10)
               if timezone.now() > expiration_time:
                    passwords_have_error = True
                    messages.error(request,'Reset link has expired')
                    password_reset.delete()

               if not passwords_have_error:
                    user = password_reset.user 
                    user.set_password(password)
                    user.save()  

                    password_reset.delete()
                    messages.success(request,"Password reset. Please login with your new password")
                    return redirect('login')
               else:
                    return redirect('reset-password',reset_id=reset_id)
                 

     except PasswordReset.DoesNotExist:
          # redirect to forgot password page if code does not exist
          messages.error(request,'Invalid reset id')
          return redirect('forgot-password') 
     
     
     return render(request, 'reset_password.html')






def traffic_data(request):
    data = {
        "trafficFlow": [45, 80, 120, 100, 60],
        "emergencyVehiclesCount": 3,
        "emergencyVehicles": [
            {"name": "Ambulance 1", "location": "Main Street"},
            {"name": "Ambulance 2", "location": "Downtown"},
            {"name": "Ambulance 3", "location": "City Park"},
        ],
        "incidents": [2, 4, 3, 5],
    }
    return JsonResponse(data)

def change_signal(request, signal_id):
    # Logic to change traffic light signal
    return JsonResponse({"success": True, "signal_id": signal_id})

@login_required
@csrf_exempt  # Temporary for debugging
def user_profile(request):
    print(f"User profile view accessed by user: {request.user}")
    print(f"Request method: {request.method}")
    
    try:
        profile = request.user.profile
    except UserProfile.DoesNotExist:
        profile = UserProfile.objects.create(user=request.user)
    
    if request.method == 'POST':
        print(f"POST data: {request.POST}")
        print(f"FILES data: {request.FILES}")
        
        form_type = request.POST.get('form_type', '')
        print(f"Form type: {form_type}")
        
        if 'profile_picture' in request.FILES:
            print("Profile picture detected in request.FILES")
            profile.profile_picture = request.FILES['profile_picture']
            profile.save()
            messages.success(request, 'Profile picture updated successfully!')
            return redirect('profile')
        
        form = UserProfileForm(request.POST, request.FILES, instance=profile)
        if form.is_valid():
            print("Form is valid, saving...")
            # Save the form which will update the profile
            profile_instance = form.save(commit=False)
            
            # Make sure the bio field gets saved
            if 'bio' in request.POST:
                profile_instance.bio = request.POST.get('bio')
            
            profile_instance.save()
            
            # Also update user model fields if present
            user = request.user
            if 'first_name' in request.POST:
                user.first_name = request.POST.get('first_name')
            if 'last_name' in request.POST:
                user.last_name = request.POST.get('last_name')
            if 'email' in request.POST:
                user.email = request.POST.get('email')
            user.save()
            
            messages.success(request, 'Profile updated successfully!')
            return redirect('profile')
        else:
            print(f"Form errors: {form.errors}")
            messages.error(request, 'Error updating profile. Please check the form.')
    else:
        form = UserProfileForm(instance=profile)
    
    context = {
        'form': form,
        'profile': profile
    }
    return render(request, 'profile.html', context)

def logout_view(request):
    logout(request)
    messages.success(request, 'You have been logged out successfully.')
    return redirect('login')

@login_required
def traffic_dashboard(request):
    """Display the traffic management dashboard"""
    return render(request, 'traffic_dashboard.html')

def api_real_time_traffic(request):
    """API endpoint for real-time traffic data"""
    # Create dummy data for demonstration
    data = {
        'status': 'active',
        'last_updated': timezone.now().isoformat(),
        'current_flow': {
            'total_vehicles': random.randint(150, 300),
            'average_per_direction': random.randint(40, 80),
            'congestion_level': 'Moderate'
        },
        'direction_status': {
            'northbound': {
                'vehicle_count': random.randint(30, 90),
                'congestion_level': 'Moderate'
            },
            'southbound': {
                'vehicle_count': random.randint(30, 90),
                'congestion_level': 'High'
            },
            'eastbound': {
                'vehicle_count': random.randint(30, 90),
                'congestion_level': 'Low'
            },
            'westbound': {
                'vehicle_count': random.randint(30, 90),
                'congestion_level': 'Moderate'
            }
        }
    }
    return JsonResponse(data)

def api_traffic_analysis(request):
    """API endpoint for traffic analysis data"""
    # Create dummy data for demonstration
    data = {
        'status': 'success',
        'period': 'Last 24 hours',
        'total_vehicles': random.randint(5000, 10000),
        'average_vehicles_per_reading': random.randint(40, 80),
        'direction_distribution': {
            'northbound': random.randint(1200, 2500),
            'southbound': random.randint(1200, 2500),
            'eastbound': random.randint(1200, 2500),
            'westbound': random.randint(1200, 2500)
        },
        'peak_hours': [
            {'hour': 8, 'average_vehicles': random.randint(70, 100)},
            {'hour': 17, 'average_vehicles': random.randint(70, 100)},
            {'hour': 12, 'average_vehicles': random.randint(50, 80)}
        ],
        'congestion_level': 'High',
        'emergency_impact': {
            'total_emergency_routes': random.randint(1, 5),
            'affected_areas': ['Main Street', 'Downtown', 'Hospital Zone']
        },
        'predictions': {
            'next_hour': random.randint(40, 80),
            'predicted_congestion': 'Moderate'
        }
    }
    return JsonResponse(data)

def api_historical_traffic(request):
    """API endpoint for historical traffic data used in comparisons"""
    # Get requested period (default to 7 days)
    days = int(request.GET.get('days', 7))
    
    # Generate timestamps for the current period and previous period
    now = timezone.now()
    
    # Generate mock data for current period (last N days)
    current_period = {
        'labels': [],
        'northbound': [],
        'southbound': [],
        'total': []
    }
    
    # Generate mock data for previous period (N days before the current period)
    previous_period = {
        'labels': [],
        'northbound': [],
        'southbound': [],
        'total': []
    }
    
    # Generate 24 data points (hourly averages)
    for hour in range(24):
        # Generate time label (e.g., "08:00")
        time_label = f"{hour:02d}:00"
        
        # Current period data
        northbound_current = random.randint(40, 100)
        southbound_current = random.randint(30, 90)
        total_current = northbound_current + southbound_current
        
        current_period['labels'].append(time_label)
        current_period['northbound'].append(northbound_current)
        current_period['southbound'].append(southbound_current)
        current_period['total'].append(total_current)
        
        # Previous period data (70-130% of current values for realistic comparison)
        variation_factor = 0.7 + random.random() * 0.6
        
        northbound_previous = int(northbound_current * variation_factor)
        southbound_previous = int(southbound_current * variation_factor)
        total_previous = northbound_previous + southbound_previous
        
        previous_period['labels'].append(time_label)
        previous_period['northbound'].append(northbound_previous)
        previous_period['southbound'].append(southbound_previous)
        previous_period['total'].append(total_previous)
    
    # Calculate analysis metrics
    analysis = {
        'averageTraffic': {
            'current': sum(current_period['total']) / len(current_period['total']),
            'previous': sum(previous_period['total']) / len(previous_period['total']),
        },
        'peakTime': {
            'current': current_period['labels'][current_period['total'].index(max(current_period['total']))],
            'previous': previous_period['labels'][previous_period['total'].index(max(previous_period['total']))],
        },
        'totalVolume': {
            'current': sum(current_period['total']),
            'previous': sum(previous_period['total']),
        },
        'direction': {
            'current': {
                'northbound': sum(current_period['northbound']),
                'southbound': sum(current_period['southbound']),
            },
            'previous': {
                'northbound': sum(previous_period['northbound']),
                'southbound': sum(previous_period['southbound']),
            }
        }
    }
    
    # Calculate percentages and changes
    analysis['averageTraffic']['change'] = ((analysis['averageTraffic']['current'] - analysis['averageTraffic']['previous']) / 
                                           analysis['averageTraffic']['previous'] * 100)
    
    analysis['totalVolume']['change'] = ((analysis['totalVolume']['current'] - analysis['totalVolume']['previous']) / 
                                         analysis['totalVolume']['previous'] * 100)
    
    current_nb_percent = (analysis['direction']['current']['northbound'] / 
                          (analysis['direction']['current']['northbound'] + analysis['direction']['current']['southbound']) * 100)
    
    previous_nb_percent = (analysis['direction']['previous']['northbound'] / 
                           (analysis['direction']['previous']['northbound'] + analysis['direction']['previous']['southbound']) * 100)
    
    analysis['direction']['currentNorthbound'] = f"{current_nb_percent:.1f}%"
    analysis['direction']['previousNorthbound'] = f"{previous_nb_percent:.1f}%"
    analysis['direction']['change'] = current_nb_percent - previous_nb_percent
    
    # Determine trends
    analysis['averageTraffic']['trend'] = 'increase' if analysis['averageTraffic']['change'] > 0 else 'decrease'
    analysis['totalVolume']['trend'] = 'increase' if analysis['totalVolume']['change'] > 0 else 'decrease'
    analysis['peakTime']['shifted'] = analysis['peakTime']['current'] != analysis['peakTime']['previous']
    analysis['direction']['trend'] = 'more northbound' if analysis['direction']['change'] > 0 else 'more southbound'
    
    # Format numbers for display
    analysis['averageTraffic']['current'] = f"{analysis['averageTraffic']['current']:.1f}"
    analysis['averageTraffic']['previous'] = f"{analysis['averageTraffic']['previous']:.1f}"
    analysis['averageTraffic']['change'] = f"{analysis['averageTraffic']['change']:.1f}"
    
    analysis['totalVolume']['change'] = f"{analysis['totalVolume']['change']:.1f}"
    analysis['direction']['change'] = f"{analysis['direction']['change']:.1f}"
    
    # Compile the response
    response_data = {
        'current': current_period,
        'previous': previous_period,
        'analysis': analysis,
        'period': f"{days} days",
        'generated_at': now.isoformat()
    }
    
    return JsonResponse(response_data)

def generate_dummy_data(request):
    """Generate random traffic data for demonstration"""
    # This would normally interact with the database
    # But for this example, we'll just return a success message
    return JsonResponse({
        'success': True,
        'message': f'Generated traffic data points successfully!',
        'count': random.randint(300, 500)
    })

# Traffic data API endpoint
def traffic_data_api(request, camera_id):
    """API endpoint to provide traffic data for a specific camera."""
    # In a real application, this would fetch data from a database or real-time source
    # For now, we'll generate realistic-looking data
    
    # Generate random vehicle count based on camera location
    vehicle_counts = {
        'main': random.randint(20, 60),
        'north': random.randint(10, 30),
        'south': random.randint(15, 45),
        'east': random.randint(5, 25),
        'west': random.randint(18, 50),
    }
    
    # Generate average speed based on camera location
    avg_speeds = {
        'main': random.randint(25, 45),
        'north': random.randint(30, 55),
        'south': random.randint(25, 50),
        'east': random.randint(35, 60),
        'west': random.randint(20, 40),
    }
    
    # Generate flow rate based on vehicle count
    flow_rate = vehicle_counts.get(camera_id, 25)
    
    # Generate random incidents
    incident_count = 1 if random.random() < 0.2 else 0  # 20% chance of an incident
    incidents = []
    
    if incident_count > 0:
        incident_types = ['Congestion', 'Accident', 'Stalled Vehicle', 'Road Work']
        incidents.append({
            'type': random.choice(incident_types),
            'location': f'{camera_id.capitalize()} area',
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'severity': random.choice(['Low', 'Medium', 'High']),
        })
    
    # Generate detection boxes for AI detection
    detection_count = random.randint(2, 6)
    detections = []
    
    vehicle_classes = ['Car', 'Truck', 'Bike', 'Bus', 'Van']
    colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff']
    
    for i in range(detection_count):
        detections.append({
            'top': random.randint(20, 70),
            'left': random.randint(10, 80),
            'width': random.randint(30, 60),
            'height': random.randint(15, 30),
            'class': random.choice(vehicle_classes),
            'confidence': random.randint(85, 99),
            'color': random.choice(colors),
        })
    
    # Build response data
    data = {
        'camera_id': camera_id,
        'timestamp': datetime.now().strftime('%H:%M:%S'),
        'vehicle_count': vehicle_counts.get(camera_id, 0),
        'avg_speed': avg_speeds.get(camera_id, 0),
        'flow_rate': flow_rate,
        'incidents': incidents,
        'detections': detections,
        'status': 'online'
    }
    
    # Add a slight delay to simulate network latency (for testing)
    # import time
    # time.sleep(0.5)
    
    return JsonResponse(data)

# Traffic flow analytics API endpoint
def traffic_flow_api(request):
    """API endpoint to provide traffic flow analytics data."""
    # Get minutes parameter with default of 30
    minutes = int(request.GET.get('minutes', 30))
    
    # Generate historical data (last N minutes)
    historical_data = []
    
    # Create more realistic traffic patterns
    now = timezone.now()
    hour = now.hour
    
    for i in range(minutes):
        # Base traffic volume by time of day
        if hour >= 7 and hour <= 9:  # Morning rush
            base = random.randint(45, 75)
        elif hour >= 16 and hour <= 18:  # Evening rush
            base = random.randint(50, 80)
        elif hour >= 10 and hour <= 15:  # Midday
            base = random.randint(30, 50)
        elif hour >= 19 and hour <= 22:  # Evening
            base = random.randint(20, 40)
        else:  # Late night/early morning
            base = random.randint(5, 25)
            
        # Add some randomness
        variation = random.randint(-10, 10)
        traffic_volume = max(5, base + variation)
        historical_data.append(traffic_volume)
        
        # Move time backward for next point
        minute_back = (now - timedelta(minutes=i+1)).hour
        if minute_back != hour:
            hour = minute_back
    
    # Reverse to get chronological order
    historical_data.reverse()
    
    # Generate predicted data (next 15 minutes)
    predicted_data = []
    last_value = historical_data[-1]
    future_hour = now.hour
    
    for i in range(15):
        # Check if we're crossing into a new hour
        future_hour = (now + timedelta(minutes=i+1)).hour
        
        # Adjust base value for time of day changes
        if future_hour >= 7 and future_hour <= 9:  # Morning rush
            trend_factor = 1.05  # Increasing trend
        elif future_hour >= 16 and future_hour <= 18:  # Evening rush
            trend_factor = 1.08  # Stronger increasing trend
        elif future_hour >= 10 and future_hour <= 15:  # Midday
            trend_factor = 0.98  # Slightly decreasing
        elif future_hour >= 19 and future_hour <= 22:  # Evening
            trend_factor = 0.95  # Decreasing
        else:  # Late night/early morning
            trend_factor = 0.90  # Strongly decreasing
            
        # Apply trend and random variation
        variation = random.randint(-8, 8)
        next_value = max(5, min(100, int(last_value * trend_factor) + variation))
        predicted_data.append(next_value)
        last_value = next_value
    
    # Calculate average traffic
    average_traffic = round(sum(historical_data) / len(historical_data))
    
    # Determine peak time
    peak_index = historical_data.index(max(historical_data))
    peak_time = now - timedelta(minutes=(minutes - peak_index))
    
    # Calculate trend percentage (comparing last 5 minutes to previous 5 minutes)
    recent_avg = sum(historical_data[-5:]) / 5
    previous_avg = sum(historical_data[-10:-5]) / 5
    if previous_avg > 0:
        trend_percentage = round(((recent_avg - previous_avg) / previous_avg) * 100)
    else:
        trend_percentage = 0
    
    # Determine congestion level
    congestion_level = "Low"
    if average_traffic >= 70:
        congestion_level = "High"
    elif average_traffic >= 40:
        congestion_level = "Moderate"
    
    # Calculate direction distribution
    northbound = random.randint(30, 70)
    southbound = 100 - northbound  # Ensure they sum to 100%
    
    # Build response data
    data = {
        'historical_data': historical_data,
        'predicted_data': predicted_data,
        'average_traffic': average_traffic,
        'peak_time': peak_time.strftime('%H:%M'),
        'total_vehicles': sum(historical_data),
        'trend_percentage': trend_percentage,
        'congestion_level': congestion_level,
        'directions': {
            'northbound': northbound,
            'southbound': southbound
        }
    }
    
    return JsonResponse(data)

# Traffic report API endpoint
def traffic_report_api(request, period):
    """API endpoint to provide comprehensive traffic report data for a specific period."""
    # In a real application, this would fetch data from a database
    # For now, we'll generate realistic sample data
    
    time_labels = []
    traffic_data = []
    previous_traffic_data = []
    
    # Generate appropriate time labels and data based on period
    if period == 'daily':
        # For daily report, use hourly data points (24 hours)
        time_labels = [f"{hour}:00" for hour in range(24)]
        traffic_data = [random.randint(20, 80) for _ in range(24)]
        previous_traffic_data = [round(val * (0.7 + random.random() * 0.6)) for val in traffic_data]
        
        # Adjust for typical daily patterns
        # Morning peak (7-9 AM)
        for i in range(7, 10):
            traffic_data[i] = random.randint(60, 100)
        
        # Evening peak (4-6 PM)
        for i in range(16, 19):
            traffic_data[i] = random.randint(70, 110)
        
        # Late night/early morning low (1-5 AM)
        for i in range(1, 5):
            traffic_data[i] = random.randint(5, 20)
    
    elif period == 'weekly':
        # For weekly report, use daily data points (7 days)
        time_labels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        traffic_data = [random.randint(400, 800) for _ in range(7)]
        previous_traffic_data = [round(val * (0.7 + random.random() * 0.6)) for val in traffic_data]
        
        # Adjust for typical weekly patterns
        # Weekday higher traffic
        for i in range(0, 5):
            traffic_data[i] = random.randint(600, 900)
        
        # Weekend lower traffic
        for i in range(5, 7):
            traffic_data[i] = random.randint(300, 600)
    
    elif period == 'monthly':
        # For monthly report, use daily data points (30 days)
        time_labels = [f"Day {i+1}" for i in range(30)]
        traffic_data = [random.randint(500, 900) for _ in range(30)]
        previous_traffic_data = [round(val * (0.7 + random.random() * 0.6)) for val in traffic_data]
        
        # Adjust for weekends (lower traffic)
        for i in range(30):
            if i % 7 == 5 or i % 7 == 6:  # Saturday or Sunday
                traffic_data[i] = random.randint(300, 600)
    
    else:
        # Default to daily
        time_labels = [f"{hour}:00" for hour in range(24)]
        traffic_data = [random.randint(20, 80) for _ in range(24)]
        previous_traffic_data = [round(val * (0.7 + random.random() * 0.6)) for val in traffic_data]
    
    # Calculate total volume
    total_volume = sum(traffic_data)
    prev_total_volume = sum(previous_traffic_data)
    
    # Calculate average flow
    avg_flow = round(total_volume / len(traffic_data))
    prev_avg_flow = round(prev_total_volume / len(previous_traffic_data))
    
    # Calculate trend percentages
    volume_trend = round(((total_volume - prev_total_volume) / prev_total_volume) * 100)
    flow_trend = round(((avg_flow - prev_avg_flow) / prev_avg_flow) * 100)
    
    # Determine peak hours/day
    peak_index = traffic_data.index(max(traffic_data))
    peak_hours = time_labels[peak_index]
    
    if period == 'daily':
        # For daily, include the next hour to create a time range
        next_hour_index = (peak_index + 1) % 24
        peak_hours = f"{time_labels[peak_index]} - {time_labels[next_hour_index]}"
    
    # Generate incidents based on period
    total_incidents = 0
    incidents = []
    
    # Adjust incident count based on period
    if period == 'daily':
        accident_count = random.randint(1, 5)
        congestion_count = random.randint(5, 15)
        signal_malfunction_count = random.randint(0, 3)
    elif period == 'weekly':
        accident_count = random.randint(3, 10)
        congestion_count = random.randint(10, 30)
        signal_malfunction_count = random.randint(1, 7)
    else:  # monthly
        accident_count = random.randint(10, 25)
        congestion_count = random.randint(25, 60)
        signal_malfunction_count = random.randint(3, 12)
    
    total_incidents = accident_count + congestion_count + signal_malfunction_count
    
    # Generate incident details
    incidents = [
        {
            'type': 'Accident',
            'count': accident_count,
            'common_location': 'Main Intersection',
            'avg_response_time': round(random.uniform(8, 15), 1),
            'resolution_rate': random.randint(80, 100)
        },
        {
            'type': 'Congestion',
            'count': congestion_count,
            'common_location': 'Northbound Highway',
            'avg_response_time': round(random.uniform(3, 8), 1),
            'resolution_rate': random.randint(70, 95)
        },
        {
            'type': 'Signal Malfunction',
            'count': signal_malfunction_count,
            'common_location': 'East-West Intersection',
            'avg_response_time': round(random.uniform(5, 12), 1),
            'resolution_rate': random.randint(90, 100)
        }
    ]
    
    # Traffic direction distribution
    northbound = random.randint(20, 40)
    southbound = random.randint(20, 40)
    eastbound = random.randint(10, 30)
    westbound = random.randint(10, 30)
    
    # Normalize to sum to 100%
    total = northbound + southbound + eastbound + westbound
    northbound = round((northbound / total) * 100)
    southbound = round((southbound / total) * 100)
    eastbound = round((eastbound / total) * 100)
    westbound = 100 - northbound - southbound - eastbound  # Ensure they sum to 100
    
    # Compile response data
    data = {
        'period': period,
        'time_labels': time_labels,
        'traffic_data': traffic_data,
        'previous_traffic_data': previous_traffic_data,
        'total_volume': total_volume,
        'average_flow': avg_flow,
        'peak_hours': peak_hours,
        'total_incidents': total_incidents,
        'volume_trend': volume_trend,
        'flow_trend': flow_trend,
        'direction_distribution': {
            'northbound': northbound,
            'southbound': southbound,
            'eastbound': eastbound,
            'westbound': westbound
        },
        'incidents': incidents,
        'generated_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }
    
    return JsonResponse(data)
#