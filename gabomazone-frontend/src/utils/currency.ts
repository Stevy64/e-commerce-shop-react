/**
 * Utilitaires pour la gestion des devises
 * Formatage des prix en Franc CFA (FCFA)
 */

/**
 * Formate un prix en FCFA avec la devise
 * @param price - Le prix à formater
 * @returns Le prix formaté avec la devise FCFA
 */
export const formatPrice = (price: number): string => {
  return `${price.toLocaleString('fr-FR')} FCFA`;
};

/**
 * Formate un prix avec remise
 * @param price - Prix actuel
 * @param originalPrice - Prix original
 * @returns Objet avec prix formaté et pourcentage de remise
 */
export const formatPriceWithDiscount = (price: number, originalPrice: number) => {
  const discount = Math.round(((originalPrice - price) / originalPrice) * 100);
  return {
    currentPrice: formatPrice(price),
    originalPrice: formatPrice(originalPrice),
    discount: `${discount}%`
  };
};