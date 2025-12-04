# core/forms.py
from django import forms
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import User
import re


class RegistrationForm(forms.ModelForm):
    """
    Formulário melhorado para registro de usuários
    """
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={
            'class': 'w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'placeholder': 'Crie uma senha (mín. 6 caracteres)'
        }),
        min_length=6,
        help_text='Sua senha deve ter pelo menos 6 caracteres.'
    )
    
    password_confirm = forms.CharField(
        widget=forms.PasswordInput(attrs={
            'class': 'w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'placeholder': 'Digite a senha novamente'
        }),
        label='Confirmar Senha'
    )
    
    accept_terms = forms.BooleanField(
        required=True,
        error_messages={'required': 'Você deve aceitar os termos de uso para continuar.'}
    )
    
    aceita_marketing = forms.BooleanField(
        required=False,
        label='Desejo receber ofertas e novidades por e-mail'
    )
    
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'email', 'telefone', 'data_nascimento', 
            'endereco', 'aceita_marketing'
        ]
        
        widgets = {
            'first_name': forms.TextInput(attrs={
                'class': 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                'placeholder': 'Seu nome'
            }),
            'last_name': forms.TextInput(attrs={
                'class': 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                'placeholder': 'Seu sobrenome'
            }),
            'email': forms.EmailInput(attrs={
                'class': 'w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                'placeholder': 'seu@email.com'
            }),
            'telefone': forms.TextInput(attrs={
                'class': 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                'placeholder': '(11) 99999-9999'
            }),
            'data_nascimento': forms.DateInput(attrs={
                'type': 'date',
                'class': 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            }),
            'endereco': forms.Textarea(attrs={
                'rows': 2,
                'class': 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                'placeholder': 'Rua, número, bairro, cidade, CEP'
            }),
        }
        
        labels = {
            'first_name': 'Nome *',
            'last_name': 'Sobrenome *',
            'email': 'E-mail *',
            'telefone': 'Telefone (opcional)',
            'data_nascimento': 'Data de Nascimento (opcional)',
            'endereco': 'Endereço (opcional)',
        }
    
    def clean_email(self):
        """
        Valida se o email já não está cadastrado
        """
        email = self.cleaned_data.get('email')
        if email and User.objects.filter(email=email).exists():
            raise ValidationError('Este e-mail já está cadastrado.')
        return email
    
    def clean_telefone(self):
        """
        Valida e formata o telefone
        """
        phone = self.cleaned_data.get('telefone')
        if phone:
            # Remove caracteres não numéricos
            phone_numbers = re.sub(r'\D', '', phone)
            
            # Valida formato brasileiro
            if not re.match(r'^\d{10,11}$', phone_numbers):
                raise ValidationError('Telefone inválido. Use o formato (11) 99999-9999')
            
            # Formata o telefone
            if len(phone_numbers) == 11:
                return f"({phone_numbers[:2]}) {phone_numbers[2:7]}-{phone_numbers[7:]}"
            else:
                return f"({phone_numbers[:2]}) {phone_numbers[2:6]}-{phone_numbers[6:]}"
        
        return phone
    
    def clean_password(self):
        """
        Valida a força da senha
        """
        password = self.cleaned_data.get('password')
        if password:
            try:
                validate_password(password)
            except ValidationError as e:
                # Converte lista de mensagens em uma string
                if hasattr(e, 'messages') and e.messages:
                    raise ValidationError('; '.join(e.messages))
                else:
                    raise ValidationError(str(e))
        return password
    
    def clean(self):
        """
        Validação final do formulário
        """
        cleaned_data = super().clean()
        password = cleaned_data.get('password')
        password_confirm = cleaned_data.get('password_confirm')
        
        if password and password_confirm:
            if password != password_confirm:
                raise ValidationError('As senhas não coincidem.')
        
        return cleaned_data
    
    def save(self, commit=True):
        """
        Cria o usuário com dados validados
        """
        user = super().save(commit=False)
        user.set_password(self.cleaned_data['password'])
        user.funcao = 'client'
        user.aceita_marketing = self.cleaned_data.get('aceita_marketing', False)
        
        if commit:
            user.save()
        
        return user