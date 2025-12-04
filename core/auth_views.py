# core/auth_views.py
from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate, logout
from django.contrib import messages
from django.views.decorators.csrf import csrf_protect
from django.views.decorators.cache import never_cache
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.utils.http import url_has_allowed_host_and_scheme
import json
import re

from .models import User, Notification
from .forms import RegistrationForm


@csrf_protect
def custom_logout_view(request):
    """
    View customizada de logout que redireciona para a landing page
    Aceita tanto POST quanto GET para compatibilidade
    """
    if request.user.is_authenticated:
        user_name = request.user.first_name
        logout(request)
        
        if user_name:
            messages.success(request, f'Até logo, {user_name}! Você foi desconectado com sucesso.')
        else:
            messages.success(request, 'Você foi desconectado com sucesso.')
    
    return redirect('/')  # Redireciona para a landing page


@csrf_protect
@never_cache
def register_view(request):
    """
    View melhorada para registro de usuários usando Django Forms
    """
    if request.user.is_authenticated:
        return redirect('/dashboard/')
    
    if request.method == 'POST':
        form = RegistrationForm(request.POST)
        
        if form.is_valid():
            try:
                # Criar usuário
                user = form.save()
                
                # Salvar IP se disponível
                if hasattr(request, 'user_ip'):
                    user.last_login_ip = request.user_ip
                    user.save(update_fields=['last_login_ip'])
                
                # Login automático
                login(request, user)
                
                # Criar notificação de boas-vindas
                create_welcome_notification(user)
                
                messages.success(request, f'Bem-vindo(a), {user.first_name}! Sua conta foi criada com sucesso.')
                return redirect('/dashboard/')
                
            except Exception as e:
                messages.error(request, f'Erro interno: {str(e)}')
                return render(request, 'auth/register.html', {'form': form})
        else:
            # Formulário inválido - mostrar erros
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f'{form[field].label}: {error}')
    else:
        form = RegistrationForm()
    
    return render(request, 'auth/register.html', {'form': form})


def handle_register_post(request):
    """
    Processa o registro do usuário com validações completas
    """
    try:
        # Obter dados do formulário
        data = {
            'first_name': request.POST.get('first_name', '').strip(),
            'last_name': request.POST.get('last_name', '').strip(),
            'email': request.POST.get('email', '').strip().lower(),
            'phone': request.POST.get('phone', '').strip(),
            'password': request.POST.get('password', ''),
            'password_confirm': request.POST.get('password_confirm', ''),
            'birth_date': request.POST.get('birth_date', ''),
            'address': request.POST.get('address', '').strip(),
            'accept_terms': request.POST.get('accept_terms') == 'on',
            'accept_marketing': request.POST.get('accept_marketing') == 'on',
        }
        
        # Validações
        errors = validate_registration_data(data)
        
        if errors:
            for error in errors:
                messages.error(request, error)
            return render(request, 'auth/register.html', {'form_data': data})
        
        # Criar usuário
        user = create_user_from_data(data)
        
        # Login automático
        login(request, user)
        
        # Criar notificação de boas-vindas
        create_welcome_notification(user)
        
        messages.success(request, f'Bem-vindo(a), {user.first_name}! Sua conta foi criada com sucesso.')
        return redirect('/dashboard/')
        
    except Exception as e:
        messages.error(request, f'Erro interno: {str(e)}')
        return render(request, 'auth/register.html', {'form_data': request.POST})


def validate_registration_data(data):
    """
    Valida todos os dados de registro
    """
    errors = []
    
    # Campos obrigatórios
    required_fields = {
        'first_name': 'Nome é obrigatório',
        'last_name': 'Sobrenome é obrigatório',
        'email': 'E-mail é obrigatório',
        'password': 'Senha é obrigatória',
        'password_confirm': 'Confirmação de senha é obrigatória',
    }
    
    for field, message in required_fields.items():
        if not data.get(field):
            errors.append(message)
    
    # Validar e-mail
    if data.get('email'):
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_regex, data['email']):
            errors.append('E-mail inválido')
        elif User.objects.filter(email=data['email']).exists():
            errors.append('Este e-mail já está cadastrado')
    
    # Validar telefone
    if data.get('phone'):
        phone_regex = r'^\(\d{2}\)\s\d{4,5}-\d{4}$|^\d{10,11}$'
        if not re.match(phone_regex, data['phone'].replace(' ', '')):
            errors.append('Telefone inválido. Use o formato (11) 99999-9999')
    
    # Validar senhas
    if data.get('password') and data.get('password_confirm'):
        if data['password'] != data['password_confirm']:
            errors.append('As senhas não coincidem')
        
        try:
            validate_password(data['password'])
        except ValidationError as e:
            errors.extend(e.messages)
    
    # Validar termos
    if not data.get('accept_terms'):
        errors.append('Você deve aceitar os termos de uso')
    
    return errors


