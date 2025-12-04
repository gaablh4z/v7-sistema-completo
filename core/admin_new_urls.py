# core/admin_new_urls.py
from django.urls import path
from . import admin_new_views

app_name = 'admin_new'

urlpatterns = [
    # Dashboard principal
    path('', admin_new_views.admin_dashboard, name='dashboard'),
    
    # Gestão de clientes
    path('clientes/', admin_new_views.clientes_view, name='clientes'),
    path('clientes/criar/', admin_new_views.criar_cliente, name='criar_cliente'),
    path('clientes/<int:id>/editar/', admin_new_views.editar_cliente, name='editar_cliente'),
    path('clientes/<int:cliente_id>/veiculos/', admin_new_views.cliente_veiculos_view, name='cliente_veiculos'),
    
    # Gestão de agendamentos
    path('agendamentos/', admin_new_views.agendamentos_view, name='agendamentos'),
    path('agendamentos/<int:id>/status/', admin_new_views.alterar_status_agendamento, name='status_agendamento'),
    
    # Gestão de serviços
    path('servicos/', admin_new_views.servicos_view, name='servicos'),
    path('servicos/criar/', admin_new_views.criar_servico, name='criar_servico'),
    path('servicos/<int:id>/editar/', admin_new_views.editar_servico, name='editar_servico'),
    
    # Gestão de veículos (merged with clientes)
    path('veiculos/', admin_new_views.veiculos_redirect, name='veiculos'),
    
    # Gestão de estoque
    path('estoque/', admin_new_views.estoque_view, name='estoque'),
    path('estoque/criar/', admin_new_views.criar_produto_view, name='criar_produto'),
    path('estoque/<int:produto_id>/editar/', admin_new_views.editar_produto_view, name='editar_produto'),
    path('estoque/<int:produto_id>/excluir/', admin_new_views.excluir_produto_view, name='excluir_produto'),
    path('estoque/<int:produto_id>/ajustar/', admin_new_views.ajustar_estoque_view, name='ajustar_estoque'),
    
    # Relatórios
    path('relatorios/', admin_new_views.relatorios_view, name='relatorios'),
    
    # APIs AJAX
    path('api/dashboard-stats/', admin_new_views.dashboard_stats_api, name='dashboard_stats'),
    path('api/clientes/', admin_new_views.clientes_api, name='clientes_api'),
    path('api/agendamentos/', admin_new_views.agendamentos_api, name='agendamentos_api'),
]