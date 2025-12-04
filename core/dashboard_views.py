# core/dashboard_views.py
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Count, Sum
from django.utils import timezone
from datetime import datetime, timedelta, date
import json
import calendar

from vehicles.models import Vehicle
from services.models import Service, ServiceCategory
from appointments.models import Appointment
from inventory.models import Product


@login_required
def dashboard_home(request):
    """Dashboard principal do cliente"""
    user = request.user
    
    # Estatísticas do usuário
    user_vehicles = Vehicle.objects.filter(usuario=user).count()
    user_appointments = Appointment.objects.filter(usuario=user).count()
    completed_appointments = Appointment.objects.filter(usuario=user, situacao='completed').count()
    
    # Próximos agendamentos
    upcoming_appointments = Appointment.objects.filter(
        usuario=user,
        data_agendamento__gte=timezone.now().date()
    ).order_by('data_agendamento', 'horario_agendamento')[:3]
    
    # Últimos veículos
    recent_vehicles = Vehicle.objects.filter(usuario=user).order_by('-criado_em')[:3]
    
    # Dados do clima (simulado)
    weather_data = {
        'condition': 'Ensolarado',
        'temperature': '25°C',
        'description': 'Ótimo dia para lavagem! O sol ajudará na secagem.'
    }
    
    context = {
        'user_vehicles': user_vehicles,
        'user_appointments': user_appointments,
        'completed_appointments': completed_appointments,
        'upcoming_appointments': upcoming_appointments,
        'recent_vehicles': recent_vehicles,
        'weather_data': weather_data,
        'loyalty_points': user.pontos_fidelidade,
        'average_rating': user.avaliacao_media,
        'total_services': user.total_servicos,
    }
    
    return render(request, 'dashboard/home.html', context)


@login_required
def profile_page(request):
    """Página de perfil do usuário"""
    if request.method == 'POST':
        user = request.user
        
        # Atualizar informações básicas
        user.first_name = request.POST.get('first_name', user.first_name)
        user.last_name = request.POST.get('last_name', user.last_name)
        user.email = request.POST.get('email', user.email)
        user.telefone = request.POST.get('telefone', user.telefone)
        user.endereco = request.POST.get('endereco', user.endereco)
        
        # Upload de foto
        if 'foto_perfil' in request.FILES:
            user.foto_perfil = request.FILES['foto_perfil']
        
        user.save()
        messages.success(request, 'Perfil atualizado com sucesso!')
        return redirect('/dashboard/profile/')
    
    return render(request, 'dashboard/profile.html', {'user': request.user})


@login_required
def requests_page(request):
    """Página de solicitações de agendamento"""
    user = request.user
    
    # Buscar todos os agendamentos do usuário
    appointments = Appointment.objects.filter(usuario=user).select_related(
        'veiculo'
    ).prefetch_related('servicos_agendamento__servico').order_by('-criado_em')
    
    # Estatísticas do usuário
    stats = {
        'total': appointments.count(),
        'pending': appointments.filter(situacao='pending').count(),
        'confirmed': appointments.filter(situacao='confirmed').count(),
        'completed': appointments.filter(situacao='completed').count(),
        'cancelled': appointments.filter(situacao='cancelled').count(),
    }
    
    # Próximo agendamento
    next_appointment = appointments.filter(
        data_agendamento__gte=timezone.now().date(),
        situacao__in=['pending', 'confirmed']
    ).first()
    
    context = {
        'appointments': appointments,
        'stats': stats,
        'next_appointment': next_appointment,
    }
    
    return render(request, 'dashboard/profile.html', context)


# REMOVIDO: View de solicitações (requests_page) - Clientes não devem ter acesso
# Esta funcionalidade é exclusiva para administradores em /admin-panel/appointments/


@login_required
def change_password(request):
    """Alterar senha do usuário"""
    if request.method == 'POST':
        current_password = request.POST.get('current_password')
        new_password = request.POST.get('new_password')
        confirm_password = request.POST.get('confirm_password')
        
        user = request.user
        
        # Verificar senha atual
        if not user.check_password(current_password):
            messages.error(request, 'Senha atual incorreta.')
            return redirect('/dashboard/profile/')
        
        # Verificar se as senhas coincidem
        if new_password != confirm_password:
            messages.error(request, 'As senhas não coincidem.')
            return redirect('/dashboard/profile/')
        
        # Alterar senha
        user.set_password(new_password)
        user.save()
        
        messages.success(request, 'Senha alterada com sucesso!')
        return redirect('/dashboard/profile/')
    
    return redirect('/dashboard/profile/')


