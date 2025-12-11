from django.contrib import admin
from django.shortcuts import render, redirect
from django.contrib.admin.views.decorators import staff_member_required
from django.urls import path
from django.contrib import messages
from django.contrib.auth.forms import UserCreationForm
from django import forms
from .models import User


class EmployeeCreationForm(forms.ModelForm):
    """Formulário simplificado para criação de funcionários"""
    password1 = forms.CharField(
        label="Senha",
        widget=forms.PasswordInput(attrs={'class': 'form-control'}),
        help_text="Mínimo 6 caracteres"
    )
    password2 = forms.CharField(
        label="Confirme a senha", 
        widget=forms.PasswordInput(attrs={'class': 'form-control'})
    )
    
    class Meta:
        model = User
        fields = ('username', 'email', 'first_name', 'last_name', 'telefone', 'funcao')
        widgets = {
            'username': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Nome de usuário único'}),
            'email': forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'email@exemplo.com'}),
            'first_name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Nome'}),
            'last_name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Sobrenome'}),
            'telefone': forms.TextInput(attrs={'class': 'form-control', 'placeholder': '(11) 99999-9999'}),
            'funcao': forms.Select(attrs={'class': 'form-control'})
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['funcao'].initial = 'employee'
        self.fields['funcao'].choices = [('employee', 'Funcionário'), ('admin', 'Administrador')]
        
        # Adiciona classes CSS
        for field_name, field in self.fields.items():
            field.widget.attrs.update({'class': 'form-control'})
    
    def clean_password2(self):
        password1 = self.cleaned_data.get("password1")
        password2 = self.cleaned_data.get("password2")
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError("As senhas não coincidem.")
        return password2
    
    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password1"])
        user.is_staff = True  # Funcionários podem acessar admin
        user.is_active = True
        if commit:
            user.save()
        return user


@staff_member_required
def cadastrar_funcionario_view(request):
    """View personalizada para cadastro rápido de funcionários"""
    if request.method == 'POST':
        form = EmployeeCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            
            # Configura permissões de funcionário
            from django.contrib.auth.models import Group
            funcionarios_group, created = Group.objects.get_or_create(name='Funcionários')
            user.groups.add(funcionarios_group)
            
            messages.success(
                request, 
                f'Funcionário {user.get_full_name()} cadastrado com sucesso! '
                f'Username: {user.username}'
            )
            return redirect('admin:core_user_changelist')
    else:
        form = EmployeeCreationForm()
    
    context = {
        'form': form,
        'title': 'Cadastrar Novo Funcionário',
        'opts': User._meta,
        'has_change_permission': True,
    }
    
    return render(request, 'admin/employee_form.html', context)


# Registra URLs customizadas no admin
def get_admin_urls():
    from django.urls import path
    return [
        path('cadastrar-funcionario/', cadastrar_funcionario_view, name='cadastrar_funcionario'),
    ]

# Adiciona as URLs ao site admin
admin.site.get_urls = lambda: get_admin_urls() + admin.site.get_urls()