def create_user_from_data(data):
    """
    Cria usuário com os dados validados
    """
    # Gerar username único baseado no email
    username = generate_unique_username(data['email'])
    
    user = User.objects.create_user(
        username=username,
        email=data['email'],
        password=data['password'],
        first_name=data['first_name'],
        last_name=data['last_name'],
        phone=data['phone'] or None,
        address=data['address'] or None,
        funcao='client',
        accept_marketing=data.get('accept_marketing', False)
    )
    
    # Adicionar data de nascimento se fornecida
    if data.get('birth_date'):
        try:
            from datetime import datetime
            user.birth_date = datetime.strptime(data['birth_date'], '%Y-%m-%d').date()
            user.save()
        except:
            pass  # Ignora erro de data inválida
    
    return user


def generate_unique_username(email):
    """
    Gera um username único baseado no email
    """
    base_username = email.split('@')[0]
    username = base_username
    counter = 1
    
    while User.objects.filter(username=username).exists():
        username = f"{base_username}{counter}"
        counter += 1
    
    return username


def create_welcome_notification(user):
    """
    Cria notificação de boas-vindas
    """
    Notification.objects.create(
        user=user,
        title="Bem-vindo ao AutoV7!",
        message=f"Olá {user.first_name}! Sua conta foi criada com sucesso. Agora você pode agendar serviços, gerenciar seus veículos e muito mais.",
        type='system'
    )


@require_http_methods(["POST"])
def check_email_availability(request):
    """
    Endpoint AJAX para verificar disponibilidade do email
    """
    try:
        data = json.loads(request.body)
        email = data.get('email', '').strip().lower()
        
        if not email:
            return JsonResponse({'available': False, 'message': 'E-mail é obrigatório'})
        
        # Validar formato
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_regex, email):
            return JsonResponse({'available': False, 'message': 'E-mail inválido'})
        
        # Verificar disponibilidade
        exists = User.objects.filter(email=email).exists()
        
        return JsonResponse({
            'available': not exists,
            'message': 'E-mail já cadastrado' if exists else 'E-mail disponível'
        })
        
    except Exception as e:
        return JsonResponse({'available': False, 'message': 'Erro interno'})


@require_http_methods(["POST"])
def validate_password_strength(request):
    """
    Endpoint AJAX para validar força da senha
    """
    try:
        data = json.loads(request.body)
        password = data.get('password', '')
        
        if not password:
            return JsonResponse({'valid': False, 'message': 'Senha é obrigatória'})
        
        try:
            validate_password(password)
            
            # Calcular força da senha
            strength = calculate_password_strength(password)
            
            return JsonResponse({
                'valid': True,
                'strength': strength,
                'message': 'Senha válida'
            })
            
        except ValidationError as e:
            return JsonResponse({
                'valid': False,
                'message': '; '.join(e.messages)
            })
        
    except Exception as e:
        return JsonResponse({'valid': False, 'message': 'Erro interno'})


def calculate_password_strength(password):
    """
    Calcula a força da senha (0-100)
    """
    score = 0
    
    # Comprimento
    if len(password) >= 8:
        score += 25
    if len(password) >= 12:
        score += 15
    
    # Contém minúsculas
    if re.search(r'[a-z]', password):
        score += 15
    
    # Contém maiúsculas
    if re.search(r'[A-Z]', password):
        score += 15
    
    # Contém números
    if re.search(r'\d', password):
        score += 15
    
    # Contém símbolos
    if re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        score += 15
    
    return min(score, 100)


def _get_safe_next_url(request):
    """Return a safe next URL if provided via GET or POST."""
    next_param = request.POST.get('next') or request.GET.get('next')
    if next_param and url_has_allowed_host_and_scheme(
        next_param,
        allowed_hosts={request.get_host()},
        require_https=request.is_secure()
    ):
        return next_param
    return None


@csrf_protect
@never_cache
def custom_login_view(request):
    """
    View customizada de login que redireciona baseado na função do usuário
    """
    safe_next = _get_safe_next_url(request)
    default_admin_redirect = '/admin-panel/'
    default_client_redirect = '/dashboard/'
    if request.user.is_authenticated:
        # Se já está autenticado, prioriza o next seguro e depois a função
        if safe_next:
            return redirect(safe_next)
        if request.user.funcao == 'admin':
            return redirect(default_admin_redirect)
        return redirect(default_client_redirect)
    
    if request.method == 'POST':
        email = request.POST.get('username', '').strip()  # Django usa 'username' por padrão
        password = request.POST.get('password', '')
        
        # Autenticar
        user = authenticate(request, username=email, password=password)
        
        if user is not None:
            login(request, user)
            
            # Redirecionar priorizando "next" e depois a função
            redirect_target = safe_next
            if not redirect_target:
                if user.funcao == 'admin':
                    redirect_target = default_admin_redirect
                    messages.success(request, f'Bem-vindo ao painel administrativo, {user.first_name}!')
                else:
                    redirect_target = default_client_redirect
                    messages.success(request, f'Bem-vindo, {user.first_name}!')
            else:
                messages.success(request, f'Bem-vindo, {user.first_name}!')
            return redirect(redirect_target)
        else:
            messages.error(request, 'E-mail ou senha incorretos.')

    context = {
        'next': safe_next or request.GET.get('next', '')
    }
    return render(request, 'auth/login.html', context)
