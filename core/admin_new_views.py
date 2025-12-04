# core/admin_new_views.py
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required, user_passes_test
from django.http import JsonResponse, HttpResponse
from django.contrib import messages
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.paginator import Paginator
from django.db.models import Q, Sum, Count, F
from django.utils import timezone
from decimal import Decimal
import json

from .models import User
from vehicles.models import Vehicle
from appointments.models import Appointment
from services.models import Service
from inventory.models import Product

def is_admin_user(user):
    """Verifica se o usuário é um administrador"""
    return user.is_authenticated and (user.is_staff or user.is_superuser or user.funcao == 'admin')

@login_required
@user_passes_test(is_admin_user)
def admin_dashboard(request):
    """Dashboard principal do administrador"""
    context = {
        'page_title': 'Dashboard Administrativo',
        'active_page': 'dashboard'
    }
    return render(request, 'admin_new/dashboard.html', context)

@login_required
@user_passes_test(is_admin_user)
def clientes_view(request):
    """View para listagem de clientes em cards"""
    search_query = request.GET.get('search', '')
    
    # Buscar apenas clientes
    clientes = User.objects.filter(funcao='client').prefetch_related('vehicles').order_by('-criado_em')
    if search_query:
        clientes = clientes.filter(
            Q(username__icontains=search_query) |
            Q(first_name__icontains=search_query) |
            Q(last_name__icontains=search_query) |
            Q(email__icontains=search_query)
        )
    
    # Paginação
    paginator = Paginator(clientes, 20)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'page_title': 'Clientes',
        'active_page': 'clientes',
        'items': page_obj,
        'search_query': search_query,
        'total_clientes': clientes.count(),
    }
    return render(request, 'admin_new/clientes.html', context)

@login_required
@user_passes_test(is_admin_user)
def criar_cliente(request):
    """View para criar novo cliente"""
    context = {
        'page_title': 'Criar Cliente',
        'active_page': 'clientes'
    }
    return render(request, 'admin_new/cliente_form.html', context)

@login_required
@user_passes_test(is_admin_user)
def editar_cliente(request, id):
    """View para editar cliente existente"""
    cliente = get_object_or_404(User, id=id)
    context = {
        'page_title': 'Editar Cliente',
        'active_page': 'clientes',
        'cliente': cliente
    }
    return render(request, 'admin_new/cliente_form.html', context)

@login_required
@user_passes_test(is_admin_user)
def cliente_veiculos_view(request, cliente_id):
    """View para mostrar veículos de um cliente específico"""
    cliente = get_object_or_404(User, id=cliente_id, funcao='client')
    search_query = request.GET.get('search', '')
    
    # Buscar veículos do cliente
    veiculos = cliente.vehicles.order_by('-criado_em')
    if search_query:
        veiculos = veiculos.filter(
            Q(marca__icontains=search_query) |
            Q(modelo__icontains=search_query) |
            Q(placa__icontains=search_query)
        )
    
    # Paginação
    paginator = Paginator(veiculos, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'page_title': f'Veículos de {cliente.get_full_name()}',
        'active_page': 'clientes',
        'cliente': cliente,
        'items': page_obj,
        'search_query': search_query,
        'total_veiculos': veiculos.count(),
    }
    return render(request, 'admin_new/cliente_veiculos.html', context)

@login_required
@user_passes_test(is_admin_user)
def agendamentos_view(request):
    """View para gerenciamento de agendamentos"""
    status_filter = request.GET.get('status', '')
    search_query = request.GET.get('search', '')
    
    # Buscar agendamentos com prefetch dos serviços relacionados
    agendamentos = Appointment.objects.select_related(
        'usuario', 'veiculo'
    ).prefetch_related(
        'appointment_services__servico'
    ).order_by('-data_agendamento')
    
    if status_filter:
        agendamentos = agendamentos.filter(situacao=status_filter)
    
    if search_query:
        agendamentos = agendamentos.filter(
            Q(usuario__username__icontains=search_query) |
            Q(veiculo__marca__icontains=search_query) |
            Q(veiculo__modelo__icontains=search_query)
        )
    
    paginator = Paginator(agendamentos, 20)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'page_title': 'Gestão de Agendamentos',
        'active_page': 'agendamentos',
        'agendamentos': page_obj,
        'search_query': search_query,
        'status_filter': status_filter,
        'total_agendamentos': agendamentos.count(),
        'status_choices': Appointment.STATUS_CHOICES
    }
    return render(request, 'admin_new/agendamentos.html', context)

