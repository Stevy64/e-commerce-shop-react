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
}

const ProductSection = ({ title, products, viewAllLink }: ProductSectionProps) => {
  return (
    <section className="py-16">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-foreground">{title}</h2>
          {viewAllLink && (
            <Button variant="outline">Voir Tout</Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              image={product.image}
              title={product.title}
              price={product.price}
              originalPrice={product.originalPrice}
              discount={product.discount}
              isNew={product.isNew}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductSection;