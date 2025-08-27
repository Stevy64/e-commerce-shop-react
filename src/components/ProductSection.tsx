import ProductCard from "./ProductCard";
import { Button } from "@/components/ui/button";

interface Product {
  id: number;
  image: string;
  title: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  isNew?: boolean;
}

interface ProductSectionProps {
  title: string;
  products: Product[];
  viewAllLink?: string;
  onQuickView?: (product: any) => void;
}

/**
 * Section d'affichage des produits
 * @param title - Titre de la section
 * @param products - Liste des produits à afficher
 * @param viewAllLink - Lien vers la page complète (optionnel)
 * @param onQuickView - Fonction appelée lors du clic sur l'aperçu rapide
 */
const ProductSection = ({ title, products, viewAllLink, onQuickView }: ProductSectionProps) => {
  return (
    <section className="py-16">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-foreground">{title}</h2>
          {viewAllLink && (
            <Button variant="outline">Voir Tout</Button>
          )}
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            // Conversion du produit local vers le format attendu par ProductQuickView
            const productForQuickView = {
              id: product.id.toString(),
              title: product.title,
              image_url: product.image,
              price: product.price,
              original_price: product.originalPrice,
              discount: product.discount,
              is_new: product.isNew,
              description: `Découvrez ce magnifique produit : ${product.title}`
            };

            return (
              <div key={product.id} onClick={() => onQuickView?.(productForQuickView)}>
                <ProductCard
                  id={product.id.toString()}
                  image={product.image}
                  title={product.title}
                  price={product.price}
                  originalPrice={product.originalPrice}
                  discount={product.discount}
                  isNew={product.isNew}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProductSection;