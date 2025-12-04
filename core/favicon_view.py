from django.http import HttpResponse
from django.views.decorators.cache import cache_control
import base64

@cache_control(max_age=86400)  # Cache por 1 dia
def favicon_view(request):
    """
    Favicon simples em SVG
    """
    favicon_svg = '''
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="#667eea"/>
        <text x="50" y="60" font-family="Arial" font-size="45" fill="white" text-anchor="middle">🚗</text>
    </svg>
    '''
    return HttpResponse(favicon_svg, content_type='image/svg+xml')
