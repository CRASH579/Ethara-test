from django.shortcuts import render

# Create your views here.
from rest_framework.viewsets import ModelViewSet
from .models import Attendance
from .serializers import AttendanceSerializer

class AttendanceViewSet(ModelViewSet):
    queryset = Attendance.objects.select_related("employee")
    serializer_class = AttendanceSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        employee_id = self.request.query_params.get("employee")
        date = self.request.query_params.get("date")
        status_filter = self.request.query_params.get("status")
        department = self.request.query_params.get("department")
        date_from = self.request.query_params.get("date_from")
        date_to = self.request.query_params.get("date_to")

        if employee_id:
            qs = qs.filter(employee=employee_id)
        if date:
            qs = qs.filter(date=date)
        if status_filter:
            qs = qs.filter(status=status_filter)
        if date_from:
            qs = qs.filter(date__gte=date_from)
        if date_to:
            qs = qs.filter(date__lte=date_to)
        if department:
            qs = qs.filter(employee__department__icontains=department)

        return qs
