from rest_framework import serializers
from .models import Employee
import re

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = "__all__"

    def validate_empId(self, value):
        if not value or value <= 0:
            raise serializers.ValidationError("Employee ID must be a positive number.")
        
        queryset = Employee.objects.filter(empId=value)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        
        if queryset.exists():
            raise serializers.ValidationError("An employee with this ID already exists.")
        
        return value

    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("Email is required.")
        
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, value):
            raise serializers.ValidationError("Invalid email format.")
        
        queryset = Employee.objects.filter(email=value)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        
        if queryset.exists():
            raise serializers.ValidationError("An employee with this email already exists.")
        
        return value

    def validate_fullName(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Full name is required.")
        
        return value.strip()

    def validate_department(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Department is required.")
        
        return value.strip()
