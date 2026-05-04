from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from .models import PasswordReset, UserProfile

# Change admin site title
admin.site.site_header = 'STMS Admin Portal'
admin.site.site_title = 'STMS Admin Portal'
admin.site.index_title = 'STMS Management'

# Register PasswordReset model
admin.site.register(PasswordReset)

# Define inline admin class for UserProfile
class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Profile'
    fk_name = 'user'

# Extend User admin to include profile
class CustomUserAdmin(UserAdmin):
    inlines = (UserProfileInline, )
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff')

# Re-register UserAdmin with our customizations
admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)


# Register your models here.