@login_required
@user_passes_test(is_admin_user)
def alterar_status_agendamento(request, id):
    """API para alterar status de agendamento"""
    if request.method == 'POST':
        agendamento = get_object_or_404(Appointment, id=id)
        data = json.loads(request.body)
        novo_status = data.get('status')
        status_anterior = agendamento.situacao
        
        if novo_status in [choice[0] for choice in Appointment.STATUS_CHOICES]:
            agendamento.situacao = novo_status
            agendamento.save()
            
            # ============ NOTIFICAÇÃO WEBSOCKET ============
            from core.websocket_utils import notify_client_appointment_status_changed
            
            # Mapear status para mensagens amigáveis
            status_messages = {
                'pending': 'Seu agendamento está pendente de confirmação',
                'confirmed': 'Seu agendamento foi confirmado! Aguardamos você na data marcada.',
                'in_progress': 'Seu veículo está sendo atendido agora!',
                'completed': 'Serviço concluído! Obrigado pela preferência.',
                'cancelled': 'Seu agendamento foi cancelado.'
            }
            
            status_display = {
                'pending': 'Pendente',
                'confirmed': 'Confirmado',
                'in_progress': 'Em Andamento',
                'completed': 'Concluído',
                'cancelled': 'Cancelado'
            }
            
            # Notificar o cliente via WebSocket
            notify_client_appointment_status_changed(
                user_id=agendamento.usuario.id,
                appointment_id=agendamento.id,
                new_status=novo_status,
                status_display=status_display.get(novo_status, novo_status),
                message=status_messages.get(novo_status, 'Status do agendamento atualizado')
            )
            
            # ============ WHATSAPP REDIRECT ============
            whatsapp_url = None
            cliente_sem_telefone = False
            
            # Enviar WhatsApp para status concluído ou cancelado
            if novo_status in ['completed', 'cancelled']:
                # Debug log
                status_label = 'concluído' if novo_status == 'completed' else 'cancelado'
                print(f"[DEBUG WhatsApp] Agendamento #{agendamento.id} marcado como {status_label}")
                print(f"[DEBUG WhatsApp] Cliente: {agendamento.usuario.username} ({agendamento.usuario.email})")
                
                # Obter telefone do cliente
                telefone = agendamento.usuario.telefone
                print(f"[DEBUG WhatsApp] Telefone original: {telefone}")
                
                if telefone and telefone.strip():
                    # Limpar telefone (remover caracteres especiais)
                    import re
                    telefone_limpo = re.sub(r'\D', '', telefone)
                    print(f"[DEBUG WhatsApp] Telefone limpo: {telefone_limpo}")
                    
                    # Validar se tem pelo menos 10 dígitos
                    if len(telefone_limpo) >= 10:
                        # Adicionar código do Brasil se necessário
                        if len(telefone_limpo) == 11 and not telefone_limpo.startswith('55'):
                            telefone_limpo = '55' + telefone_limpo
                        elif len(telefone_limpo) == 10 and not telefone_limpo.startswith('55'):
                            telefone_limpo = '55' + telefone_limpo
                        
                        print(f"[DEBUG WhatsApp] Telefone formatado: {telefone_limpo}")
                        
                        # Criar mensagem personalizada baseada no status
                        cliente_nome = agendamento.usuario.first_name or 'Cliente'
                        veiculo_info = f"{agendamento.veiculo.marca} {agendamento.veiculo.modelo}"
                        placa = agendamento.veiculo.placa if hasattr(agendamento.veiculo, 'placa') else ''
                        data_agendamento = agendamento.data_agendamento.strftime('%d/%m/%Y')
                        horario_agendamento = agendamento.horario_agendamento.strftime('%H:%M')
                        
                        if novo_status == 'completed':
                            # Mensagem para serviço concluído
                            mensagem = f"Olá {cliente_nome}! 🚗✨\n\nSeu *{veiculo_info}*"
                            if placa:
                                mensagem += f" (placa: {placa})"
                            mensagem += " está pronto! O serviço foi concluído com sucesso.\n\n"
                            mensagem += "Você já pode retirar seu veículo. Obrigado pela preferência! 😊"
                        else:
                            # Mensagem para agendamento cancelado
                            mensagem = f"Olá {cliente_nome}! ⚠️\n\n"
                            mensagem += f"Informamos que seu agendamento para o dia *{data_agendamento}* às *{horario_agendamento}* foi cancelado.\n\n"
                            mensagem += f"🚗 Veículo: *{veiculo_info}*"
                            if placa:
                                mensagem += f" (placa: {placa})"
                            mensagem += "\n\n"
                            mensagem += "Se desejar reagendar, entre em contato conosco. Estamos à disposição! 📞"
                        
                        print(f"[DEBUG WhatsApp] Mensagem criada: {mensagem[:50]}...")
                        
                        # Criar URL do WhatsApp
                        import urllib.parse
                        mensagem_encoded = urllib.parse.quote(mensagem)
                        whatsapp_url = f"https://wa.me/{telefone_limpo}?text={mensagem_encoded}"
                        
                        print(f"[DEBUG WhatsApp] URL gerada: {whatsapp_url[:80]}...")
                    else:
                        print(f"[DEBUG WhatsApp] Telefone inválido - menos de 10 dígitos")
                        cliente_sem_telefone = True
                else:
                    print(f"[DEBUG WhatsApp] Cliente sem telefone cadastrado")
                    cliente_sem_telefone = True
            
            response_data = {
                'success': True, 
                'message': 'Status atualizado com sucesso',
                'new_status': novo_status,
                'previous_status': status_anterior
            }
            
            if whatsapp_url:
                response_data['whatsapp_url'] = whatsapp_url
                response_data['show_whatsapp_prompt'] = True
            elif cliente_sem_telefone:
                response_data['cliente_sem_telefone'] = True
                response_data['message'] = 'Status atualizado! Atenção: Cliente não possui telefone cadastrado.'
            
            return JsonResponse(response_data)
        else:
            return JsonResponse({'success': False, 'message': 'Status inválido'})
    
    return JsonResponse({'success': False, 'message': 'Método não permitido'})

