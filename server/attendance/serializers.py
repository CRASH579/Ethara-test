from rest_framework import serializers
from .models import Attendance
from employees.serializers import EmployeeSerializer

class AttendanceSerializer(serializers.ModelSerializer):
    employee = EmployeeSerializer(read_only=True)
    employee_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Attendance
        fields = ("id", "employee", "employee_id", "date", "status", "created_at")
        read_only_fields = ("created_at",)

    def create(self, validated_data):
        employee_id = validated_data.pop('employee_id')
        attendance = Attendance.objects.create(
            employee_id=employee_id,
            **validated_data
        )
        return attendance

    def validate(self, data):
        employee_id = data.get('employee_id')
        date = data.get('date')
        
        if Attendance.objects.filter(
            employee_id=employee_id,
            date=date
        ).exists():
            raise serializers.ValidationError(
                "Attendance already marked for this employee on this date"
            )
        return data
