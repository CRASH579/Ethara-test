from django.db import models

# Create your models here.
class Employee(models.Model): 
    empId = models.PositiveIntegerField(unique=True)
    fullName = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    department = models.CharField(max_length=50)
    createdAt = models.DateTimeField(auto_now_add=True)

    def __str__(self):  
        return self.fullName