@login_required
@user_passes_test(is_admin_user)
def servicos_view(request):
    """View para gerenciamento de serviços"""
    servicos = Service.objects.all().order_by('nome')
    
    context = {
        'page_title': 'Gestão de Serviços',
        'active_page': 'servicos',
        'servicos': servicos
    }
    return render(request, 'admin_new/servicos.html', context)

@login_required
@user_passes_test(is_admin_user)
def criar_servico(request):
    """View para criar novo serviço"""
    from services.models import ServiceCategory
    from decimal import Decimal
    
    if request.method == 'POST':
        try:
            # Obter ou criar categoria padrão
            categoria, _ = ServiceCategory.objects.get_or_create(
                nome='Geral',
                defaults={'descricao': 'Serviços gerais', 'ativo': True}
            )
            
            # Criar serviço
            servico = Service.objects.create(
                categoria=categoria,
                nome=request.POST.get('nome'),
                descricao=request.POST.get('descricao', ''),
                preco=Decimal(request.POST.get('preco')),
                duracao_minutos=int(request.POST.get('duracao_minutos')),
                ativo=request.POST.get('ativo') == 'on'
            )
            
            messages.success(request, f'Serviço "{servico.nome}" criado com sucesso!')
            return redirect('admin_new:servicos')
        except Exception as e:
            messages.error(request, f'Erro ao criar serviço: {str(e)}')
    
    context = {
        'page_title': 'Criar Serviço',
        'active_page': 'servicos'
    }
    return render(request, 'admin_new/servico_form.html', context)

