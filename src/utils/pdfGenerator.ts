/**
 * Utilitaires pour la génération de documents PDF
 * Gabomazone - Système de facturation
 */

import { formatPrice } from "./currency";

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  products: {
    id: string;
    title: string;
    image_url: string;
  };
}

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  order_items: OrderItem[];
}

/**
 * Génère le contenu d'une facture au format texte
 * @param order - Commande pour laquelle générer la facture
 * @returns Contenu de la facture au format texte
 */
export const generateInvoiceContent = (order: Order): string => {
  const invoiceDate = new Date().toLocaleDateString('fr-FR');
  const orderDate = new Date(order.created_at).toLocaleDateString('fr-FR');
  
  return `
╔══════════════════════════════════════════════════════════════════════════════╗
║                              FACTURE GABOMAZONE                             ║
╚══════════════════════════════════════════════════════════════════════════════╝

Numéro de facture: #${order.id.substring(0, 8).toUpperCase()}
Date de facturation: ${invoiceDate}
Date de commande: ${orderDate}
Statut: ${getStatusText(order.status)}

────────────────────────────────────────────────────────────────────────────────
INFORMATIONS CLIENT
────────────────────────────────────────────────────────────────────────────────
[Les informations client seraient récupérées depuis le profil utilisateur]

────────────────────────────────────────────────────────────────────────────────
DÉTAIL DES ARTICLES
────────────────────────────────────────────────────────────────────────────────

${order.order_items.map((item, index) => 
  `${index + 1}. ${item.products.title}
   Quantité: ${item.quantity}
   Prix unitaire: ${formatPrice(item.price)}
   Total ligne: ${formatPrice(item.price * item.quantity)}`
).join('\n\n')}

────────────────────────────────────────────────────────────────────────────────
RÉCAPITULATIF
────────────────────────────────────────────────────────────────────────────────

Sous-total: ${formatPrice(order.total_amount)}
Frais de livraison: Gratuit
TVA (0%): 0 FCFA

TOTAL À PAYER: ${formatPrice(order.total_amount)}

────────────────────────────────────────────────────────────────────────────────
INFORMATIONS LÉGALES
────────────────────────────────────────────────────────────────────────────────

Gabomazone SARL
Siège social: Libreville, Gabon
Email: support@gabomazone.ga
Téléphone: +241 XX XX XX XX

Merci pour votre confiance !
Votre satisfaction est notre priorité.

Pour toute question concernant cette facture, 
contactez notre service client: support@gabomazone.ga

────────────────────────────────────────────────────────────────────────────────
Document généré automatiquement le ${invoiceDate}
  `;
};

/**
 * Retourne le texte français du statut de commande
 * @param status - Statut de la commande
 * @returns Texte français du statut
 */
const getStatusText = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'En attente de validation';
    case 'confirmed':
      return 'Validée';
    case 'shipping':
      return 'En cours de livraison';
    case 'delivered':
      return 'Livrée';
    case 'cancelled':
      return 'Annulée';
    default:
      return status;
  }
};

/**
 * Télécharge une facture au format PDF (simulation avec fichier texte)
 * @param order - Commande pour laquelle télécharger la facture
 */
export const downloadInvoice = (order: Order): void => {
  const invoiceContent = generateInvoiceContent(order);
  
  // Création d'un blob avec le contenu de la facture
  const blob = new Blob([invoiceContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  // Création d'un lien temporaire pour le téléchargement
  const link = document.createElement('a');
  link.href = url;
  link.download = `facture-gabomazone-${order.id.substring(0, 8)}.txt`;
  
  // Ajout au DOM, clic automatique, puis suppression
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Nettoyage de l'URL d'objet
  URL.revokeObjectURL(url);
};