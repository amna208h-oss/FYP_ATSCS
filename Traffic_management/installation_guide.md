# Installation Guide - Smart Traffic Management System

This guide will help you set up and run the Smart Traffic Management System on your local machine.

## Prerequisites

- Python 3.8 or higher
- Git (for cloning the repository)
- pip (Python package manager)

## Step 1: Clone the Repository

```bash
git clone <repository-url>
cd Traffic_management
```

## Step 2: Create and Activate a Virtual Environment (Recommended)

### For Windows:
```bash
python -m venv venv
venv\Scripts\activate
```

### For macOS and Linux:
```bash
python3 -m venv venv
source venv/bin/activate
```

## Step 3: Install Required Packages

Install all required dependencies:
```bash
pip install -r requirements.txt  /1
```

This will install all necessary packages including:
- Django 4.2.7
- Django REST Framework 3.14.0
- Channels 4.0.0
- Redis 5.0.1
- Other dependencies

## Step 4: Set Up the Database

Initialize the database with migrations:
```bash
python manage.py migrate
```

## Step 5: Create an Admin User (Optional)

Create a superuser to access the admin panel:
```bash
python manage.py createsuperuser
```

Follow the prompts to create your admin account.

## Step 6: Run the Development Server

Start the Django development server:
```bash
python manage.py runserver
```

The application will be available at: http://127.0.0.1:8000/

## Step 7: Access the Dashboard

Open your browser and navigate to:
- Dashboard: http://127.0.0.1:8000/
- Admin panel: http://127.0.0.1:8000/admin/ (use the superuser credentials)

## Common Issues and Troubleshooting

### Package Installation Problems
If you encounter issues installing packages, try updating pip:
```bash
pip install --upgrade pip
```

### Database Connection Errors
By default, the project uses SQLite which doesn't require additional setup. If you've configured a different database, ensure it's properly set up.

### WebSocket Connection Failures
If real-time updates aren't working:
1. Ensure Redis is installed and running (if using channels-redis)
2. Check that your browser supports WebSockets

## Additional Configuration (Optional)

### Email Configuration
To enable email functionality, update the email settings in `settings.py` with your SMTP server details.

### Custom Static Files
If you want to modify CSS, JavaScript, or other static files, they are located in the `static` directory.

 