@login_required
@user_passes_test(is_admin_user)
def editar_servico(request, id):
    """View para editar serviço existente"""
    from decimal import Decimal
    
    servico = get_object_or_404(Service, id=id)
    
    if request.method == 'POST':
        try:
            servico.nome = request.POST.get('nome')
            servico.descricao = request.POST.get('descricao', '')
            servico.preco = Decimal(request.POST.get('preco'))
            servico.duracao_minutos = int(request.POST.get('duracao_minutos'))
            servico.ativo = request.POST.get('ativo') == 'on'
            servico.save()
            
            messages.success(request, f'Serviço "{servico.nome}" atualizado com sucesso!')
            return redirect('admin_new:servicos')
        except Exception as e:
            messages.error(request, f'Erro ao atualizar serviço: {str(e)}')
    
    context = {
        'page_title': 'Editar Serviço',
        'active_page': 'servicos',
        'servico': servico
    }
    return render(request, 'admin_new/servico_form.html', context)

# Veículos view merged into clientes_view

@login_required
@user_passes_test(is_admin_user)
def veiculos_redirect(request):
    """Redirect veiculos to clientes with tab parameter"""
    from django.http import HttpResponseRedirect
    from django.urls import reverse
    return HttpResponseRedirect(f"{reverse('admin_new:clientes')}?tab=veiculos")

@login_required
@user_passes_test(is_admin_user)
def estoque_view(request):
    """View para gerenciamento de estoque com filtros Django tradicional"""
    from inventory.models import Product, ProductCategory
    from django.db.models import Q, Sum
    
    # Capturar parâmetros de filtro
    busca = request.GET.get('busca', '')
    categoria_id = request.GET.get('categoria', '')
    status = request.GET.get('status', '')
    
    # Base queryset
    produtos = Product.objects.select_related('categoria').order_by('nome')
    
    # Aplicar filtros
    if busca:
        produtos = produtos.filter(
            Q(nome__icontains=busca) | 
            Q(codigo__icontains=busca) |
            Q(descricao__icontains=busca)
        )
    
    if categoria_id:
        produtos = produtos.filter(categoria_id=categoria_id)
    
    if status:
        if status == 'em_falta':
            produtos = produtos.filter(quantidade=0)
        elif status == 'baixo_estoque':
            produtos = produtos.filter(quantidade__lte=10, quantidade__gt=0)
        elif status == 'disponivel':
            produtos = produtos.filter(quantidade__gt=10)
    
    # Calcular estatísticas
    total_produtos = Product.objects.count()
    produtos_falta = Product.objects.filter(quantidade=0).count()
    produtos_baixo = Product.objects.filter(quantidade__lte=10, quantidade__gt=0).count()
    valor_total = Product.objects.aggregate(
        total=Sum('preco_unitario')
    )['total'] or 0
    
    # Categorias para select
    categorias = ProductCategory.objects.all().order_by('nome')
    
    context = {
        'page_title': 'Gestão de Estoque',
        'active_page': 'estoque',
        'produtos': produtos,
        'categorias': categorias,
        'estatisticas': {
            'total_produtos': total_produtos,
            'produtos_falta': produtos_falta,
            'produtos_baixo': produtos_baixo,
            'valor_total': valor_total,
        },
        'filtros': {
            'busca': busca,
            'categoria_id': categoria_id,
            'status': status,
        }
    }
    return render(request, 'admin_new/estoque.html', context)

