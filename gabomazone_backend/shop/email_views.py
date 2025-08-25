"""
Vues personnalisées pour la gestion des emails de confirmation.

Intègre allauth avec l'API REST pour Gabomazone.
"""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from allauth.account.models import EmailAddress, EmailConfirmation
from allauth.account import app_settings
from django.core.mail import send_mail
from django.urls import reverse
import uuid


@api_view(['POST'])
@permission_classes([AllowAny])
def register_with_email_confirmation(request):
    """
    Inscription avec envoi automatique d'email de confirmation.
    
    Remplace l'inscription Supabase avec confirmation email.
    """
    try:
        data = request.data
        
        # Validation des données
        required_fields = ['username', 'email', 'password', 'password_confirm']
        for field in required_fields:
            if field not in data or not data[field]:
                return Response({
                    'error': f'Le champ {field} est requis'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        if data['password'] != data['password_confirm']:
            return Response({
                'error': 'Les mots de passe ne correspondent pas'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if len(data['password']) < 8:
            return Response({
                'error': 'Le mot de passe doit contenir au moins 8 caractères'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Vérifier si l'utilisateur existe déjà
        if User.objects.filter(username=data['username']).exists():
            return Response({
                'error': 'Ce nom d\'utilisateur est déjà utilisé'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if User.objects.filter(email=data['email']).exists():
            return Response({
                'error': 'Cette adresse email est déjà utilisée'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Créer l'utilisateur (inactif jusqu'à confirmation email)
        user = User.objects.create_user(
            username=data['username'],
            email=data['email'],
            password=data['password'],
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', ''),
            is_active=False  # Inactif jusqu'à confirmation
        )
        
        # Créer l'adresse email dans allauth
        email_address = EmailAddress.objects.create(
            user=user,
            email=data['email'],
            verified=False,
            primary=True
        )
        
        # Créer la confirmation email
        confirmation = EmailConfirmation.create(email_address)
        confirmation.save()
        
        # Envoyer l'email de confirmation
        confirmation_url = f"http://localhost:8000/api/auth/confirm-email/{confirmation.key}/"
        
        subject = "Confirmez votre compte Gabomazone"
        message = f"""
Bonjour {user.username},

Merci de vous être inscrit sur Gabomazone !

Pour activer votre compte, cliquez sur le lien suivant :
{confirmation_url}

Ce lien expire dans 3 jours.

L'équipe Gabomazone
        """
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )
        
        return Response({
            'message': 'Compte créé avec succès ! Un email de confirmation a été envoyé.',
            'user_id': user.id,
            'email': user.email,
            'confirmation_sent': True
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'error': f'Erreur lors de la création du compte: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def resend_confirmation_email(request):
    """
    Renvoyer l'email de confirmation.
    """
    try:
        email = request.data.get('email')
        if not email:
            return Response({
                'error': 'L\'adresse email est requise'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
            if user.is_active:
                return Response({
                    'error': 'Ce compte est déjà activé'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Créer une nouvelle confirmation
            email_address = EmailAddress.objects.get(user=user, email=email)
            confirmation = EmailConfirmation.create(email_address)
            confirmation.save()
            
            # Envoyer l'email
            confirmation_url = f"http://localhost:8000/api/auth/confirm-email/{confirmation.key}/"
            subject = "Confirmez votre compte Gabomazone"
            message = f"""
Bonjour {user.username},

Voici votre nouveau lien de confirmation :
{confirmation_url}

Ce lien expire dans 3 jours.

L'équipe Gabomazone
            """
            
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )
            
            return Response({
                'message': 'Email de confirmation renvoyé avec succès'
            }, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            return Response({
                'error': 'Aucun compte trouvé avec cette adresse email'
            }, status=status.HTTP_404_NOT_FOUND)
            
    except Exception as e:
        return Response({
            'error': f'Erreur lors de l\'envoi: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def confirm_email_api(request, key):
    """
    Confirmer l'email via API (pour les liens dans les emails).
    """
    try:
        confirmation = EmailConfirmation.objects.get(key=key)
        
        if confirmation.email_address.verified:
            return Response({
                'message': 'Cette adresse email est déjà confirmée',
                'already_confirmed': True
            }, status=status.HTTP_200_OK)
        
        # Confirmer l'email
        confirmation.confirm(request)
        
        # Activer l'utilisateur
        user = confirmation.email_address.user
        user.is_active = True
        user.save()
        
        return Response({
            'message': 'Email confirmé avec succès ! Votre compte est maintenant actif.',
            'user_id': user.id,
            'email': user.email,
            'confirmed': True
        }, status=status.HTTP_200_OK)
        
    except EmailConfirmation.DoesNotExist:
        return Response({
            'error': 'Lien de confirmation invalide ou expiré'
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'error': f'Erreur lors de la confirmation: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

