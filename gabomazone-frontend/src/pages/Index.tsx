import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProductSection from "@/components/ProductSection";
import BenefitsSection from "@/components/BenefitsSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import BlogSection from "@/components/BlogSection";
import Footer from "@/components/Footer";

/**
 * Données d'exemple des produits
 * Prix en Franc CFA (FCFA)
 */
const newArrivals = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop",
    title: "T-Shirt Premium en Coton",
    price: 14950,
    originalPrice: 19990,
    discount: 25,
    isNew: true
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=400&fit=crop",
    title: "Robe d'Été Élégante",
    price: 44995,
    isNew: true
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400&h=400&fit=crop",
    title: "Veste en Jean Classique",
    price: 39995,
    originalPrice: 49995,
    discount: 20,
    isNew: true
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
    title: "Baskets de Sport",
    price: 64995,
    isNew: true
  }
];

const featuredProducts = [
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop",
    title: "Luxury Handbag",
    price: 199.99,
    originalPrice: 249.99,
    discount: 20
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1503341338655-b0138c3c3d51?w=400&h=400&fit=crop",
    title: "Designer Sunglasses",
    price: 149.99
  },
  {
    id: 7,
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop",
    title: "Casual Blazer",
    price: 159.99,
    originalPrice: 199.99,
    discount: 20
  },
  {
    id: 8,
    image: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=400&h=400&fit=crop",
    title: "Stylish Watch",
    price: 299.99
  }
];

const dealsOfTheWeek = [
  {
    id: 9,
    image: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400&h=400&fit=crop",
    title: "Cozy Winter Sweater",
    price: 49.99,
    originalPrice: 79.99,
    discount: 37
  },
  {
    id: 10,
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop",
    title: "Running Shorts",
    price: 24.99,
    originalPrice: 34.99,
    discount: 29
  },
  {
    id: 11,
    image: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5d?w=400&h=400&fit=crop",
    title: "Fashion Boots",
    price: 119.99,
    originalPrice: 159.99,
    discount: 25
  },
  {
    id: 12,
    image: "https://images.unsplash.com/photo-1622519407374-c2842527d3cc?w=400&h=400&fit=crop",
    title: "Yoga Leggings",
    price: 39.99,
    originalPrice: 59.99,
    discount: 33
  }
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <ProductSection title="Nouveautés" products={newArrivals} viewAllLink="/nouveautes" />
      <ProductSection title="Produits Vedettes" products={featuredProducts} viewAllLink="/vedettes" />
      <BenefitsSection />
      <ProductSection title="Offres de la Semaine" products={dealsOfTheWeek} viewAllLink="/offres" />
      <TestimonialsSection />
      <BlogSection />
      <Footer />
    </div>
  );
};

export default Index;