@login_required
def booking_page_old(request):
    """Página de agendamento multi-step"""
    if request.method == 'POST':
        return handle_booking_form(request)
    
    # Carregar dados para o formulário
    services = Service.objects.filter(ativo=True).select_related('categoria')
    categories = ServiceCategory.objects.filter(ativo=True)
    user_vehicles = Vehicle.objects.filter(usuario=request.user)
    
    # Gerar slots de horário para os próximos 30 dias
    available_dates = []
    today = timezone.now().date()
    
    # Calcular data final: exatamente 30 dias a partir de hoje
    end_date = today + timedelta(days=30)
    
    current_date = today
    while current_date <= end_date:
        # Pular apenas domingos (weekday 6)
        if current_date.weekday() != 6:  # Segunda a Sábado
            available_dates.append(current_date)
        current_date += timedelta(days=1)
    
    context = {
        'services': services,
        'categories': categories,
        'user_vehicles': user_vehicles,
        'available_dates': available_dates,
    }
    
    return render(request, 'dashboard/booking.html', context)


@login_required
@login_required
def booking_page(request):
    """Página de agendamento moderna com design aprimorado"""
    if request.method == 'POST':
        return handle_booking_form(request)
    
    # Carregar dados para o formulário
    services = Service.objects.filter(ativo=True).select_related('categoria')
    categories = ServiceCategory.objects.filter(ativo=True)
    user_vehicles = Vehicle.objects.filter(usuario=request.user)
    
    # Gerar slots de horário para o próximo mês
    available_dates = []
    today = timezone.now().date()
    
    # Calcular data final (um mês a frente)
    if today.month == 12:
        end_date = date(today.year + 1, 1, 31)
    else:
        try:
            end_date = date(today.year, today.month + 1, today.day)
        except ValueError:
            # Para casos onde o dia não existe no próximo mês (ex: 31 de março -> 30 de abril)
            end_date = date(today.year, today.month + 1, 28)
    
    current_date = today
    while current_date <= end_date:
        # Pular apenas domingos (weekday 6)
        if current_date.weekday() != 6:  # Segunda a Sábado
            available_dates.append(current_date)
        current_date += timedelta(days=1)
    
    context = {
        'services': services,
        'categories': categories,
        'user_vehicles': user_vehicles,
        'available_dates': available_dates,
    }
    
    return render(request, 'dashboard/booking.html', context)


