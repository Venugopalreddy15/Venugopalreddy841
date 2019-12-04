from django.contrib import messages
from django.shortcuts import render,redirect
from django.views.generic import CreateView, ListView
from .models import doctorModel,EmployeeModel,Patient

def adminlogin(request):
    username = request.POST.get('username')
    password = request.POST.get('password')

    if username == "admin" and password == "admin":
        return render(request,"welcome.html")
    else:
        return render(request,"index.html",{"mes":"Please Enter Valid Username or Password"})

def home(request):
    return render(request,"welcome.html")

class RegisterDoctor(CreateView):
    model = doctorModel
    fields = '__all__'
    template_name = "registerdoc.html"
    success_url = '/home/'

class ShowDoctors(ListView):
    model = doctorModel
    template_name = "viewdoctors.html"
    #queryset = doctorModel.objects.all()

def logout(request):
    return render(request,"index.html")


def RegisterEmployee(request):
    return render(request,"registeremp.html")


def SaveEmployee(request):
    empid = request.POST.get("empid")
    empname = request.POST.get("empname")
    empdesignation = request.POST.get("empdesignation")
    empcontact = request.POST.get("empcontact")
    emppassword = request.POST.get("emppassword")
    EmployeeModel(emp_id=empid,name=empname,designation=empdesignation,contact=empcontact,password=emppassword).save()
    return render(request,"welcome.html")


def ShowEmployee(request):
    qs = EmployeeModel.objects.all()
    return render(request,"viewemployee.html",{"data":qs})


# def patient_reg(request):
#     return None
def home_user(request):
    return render(request,"welcome_user.html")

# DOCTOR LOGIN

def doctorlogin_function(request):
    try:
        value = request.session["id"]
        valid = doctorModel.objects.get(doc_id=value)
        patient = Patient.objects.filter(doc_id=value)

    except :
        return render(request,"DOCTOR_LOGIN.html")
    else:
        return render(request, "view_doctor.html", {"data": valid, "patient": patient})

def doctor_login(request):
        try:
            value = request.session["id"]
            if value:
                valid = doctorModel.objects.get(doc_id=value)
                patient = Patient.objects.filter(doc_id=value)
                return render(request, "view_doctor.html", {"data": valid, "patient": patient})
            else:
                username = request.POST.get('username')
                password = request.POST.get('password')
        except KeyError:
            username = request.POST.get('username')
            password = request.POST.get('password')
        try:
            valid = doctorModel.objects.get(doc_id=username, password=password)
        except:
           messages.error(request, "please enter valid credentials")
           return redirect("doctor")
        else:
             patient = Patient.objects.filter(doc_id=username)
             request.session["id"] = username
             request.session.set_expiry(300)
             return render(request, "view_doctor.html", {"data": valid, "patient": patient})


# DOCTOR LOGOUT

def doctor_logout(request):
    try:
         del request.session["id"]
         return render(request,"DOCTOR_LOGIN.html")
    except KeyError:
        return render(request, "DOCTOR_LOGIN.html")

