from django.db import models

class doctorModel(models.Model):
    doc_id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=30)
    specialization = models.CharField(max_length=30)
    contact = models.IntegerField()
    password = models.CharField(max_length=10)

    def __str__(self):
        return self.specialization

class EmployeeModel(models.Model):
    emp_id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=30)
    designation = models.CharField(max_length=30)
    contact = models.IntegerField()
    password = models.CharField(max_length=10)

class Patient(models.Model):
    patient_id = models.IntegerField(primary_key=True)
    patient_name = models.CharField(max_length=30)
    disease = models.CharField(max_length=30)
    patient_contact_no = models.IntegerField()
    doc_id = models.ManyToManyField(doctorModel)
    status = models.CharField(max_length=10,default=False)