@login_required
@user_passes_test(is_admin_user)
def editar_produto_view(request, produto_id):
    """View para editar produto"""
    from inventory.models import Product, ProductCategory, Supplier
    
    produto = get_object_or_404(Product, id=produto_id)
    
    if request.method == 'POST':
        # Processar formulário
        produto.nome = request.POST.get('nome', produto.nome)
        produto.descricao = request.POST.get('descricao', produto.descricao)
        
        categoria_id = request.POST.get('categoria')
        if categoria_id:
            produto.categoria_id = categoria_id
            
        fornecedor_id = request.POST.get('fornecedor')
        if fornecedor_id:
            produto.fornecedor_id = fornecedor_id
            
        produto.sku = request.POST.get('sku', produto.sku)
        produto.codigo_barras = request.POST.get('codigo_barras', produto.codigo_barras)
        produto.quantidade_minima = int(request.POST.get('quantidade_minima', produto.quantidade_minima))
        produto.preco_unitario = float(request.POST.get('preco_unitario', produto.preco_unitario))
        produto.preco_custo = float(request.POST.get('preco_custo', produto.preco_custo or 0))
        produto.localizacao = request.POST.get('localizacao', produto.localizacao)
        
        produto.save()
        
        return redirect('admin_new:estoque')
    
    categorias = ProductCategory.objects.all().order_by('nome')
    fornecedores = Supplier.objects.filter(ativo=True).order_by('nome')
    
    context = {
        'page_title': 'Editar Produto',
        'active_page': 'estoque',
        'produto': produto,
        'categorias': categorias,
        'fornecedores': fornecedores,
    }
    return render(request, 'admin_new/produto_form.html', context)

@login_required
@user_passes_test(is_admin_user)
def excluir_produto_view(request, produto_id):
    """View para excluir produto"""
    from inventory.models import Product
    
    produto = get_object_or_404(Product, id=produto_id)
    
    if request.method == 'POST':
        produto.delete()
        return redirect('admin_new:estoque')
    
    context = {
        'page_title': 'Excluir Produto',
        'active_page': 'estoque',
        'produto': produto,
        'valor_total_estoque': produto.preco_unitario * produto.quantidade,
    }
    return render(request, 'admin_new/produto_excluir.html', context)

@login_required
@user_passes_test(is_admin_user)
def ajustar_estoque_view(request, produto_id):
    """View para ajustar estoque"""
    from inventory.models import Product, StockMovement
    
    produto = get_object_or_404(Product, id=produto_id)
    
    if request.method == 'POST':
        tipo = request.POST.get('tipo')
        quantidade = int(request.POST.get('quantidade', 0))
        motivo = request.POST.get('motivo', '')
        
        quantidade_anterior = produto.quantidade
        
        if tipo == 'entrada':
            nova_quantidade = quantidade_anterior + quantidade
        elif tipo == 'saida':
            nova_quantidade = max(0, quantidade_anterior - quantidade)
        elif tipo == 'ajuste':
            nova_quantidade = quantidade
        else:
            nova_quantidade = quantidade_anterior
            
        # Criar movimentação de estoque
        StockMovement.objects.create(
            produto=produto,
            tipo=tipo,
            quantidade=quantidade,
            quantidade_anterior=quantidade_anterior,
            nova_quantidade=nova_quantidade,
            motivo=motivo,
            usuario=request.user
        )
        
        # Atualizar quantidade do produto
        produto.quantidade = nova_quantidade
        produto.save()
        
        return redirect('admin_new:estoque')
    
    context = {
        'page_title': 'Ajustar Estoque',
        'active_page': 'estoque',
        'produto': produto,
    }
    return render(request, 'admin_new/ajustar_estoque.html', context)

