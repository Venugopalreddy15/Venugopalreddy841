"""medical URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from django.views.generic import TemplateView,CreateView,ListView,DeleteView,UpdateView
from app.models import Patient,doctorModel,EmployeeModel
from app import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('admin1/',TemplateView.as_view(template_name="index.html"),name = "main"),
    path('adminlogin/',views.adminlogin, name = "adminlogin"),
    path('home/', views.home, name = "home"),
    path('regdoc/',views.RegisterDoctor.as_view(), name='regdoc'),
    path('viewdoc/',views.ShowDoctors.as_view(), name='viewdoc'),

    path('regemp/', views.RegisterEmployee, name='regemp'),
    path('saveemp/', views.SaveEmployee, name='saveemp'),
    path('viewemp/', views.ShowEmployee, name='viewemp'),
    # path('patient_reg/',views.patient_reg,name="patient_reg"),
    path('patient_reg/',CreateView.as_view(model=Patient,fields="__all__",template_name="patient_reg.html",success_url='/home/'),name="patient_reg"),
    path('logout/',views.logout, name = "logout"),

    path('view_patients/',ListView.as_view(model=Patient,template_name="patient_list.html"),name="view_patients"),

    # DOCTOR LOGIN PATTERNS
    # path('doctor/',TemplateView.as_view(template_name="DOCTOR_LOGIN.html"),name='doctor'),
    path('doctor/',views.doctorlogin_function,name='doctor'),

    path('doctor_login/',views.doctor_login,name='doctor_login'),
    path('delete_patient<int:pk>/',UpdateView.as_view(model=Patient,fields=["status"],template_name="delete_patient.html",success_url='/doctor_login/'),name="delete_patient"),
    path('doctor_logout/',views.doctor_logout,name="doctor_logout"),


    # USER PATTERNS

    path('home_user/', views.home_user, name = "home_user"),
    path('',TemplateView.as_view(template_name="welcome_user.html"),name="user_main"),
    path('user/',TemplateView.as_view(template_name="welcome_user.html"),name="user"),
    path('viewdoc_user/',ListView.as_view(model=doctorModel,template_name="viewdoctors_user.html"),name="viewdoc_user"),
    path('viewemp_user/',ListView.as_view(model=EmployeeModel,template_name="viewemployee_user.html"),name="viewemp_user"),
    path('patient_reg_user/',CreateView.as_view(model=Patient,fields="__all__",template_name="patient_reg_user.html",success_url='/user/'),name="patient_reg_user")
]