@login_required
@require_http_methods(["GET"])
def get_calendar_availability(request):
    """API endpoint para obter disponibilidade do calendário"""
    try:
        from django.http import JsonResponse
        from appointments.models import Appointment, WorkingHours, Holiday
        from collections import defaultdict
        import calendar
        
        # Parâmetros da requisição
        year = int(request.GET.get('year', timezone.now().year))
        month = int(request.GET.get('month', timezone.now().month))
        
        # Calcular dias do mês (incluindo dias do mês anterior/próximo)
        cal = calendar.Calendar()
        month_days = []
        
        # Pegar calendário completo com dias vazios preenchidos
        month_calendar = cal.monthdayscalendar(year, month)
        
        for week in month_calendar:
            for day in week:
                if day == 0:
                    continue  # Pular dias vazios por enquanto
                else:
                    date_obj = date(year, month, day)
                    month_days.append(date_obj)
        
        # Adicionar dias do mês anterior e próximo para preencher o calendário
        if month_calendar[0][0] == 0:  # Primeira semana tem dias vazios
            # Adicionar dias do mês anterior
            if month == 1:
                prev_year, prev_month = year - 1, 12
            else:
                prev_year, prev_month = year, month - 1
            
            days_in_prev_month = calendar.monthrange(prev_year, prev_month)[1]
            empty_days = month_calendar[0].count(0)
            
            for i in range(empty_days):
                day_num = days_in_prev_month - (empty_days - 1 - i)
                prev_date = date(prev_year, prev_month, day_num)
                month_days.insert(i, prev_date)
        
        # Adicionar dias do próximo mês se necessário
        last_week = month_calendar[-1]
        if last_week[-1] == 0:  # Última semana tem dias vazios
            if month == 12:
                next_year, next_month = year + 1, 1
            else:
                next_year, next_month = year, month + 1
            
            empty_days = last_week.count(0)
            for i in range(empty_days):
                next_date = date(next_year, next_month, i + 1)
                month_days.append(next_date)
        
        # Obter agendamentos existentes
        start_date = date(year, month, 1)
        if month == 12:
            end_date = date(year + 1, 1, 1) - timedelta(days=1)
        else:
            end_date = date(year, month + 1, 1) - timedelta(days=1)
        
        appointments = Appointment.objects.filter(
            data_agendamento__range=[start_date, end_date],
            situacao__in=['pending', 'confirmed', 'in_progress']
        ).values('data_agendamento', 'horario_agendamento')
        
        # Contar agendamentos por data
        appointments_by_date = defaultdict(list)
        for apt in appointments:
            appointments_by_date[apt['data_agendamento']].append(apt['horario_agendamento'])
        
        # Verificar feriados
        holidays = Holiday.objects.filter(data__range=[start_date, end_date]).values_list('data', flat=True)
        
        # Obter horários de funcionamento
        working_hours = {}
        for wh in WorkingHours.objects.all():
            working_hours[wh.dia_semana] = {
                'aberto': wh.aberto,
                'inicio': wh.horario_inicio,
                'fim': wh.horario_fim
            }
        
        # Calcular disponibilidade para cada dia
        calendar_data = []
        today = timezone.now().date()
        # Período de agendamento: exatamente 30 dias a partir de hoje
        max_booking_date = today + timedelta(days=30)
        current_month_date = date(year, month, 1)
        
        for day_date in month_days:
            weekday = day_date.weekday()
            appointments_count = len(appointments_by_date.get(day_date, []))
            is_current_month = day_date.month == month and day_date.year == year
            is_beyond_booking_limit = day_date > max_booking_date
            
            # Determinar status do dia
            if day_date < today:
                status = 'past'
            elif not is_current_month:
                status = 'other-month'
            elif is_beyond_booking_limit:
                status = 'beyond-limit'  # Visível mas desabilitado (fora do período de 30 dias)
            elif day_date in holidays:
                status = 'holiday'
            elif weekday == 6:  # Apenas domingo é fechado
                status = 'unavailable'
            elif weekday not in working_hours or not working_hours[weekday]['aberto']:
                status = 'unavailable'
            elif appointments_count >= 8:  # Máximo 8 agendamentos por dia
                status = 'occupied'
            elif appointments_count >= 6:  # Mais de 75% ocupado
                status = 'limited'
            else:
                status = 'available'
            
            calendar_data.append({
                'date': day_date.strftime('%Y-%m-%d'),
                'day': day_date.day,
                'weekday': day_date.weekday(),
                'status': status,
                'appointments_count': appointments_count,
                'is_today': day_date == today,
                'is_weekend': weekday >= 5,
                'is_current_month': is_current_month,
                'beyond_booking_limit': is_beyond_booking_limit,
                'within_30_days': not is_beyond_booking_limit and day_date >= today
            })
        
        return JsonResponse({
            'success': True,
            'year': year,
            'month': month,
            'month_name': calendar.month_name[month],
            'days': calendar_data
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@login_required
@require_http_methods(["GET"])
def get_time_slots(request):
    """API endpoint para obter horários disponíveis de uma data específica"""
    try:
        from django.http import JsonResponse
        from appointments.models import Appointment
        from datetime import datetime, time as dt_time
        
        date_str = request.GET.get('date')
        if not date_str:
            return JsonResponse({'success': False, 'error': 'Data não fornecida'}, status=400)
        
        selected_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        weekday = selected_date.weekday()  # 0=segunda, 1=terça, ..., 6=domingo
        
        # Definir horários de funcionamento
        # Segunda a Sexta: 8h às 17:30h
        # Sábado: 8h às 13h
        # Domingo: Fechado
        
        if weekday == 6:  # Domingo
            return JsonResponse({
                'success': True,
                'slots': [],
                'message': 'Estabelecimento fechado aos domingos'
            })
        
        # Definir horários baseado no dia da semana
        if weekday == 5:  # Sábado
            start_time = dt_time(8, 0)   # 8:00
            end_time = dt_time(13, 0)    # 13:00
        else:  # Segunda a Sexta
            start_time = dt_time(8, 0)   # 8:00
            end_time = dt_time(17, 30)   # 17:30
        
        # Gerar horários possíveis (intervalos de 30 minutos)
        possible_times = []
        current_hour = start_time.hour
        current_minute = start_time.minute
        
        while True:
            current_time = dt_time(current_hour, current_minute)
            
            # Parar se chegou ao horário de fechamento
            if current_time >= end_time:
                break
                
            possible_times.append(current_time)
            
            # Incrementar 30 minutos
            current_minute += 30
            if current_minute >= 60:
                current_minute = 0
                current_hour += 1
        
        # Verificar agendamentos existentes
        existing_appointments = Appointment.objects.filter(
            data_agendamento=selected_date,
            situacao__in=['pending', 'confirmed', 'in_progress']
        ).values_list('horario_agendamento', flat=True)
        
        # Montar lista de horários disponíveis
        time_slots = []
        for time_slot in possible_times:
            is_occupied = time_slot in existing_appointments
            
            time_slots.append({
                'time': time_slot.strftime('%H:%M'),
                'available': not is_occupied
            })
        
        return JsonResponse({
            'success': True,
            'slots': time_slots,
            'date': date_str
        })
        
    except Exception as e:
        print(f"Erro ao obter horários: {e}")
        return JsonResponse({'success': False, 'error': str(e)}, status=500)
        
        return JsonResponse({
            'success': True,
            'date': date_str,
            'slots': time_slots
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@login_required
def vehicles_page(request):
    """Página de gerenciamento de veículos"""
    if request.method == 'POST':
        return handle_vehicle_form(request)
    
    user_vehicles = Vehicle.objects.filter(usuario=request.user).order_by('-criado_em')
    
    # Estatísticas
    total_vehicles = user_vehicles.count()
    vehicle_categories = user_vehicles.values('categoria').annotate(count=Count('id'))
    
    context = {
        'vehicles': user_vehicles,
        'total_vehicles': total_vehicles,
        'vehicle_categories': vehicle_categories,
        'vehicle_categories_choices': Vehicle.CATEGORY_CHOICES,
    }
    
    return render(request, 'dashboard/vehicles.html', context)


@login_required
def appointments_page(request):
    """Página de histórico de agendamentos - SOMENTE DO USUÁRIO LOGADO"""
    # IMPORTANTE: Filtrar APENAS agendamentos do usuário atual
    user_appointments = Appointment.objects.filter(
        usuario=request.user
    ).select_related('veiculo', 'usuario').prefetch_related(
        'appointment_services__servico'
    ).order_by('-criado_em')
    
    # Debug: Verificar se está filtrando corretamente
    print(f"[DEBUG] Usuario logado: {request.user.id} - {request.user.username}")
    print(f"[DEBUG] Total de agendamentos do usuario: {user_appointments.count()}")
    
    # Filtros
    status_filter = request.GET.get('status')
    if status_filter:
        user_appointments = user_appointments.filter(situacao=status_filter)
    
    # Estatísticas APENAS do usuário logado
    total_appointments = user_appointments.count()
    completed = user_appointments.filter(situacao='completed').count()
    pending = user_appointments.filter(situacao='pending').count()
    
    context = {
        'appointments': user_appointments,
        'total_appointments': total_appointments,
        'completed_appointments': completed,
        'pending_appointments': pending,
        'status_choices': Appointment.STATUS_CHOICES,
    }
    
    return render(request, 'dashboard/appointments.html', context)


# Handlers para formulários
def handle_booking_form(request):
    """Processa formulário de agendamento"""
    try:
        # Parsear dados JSON ou POST
        if request.content_type == 'application/json':
            data = json.loads(request.body)
        else:
            data = request.POST
        
        # Extrair dados
        service_id = data.get('service_id')
        vehicle_id = data.get('vehicle_id')
        date_str = data.get('date')
        time_str = data.get('time')
        notes = data.get('notes', '')
        payment_method = data.get('payment_method', 'money')
        
        # Validar campos obrigatórios
        if not all([service_id, vehicle_id, date_str, time_str]):
            return JsonResponse({
                'success': False, 
                'error': 'Todos os campos obrigatórios devem ser preenchidos.'
            }, status=400)
        
        # Buscar veículo (pode ser 'new' se foi cadastrado agora)
        if vehicle_id == 'new':
            # Buscar o último veículo cadastrado pelo usuário
            vehicle = Vehicle.objects.filter(usuario=request.user).order_by('-criado_em').first()
            if not vehicle:
                return JsonResponse({
                    'success': False,
                    'error': 'Veículo não encontrado. Por favor, cadastre um veículo primeiro.'
                }, status=400)
        else:
            vehicle = get_object_or_404(Vehicle, id=vehicle_id, usuario=request.user)
        
        # Buscar serviço
        service = get_object_or_404(Service, id=service_id, ativo=True)
        
        # Converter data e hora
        from datetime import datetime
        appointment_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        appointment_time = datetime.strptime(time_str, '%H:%M').time()
        
        # Verificar se já existe agendamento nesse horário
        existing = Appointment.objects.filter(
            data_agendamento=appointment_date,
            horario_agendamento=appointment_time
        ).exists()
        
        if existing:
            return JsonResponse({
                'success': False,
                'error': 'Este horário já está reservado. Por favor, escolha outro horário.'
            }, status=400)
        
        # Criar agendamento
        appointment = Appointment.objects.create(
            usuario=request.user,
            veiculo=vehicle,
            data_agendamento=appointment_date,
            horario_agendamento=appointment_time,
            preco_total=service.preco,
            observacoes=notes,
            situacao='pending'
        )
        
        # Adicionar serviço ao agendamento
        from appointments.models import AppointmentService
        AppointmentService.objects.create(
            agendamento=appointment,
            servico=service,
            preco=service.preco
        )
        
        # Retornar sucesso
        return JsonResponse({
            'success': True,
            'appointment_id': appointment.id,
            'message': 'Agendamento criado com sucesso!'
        })
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


def handle_vehicle_form(request):
    """Processa formulário de veículo"""
    try:
        data = request.POST
        vehicle_id = data.get('vehicle_id')
        
        vehicle_data = {
            'marca': data.get('marca'),
            'modelo': data.get('modelo'),
            'ano': int(data.get('ano')),
            'cor': data.get('cor', ''),
            'placa': data.get('placa').upper(),
            'categoria': data.get('categoria', 'sedan'),
            'quilometragem': data.get('quilometragem') or None,
        }
        
        # Validar dados obrigatórios
        if not all([vehicle_data['marca'], vehicle_data['modelo'], vehicle_data['placa']]):
            messages.error(request, 'Marca, modelo e placa são obrigatórios.')
            return redirect('vehicles_page')
        
        if vehicle_id:  # Editar
            vehicle = get_object_or_404(Vehicle, id=vehicle_id, usuario=request.user)
            for key, value in vehicle_data.items():
                setattr(vehicle, key, value)
            vehicle.save()
            messages.success(request, 'Veículo atualizado com sucesso!')
        else:  # Criar
            vehicle_data['usuario'] = request.user
            Vehicle.objects.create(**vehicle_data)
            messages.success(request, 'Veículo adicionado com sucesso!')
        
        return redirect('vehicles_page')
        
    except Exception as e:
        messages.error(request, f'Erro ao salvar veículo: {str(e)}')
        return redirect('vehicles_page')


def handle_profile_form(request):
    """Processa formulário de perfil"""
    try:
        user = request.user
        user.first_name = request.POST.get('first_name', '')
        user.last_name = request.POST.get('last_name', '')
        user.email = request.POST.get('email', '')
        user.phone = request.POST.get('phone', '')
        user.save()
        
        messages.success(request, 'Perfil atualizado com sucesso!')
        return redirect('profile_page')
        
    except Exception as e:
        messages.error(request, f'Erro ao atualizar perfil: {str(e)}')
        return redirect('profile_page')


# API Endpoints para AJAX
@require_http_methods(["GET"])
@login_required
def get_time_slots(request):
    """API para obter horários disponíveis"""
    date_str = request.GET.get('date')
    if not date_str:
        return JsonResponse({'error': 'Data é obrigatória'}, status=400)
    
    try:
        selected_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        weekday = selected_date.weekday()  # 0=segunda, 1=terça, ..., 6=domingo
        
        # Definir horários de funcionamento
        # Segunda a Sexta: 8h às 17:30h
        # Sábado: 8h às 13h  
        # Domingo: Fechado
        
        if weekday == 6:  # Domingo
            return JsonResponse({
                'success': True,
                'slots': [],
                'message': 'Estabelecimento fechado aos domingos',
                'date': date_str
            })
        
        # Definir horários baseado no dia da semana
        if weekday == 5:  # Sábado
            start_hour, start_minute = 8, 0    # 8:00
            end_hour, end_minute = 13, 0       # 13:00
        else:  # Segunda a Sexta
            start_hour, start_minute = 8, 0    # 8:00
            end_hour, end_minute = 17, 30      # 17:30
        
        # Gerar slots de horário com intervalos de 30 min
        time_slots = []
        current_time = datetime.combine(selected_date, datetime.min.time().replace(hour=start_hour, minute=start_minute))
        end_time = datetime.combine(selected_date, datetime.min.time().replace(hour=end_hour, minute=end_minute))
        
        while current_time < end_time:
            slot_time = current_time.time()
            
            # Verificar se o horário está ocupado
            occupied = Appointment.objects.filter(
                data_agendamento=selected_date,
                horario_agendamento=slot_time,
                situacao__in=['pending', 'confirmed', 'in_progress']
            ).exists()
            
            time_slots.append({
                'time': slot_time.strftime('%H:%M'),
                'available': not occupied
            })
            
            current_time += timedelta(minutes=30)
        
        return JsonResponse({
            'success': True,
            'slots': time_slots,
            'date': date_str
        })
        
    except ValueError:
        return JsonResponse({'error': 'Formato de data inválido'}, status=400)


@require_http_methods(["POST"])
@login_required
def delete_vehicle(request, vehicle_id):
    """API para deletar veículo"""
    try:
        vehicle = get_object_or_404(Vehicle, id=vehicle_id, user=request.user)
        
        # Verificar se há agendamentos pendentes
        pending_appointments = Appointment.objects.filter(
            vehicle=vehicle,
            status__in=['pending', 'confirmed']
        ).count()
        
        if pending_appointments > 0:
            return JsonResponse({
                'success': False,
                'error': 'Não é possível excluir veículo com agendamentos pendentes'
            }, status=400)
        
        vehicle.delete()
        return JsonResponse({'success': True})
        
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@require_http_methods(["GET"])
@login_required
def dashboard_stats(request):
    """API para estatísticas do dashboard"""
    user = request.user
    
    stats = {
        'vehicles_count': Vehicle.objects.filter(user=user).count(),
        'appointments_count': Appointment.objects.filter(user=user).count(),
        'pending_appointments': Appointment.objects.filter(
            user=user,
            status='pending'
        ).count(),
        'total_spent': Appointment.objects.filter(
            user=user,
            status='completed'
        ).aggregate(total=Sum('total_price'))['total'] or 0,
    }
    
    return JsonResponse(stats)


@login_required 
@require_http_methods(["POST"])
def cancel_appointment(request, appointment_id):
    """API para cancelar agendamento"""
    try:
        appointment = Appointment.objects.get(
            id=appointment_id, 
            usuario=request.user
        )
        
        # Só permite cancelar se estiver pendente ou confirmado
        if appointment.situacao not in ['pending', 'confirmed']:
            return JsonResponse({
                'success': False,
                'error': 'Este agendamento não pode ser cancelado'
            })
        
        appointment.situacao = 'cancelled'
        appointment.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Agendamento cancelado com sucesso'
        })
        
    except Appointment.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Agendamento não encontrado'
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        })