@login_required
@user_passes_test(is_admin_user)
def criar_produto_view(request):
    """View para criar novo produto"""
    from inventory.models import Product, ProductCategory, Supplier
    from decimal import Decimal
    
    if request.method == 'POST':
        try:
            # Obter ou criar categoria padrão se não especificada
            categoria_id = request.POST.get('categoria')
            if categoria_id:
                categoria = get_object_or_404(ProductCategory, id=categoria_id)
            else:
                categoria, _ = ProductCategory.objects.get_or_create(
                    nome='Geral',
                    defaults={'descricao': 'Categoria geral', 'ativo': True}
                )
            
            # Obter fornecedor se especificado
            fornecedor_id = request.POST.get('fornecedor')
            fornecedor = None
            if fornecedor_id:
                fornecedor = get_object_or_404(Supplier, id=fornecedor_id)
            
            # Tratar campos opcionais para evitar strings vazias em campos únicos
            sku = request.POST.get('sku', '').strip()
            codigo_barras = request.POST.get('codigo_barras', '').strip()
            
            # Criar produto
            produto = Product.objects.create(
                nome=request.POST.get('nome'),
                descricao=request.POST.get('descricao', ''),
                categoria=categoria,
                fornecedor=fornecedor,
                sku=sku if sku else None,
                codigo_barras=codigo_barras if codigo_barras else None,
                quantidade=int(request.POST.get('quantidade', 0)),
                quantidade_minima=int(request.POST.get('quantidade_minima', 0)),
                preco_unitario=Decimal(request.POST.get('preco_unitario', '0')),
                preco_custo=Decimal(request.POST.get('preco_custo', '0')),
                localizacao=request.POST.get('localizacao', ''),
                ativo=True
            )
            
            messages.success(request, f'Produto "{produto.nome}" criado com sucesso!')
            return redirect('admin_new:estoque')
            
        except Exception as e:
            messages.error(request, f'Erro ao criar produto: {str(e)}')
    
    # Buscar categorias e fornecedores para o formulário
    categorias = ProductCategory.objects.filter(ativo=True).order_by('nome')
    fornecedores = Supplier.objects.filter(ativo=True).order_by('nome')
    
    context = {
        'page_title': 'Adicionar Produto',
        'active_page': 'estoque',
        'categorias': categorias,
        'fornecedores': fornecedores,
    }
    return render(request, 'admin_new/produto_form.html', context)

@login_required
@user_passes_test(is_admin_user)
def relatorios_view(request):
    """View para relatórios"""
    context = {
        'page_title': 'Relatórios',
        'active_page': 'relatorios'
    }
    return render(request, 'admin_new/relatorios.html', context)

# APIs AJAX
@login_required
@user_passes_test(is_admin_user)
def dashboard_stats_api(request):
    """API para estatísticas do dashboard"""
    total_clientes = User.objects.filter(funcao='client').count()
    total_agendamentos = Appointment.objects.count()
    agendamentos_hoje = Appointment.objects.filter(
        data_agendamento=timezone.now().date()
    ).count()
    agendamentos_pendentes = Appointment.objects.filter(
        situacao='pending'
    ).count()
    
    data = {
        'total_clientes': total_clientes,
        'total_agendamentos': total_agendamentos,
        'agendamentos_hoje': agendamentos_hoje,
        'agendamentos_pendentes': agendamentos_pendentes
    }
    
    return JsonResponse(data)

@login_required
@user_passes_test(is_admin_user)
def clientes_api(request):
    """API para operações com clientes"""
    if request.method == 'GET':
        clientes = User.objects.filter(funcao='client')[:10]
        data = []
        for cliente in clientes:
            data.append({
                'id': cliente.id,
                'nome': f"{cliente.first_name} {cliente.last_name}",
                'email': cliente.email,
                'telefone': cliente.telefone,
                'ativo': cliente.ativo
            })
        return JsonResponse({'clientes': data})
    
    return JsonResponse({'error': 'Método não permitido'})

@login_required
@user_passes_test(is_admin_user)
def agendamentos_api(request):
    """API para operações com agendamentos"""
    if request.method == 'GET':
        agendamentos = Appointment.objects.all()[:10]
        data = []
        for agendamento in agendamentos:
            data.append({
                'id': agendamento.id,
                'cliente': f"{agendamento.usuario.first_name} {agendamento.usuario.last_name}",
                'veiculo': f"{agendamento.veiculo.marca} {agendamento.veiculo.modelo}",
                'data': agendamento.data_agendamento.strftime('%d/%m/%Y'),
                'horario': agendamento.horario_agendamento.strftime('%H:%M'),
                'status': agendamento.situacao
            })
        return JsonResponse({'agendamentos': data})
    
    return JsonResponse({'error': 'Método não permitido'})


# ============ APIs para Estoque Avançado ============

