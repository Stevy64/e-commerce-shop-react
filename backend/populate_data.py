"""
Script pour peupler la base de données avec des données de test.

Ce script ajoute des produits de démonstration pour tester l'API
et montrer le fonctionnement de l'e-commerce ADDINA.
"""

import os
import django
from decimal import Decimal

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_api.settings')
django.setup()

from shop.models import Product

def create_sample_products():
    """Créer des produits de démonstration"""
    
    products_data = [
        {
            'title': 'Smartphone Samsung Galaxy A54',
            'description': 'Smartphone Android avec écran AMOLED 6.4", 128GB de stockage, appareil photo 50MP. Parfait pour la photographie et les réseaux sociaux.',
            'price': Decimal('285000'),
            'original_price': Decimal('320000'),
            'discount': Decimal('10.94'),
            'is_new': True,
        },
        {
            'title': 'Ordinateur Portable HP Pavilion',
            'description': 'PC portable 15.6" avec processeur Intel Core i5, 8GB RAM, SSD 256GB. Idéal pour le travail et les études.',
            'price': Decimal('450000'),
            'original_price': Decimal('500000'),
            'discount': Decimal('10.00'),
            'is_new': True,
        },
        {
            'title': 'Casque Audio Sony WH-1000XM4',
            'description': 'Casque sans fil avec réduction de bruit active, autonomie 30h, qualité audio premium. Parfait pour la musique et les appels.',
            'price': Decimal('180000'),
            'is_new': False,
        },
        {
            'title': 'Montre Connectée Apple Watch SE',
            'description': 'Montre intelligente avec suivi de la santé, GPS, résistance à l\'eau. Compatible iPhone.',
            'price': Decimal('220000'),
            'original_price': Decimal('250000'),
            'discount': Decimal('12.00'),
            'is_new': True,
        },
        {
            'title': 'Tablette iPad Air 10.9"',
            'description': 'Tablette Apple avec puce M1, écran Liquid Retina, 64GB. Parfaite pour la créativité et la productivité.',
            'price': Decimal('380000'),
            'is_new': False,
        },
        {
            'title': 'Console PlayStation 5',
            'description': 'Console de jeu nouvelle génération avec SSD ultra-rapide, ray tracing, manette DualSense.',
            'price': Decimal('350000'),
            'original_price': Decimal('400000'),
            'discount': Decimal('12.50'),
            'is_new': True,
        },
        {
            'title': 'Écouteurs AirPods Pro',
            'description': 'Écouteurs sans fil avec réduction de bruit active, son spatial, boîtier de charge sans fil.',
            'price': Decimal('150000'),
            'is_new': False,
        },
        {
            'title': 'Caméra Canon EOS R50',
            'description': 'Appareil photo mirrorless 24.2MP, vidéo 4K, écran tactile orientable. Parfait pour la photographie créative.',
            'price': Decimal('420000'),
            'original_price': Decimal('480000'),
            'discount': Decimal('12.50'),
            'is_new': True,
        },
        {
            'title': 'Enceinte JBL Charge 5',
            'description': 'Enceinte Bluetooth portable, étanche IP67, autonomie 20h, son puissant 360°.',
            'price': Decimal('85000'),
            'is_new': False,
        },
        {
            'title': 'Clavier Gaming Logitech G915',
            'description': 'Clavier mécanique sans fil, switches tactiles, rétroéclairage RGB, autonomie 40h.',
            'price': Decimal('120000'),
            'original_price': Decimal('140000'),
            'discount': Decimal('14.29'),
            'is_new': True,
        }
    ]
    
    created_products = []
    
    for product_data in products_data:
        product, created = Product.objects.get_or_create(
            title=product_data['title'],
            defaults=product_data
        )
        
        if created:
            created_products.append(product)
            print(f"✓ Produit créé: {product.title} - {product.price} FCFA")
        else:
            print(f"- Produit existant: {product.title}")
    
    return created_products

if __name__ == '__main__':
    print("🚀 Création des produits de démonstration pour ADDINA E-commerce...")
    print("=" * 60)
    
    products = create_sample_products()
    
    print("=" * 60)
    print(f"✅ {len(products)} nouveaux produits créés avec succès!")
    print("\nProduits disponibles:")
    
    all_products = Product.objects.all()
    for product in all_products:
        status = "🆕 NOUVEAU" if product.is_new else "📦 Standard"
        discount_info = f" (-{product.discount}%)" if product.discount else ""
        print(f"  • {product.title}: {product.price} FCFA{discount_info} {status}")
    
    print(f"\n📊 Total: {all_products.count()} produits dans la base de données")
    print("🎯 L'API Django est prête à remplacer Supabase!")

