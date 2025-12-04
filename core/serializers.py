from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, Notification


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer para o modelo User
    """
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 
            'phone', 'role', 'birth_date', 'address', 'loyalty_points',
            'is_active', 'created_at', 'password'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'loyalty_points': {'read_only': True},
            'created_at': {'read_only': True},
        }
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user
    
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if password:
            instance.set_password(password)
        
        instance.save()
        return instance


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer para perfil do usuário (sem campos sensíveis)
    """
    full_name = serializers.CharField(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'phone', 'role', 'birth_date', 'address', 'loyalty_points',
            'created_at'
        ]
        read_only_fields = ['username', 'role', 'loyalty_points', 'created_at']


class LoginSerializer(serializers.Serializer):
    """
    Serializer para login
    """
    email = serializers.EmailField()
    password = serializers.CharField()
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError('Credenciais inválidas.')
            if not user.is_active:
                raise serializers.ValidationError('Conta desativada.')
            attrs['user'] = user
        else:
            raise serializers.ValidationError('Email e senha são obrigatórios.')
        
        return attrs


class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer para registro de novos usuários
    """
    password = serializers.CharField(write_only=True, min_length=6)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'first_name', 'last_name', 'phone',
            'password', 'password_confirm'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError('As senhas não coincidem.')
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user


class NotificationSerializer(serializers.ModelSerializer):
    """
    Serializer para notificações
    """
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id', 'title', 'message', 'type', 'is_read', 
            'created_at', 'user', 'user_name'
        ]
        read_only_fields = ['created_at']