@require_http_methods(["GET"])
@login_required
@user_passes_test(is_admin_user)
def api_produtos_list(request):
    """Lista todos os produtos com informações de estoque"""
    try:
        produtos = Product.objects.all().order_by('nome')
        produtos_data = []
        
        for produto in produtos:
            produtos_data.append({
                'id': produto.pk,
                'nome': produto.nome,
                'sku': getattr(produto, 'sku', None),
                'categoria': produto.categoria.nome if hasattr(produto, 'categoria') and produto.categoria else 'Geral',
                'descricao': getattr(produto, 'descricao', ''),
                'preco_unitario': float(produto.preco_unitario) if hasattr(produto, 'preco_unitario') else 0.0,
                'quantidade': getattr(produto, 'quantidade', 0),
                'quantidade_minima': getattr(produto, 'quantidade_minima', 5),
                'data_criacao': produto.criado_em.isoformat() if hasattr(produto, 'criado_em') else None,
                'data_atualizacao': produto.atualizado_em.isoformat() if hasattr(produto, 'atualizado_em') else None,
            })
        
        return JsonResponse(produtos_data, safe=False)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@require_http_methods(["POST"])
@login_required
@user_passes_test(is_admin_user)
def api_produtos_create(request):
    """Cria um novo produto"""
    try:
        data = json.loads(request.body)
        
        # Buscar categoria se fornecida como string
        categoria_obj = None
        if 'categoria' in data:
            from inventory.models import ProductCategory
            try:
                categoria_obj = ProductCategory.objects.get(nome=data['categoria'])
            except ProductCategory.DoesNotExist:
                # Criar categoria se não existir
                categoria_obj = ProductCategory.objects.create(nome=data['categoria'])
        
        # Criar produto com dados fornecidos
        produto_data = {
            'nome': data.get('nome'),
            'preco_unitario': Decimal(str(data.get('preco_unitario', 0))),
        }
        
        if categoria_obj:
            produto_data['categoria'] = categoria_obj
        
        # Adicionar campos opcionais se existirem no modelo
        optional_fields = ['sku', 'descricao', 'quantidade', 'quantidade_minima']
        for field in optional_fields:
            if field in data and hasattr(Product, field):
                if field in ['quantidade', 'quantidade_minima']:
                    produto_data[field] = int(data.get(field, 0))
                else:
                    produto_data[field] = data.get(field)
        
        produto = Product.objects.create(**produto_data)
        
        return JsonResponse({
            'id': produto.pk,
            'nome': produto.nome,
            'message': 'Produto criado com sucesso!'
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


@require_http_methods(["PUT"])
@login_required
@user_passes_test(is_admin_user)
def api_produtos_update(request, produto_id):
    """Atualiza um produto existente"""
    try:
        produto = get_object_or_404(Product, pk=produto_id)
        data = json.loads(request.body)
        
        # Atualizar campos básicos
        if 'nome' in data:
            produto.nome = data['nome']
        if 'preco_unitario' in data:
            produto.preco_unitario = Decimal(str(data['preco_unitario']))
        
        # Atualizar campos opcionais se existirem
        optional_fields = ['sku', 'categoria', 'descricao', 'quantidade', 'quantidade_minima']
        for field in optional_fields:
            if field in data and hasattr(produto, field):
                if field in ['quantidade', 'quantidade_minima']:
                    setattr(produto, field, int(data.get(field, 0)))
                else:
                    setattr(produto, field, data.get(field))
        
        produto.save()
        
        return JsonResponse({
            'id': produto.pk,
            'nome': produto.nome,
            'message': 'Produto atualizado com sucesso!'
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


@require_http_methods(["DELETE"])
@login_required
@user_passes_test(is_admin_user)
def api_produtos_delete(request, produto_id):
    """Exclui um produto"""
    try:
        produto = get_object_or_404(Product, pk=produto_id)
        nome = produto.nome
        produto.delete()
        
        return JsonResponse({
            'message': f'Produto "{nome}" excluído com sucesso!'
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


@require_http_methods(["GET"])
@login_required
@user_passes_test(is_admin_user)
def api_estoque_estatisticas(request):
    """Retorna estatísticas do estoque"""
    try:
        produtos = Product.objects.all()
        
        total_produtos = produtos.count()
        produtos_sem_estoque = 0
        produtos_estoque_baixo = 0
        valor_total = 0
        
        for produto in produtos:
            quantidade = getattr(produto, 'quantidade', 0)
            quantidade_minima = getattr(produto, 'quantidade_minima', 5)
            preco = getattr(produto, 'preco_unitario', 0)
            
            if quantidade == 0:
                produtos_sem_estoque += 1
            elif quantidade <= quantidade_minima:
                produtos_estoque_baixo += 1
            
            valor_total += float(preco) * quantidade
        
        return JsonResponse({
            'total_produtos': total_produtos,
            'produtos_sem_estoque': produtos_sem_estoque,
            'produtos_estoque_baixo': produtos_estoque_baixo,
            'valor_total': valor_total,
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@require_http_methods(["POST"])
@login_required
@user_passes_test(is_admin_user)
def api_estoque_movimentacao(request):
    """Registra movimentação de estoque"""
    try:
        data = json.loads(request.body)
        produto_id = data.get('produto_id')
        tipo = data.get('tipo')  # entrada, saida, ajuste
        quantidade = int(data.get('quantidade', 0))
        motivo = data.get('motivo', '')
        
        produto = get_object_or_404(Product, pk=produto_id)
        quantidade_atual = getattr(produto, 'quantidade', 0)
        
        # Calcular nova quantidade
        if tipo == 'entrada':
            nova_quantidade = quantidade_atual + quantidade
        elif tipo == 'saida':
            nova_quantidade = max(0, quantidade_atual - quantidade)
        elif tipo == 'ajuste':
            nova_quantidade = quantidade
        else:
            return JsonResponse({'error': 'Tipo de movimentação inválido'}, status=400)
        
        # Atualizar quantidade do produto se o campo existir
        if hasattr(produto, 'quantidade'):
            produto.quantidade = nova_quantidade
            produto.save()
        
        return JsonResponse({
            'message': 'Movimentação registrada com sucesso!',
            'quantidade_anterior': quantidade_atual,
            'quantidade_nova': nova_quantidade,
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


@require_http_methods(["GET"])
@login_required
@user_passes_test(is_admin_user)
def api_produtos_historico(request, produto_id):
    """Retorna histórico de movimentações de um produto"""
    try:
        produto = get_object_or_404(Product, pk=produto_id)
        
        # Mock de histórico - implementar quando existir modelo StockMovement
        historico = [
            {
                'id': 1,
                'tipo': 'entrada',
                'quantidade': 50,
                'motivo': 'Compra inicial',
                'data': timezone.now().isoformat(),
                'usuario': 'Admin'
            }
        ]
        
        return JsonResponse({
            'produto': produto.nome,
            'historico': historico
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@require_http_methods(["GET"])
@login_required
@user_passes_test(is_admin_user)
def api_estoque_exportar(request):
    """Exporta relatório de estoque em Excel/CSV"""
    try:
        import csv
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="estoque_{timezone.now().strftime("%Y-%m-%d")}.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['ID', 'Nome', 'SKU', 'Categoria', 'Quantidade', 'Qty Mínima', 'Preço Unit.', 'Valor Total', 'Status'])
        
        produtos = Product.objects.all().order_by('nome')
        for produto in produtos:
            quantidade = getattr(produto, 'quantidade', 0)
            quantidade_minima = getattr(produto, 'quantidade_minima', 5)
            preco = getattr(produto, 'preco_unitario', 0)
            
            if quantidade == 0:
                status = 'Sem Estoque'
            elif quantidade <= quantidade_minima:
                status = 'Estoque Baixo'
            else:
                status = 'Disponível'
            
            writer.writerow([
                produto.pk,
                produto.nome,
                getattr(produto, 'sku', ''),
                getattr(produto, 'categoria', 'Geral'),
                quantidade,
                quantidade_minima,
                float(preco),
                float(preco) * quantidade,
                status
            ])
        
        return response
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)