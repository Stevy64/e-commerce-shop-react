import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, ShoppingCart, Share2, Star, Minus, Plus } from "lucide-react";
import { useState } from "react";

const ProductDetails = () => {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const productImages = [
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=600&fit=crop"
  ];

  const relatedProducts = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&h=400&fit=crop",
      title: "Modern Armchair",
      price: 180.00,
      originalPrice: 200.00,
      discount: 10,
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop",
      title: "Luxury Sofa",
      price: 450.00,
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
      title: "Designer Chair",
      price: 220.00,
      originalPrice: 250.00,
      discount: 12,
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&h=400&fit=crop",
      title: "Comfort Seat",
      price: 160.00,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Breadcrumb */}
      <section className="bg-muted py-4">
        <div className="container">
          <div className="flex items-center text-sm text-muted-foreground">
            <span>Home</span>
            <span className="mx-2">/</span>
            <span>Shop</span>
            <span className="mx-2">/</span>
            <span>Chairs</span>
            <span className="mx-2">/</span>
            <span className="text-foreground">Alexander roll Arm sofa</span>
          </div>
        </div>
      </section>

      {/* Product Details */}
      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Product Images */}
            <div>
              <div className="mb-4">
                <img
                  src={productImages[selectedImage]}
                  alt="Product"
                  className="w-full h-96 object-cover rounded-lg"
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`border-2 rounded-lg overflow-hidden ${
                      selectedImage === index ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Product ${index + 1}`}
                      className="w-full h-20 object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div>
              <Badge variant="secondary" className="mb-4">New Arrival</Badge>
              
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Alexander roll Arm sofa
              </h1>
              
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                  ))}
                </div>
                <span className="text-muted-foreground">(4.8) 127 Reviews</span>
              </div>
              
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-3xl font-bold text-primary">$150.00</span>
                <span className="text-xl text-muted-foreground line-through">$170.00</span>
                <Badge variant="destructive">10% OFF</Badge>
              </div>
              
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Experience ultimate comfort with our Alexander roll arm sofa. Crafted with premium materials 
                and designed for modern living spaces, this sofa combines style with functionality. The rolled 
                arms and plush cushioning provide exceptional comfort for everyday use.
              </p>
              
              <div className="space-y-6 mb-8">
                <div className="flex items-center space-x-4">
                  <span className="font-medium">Color:</span>
                  <div className="flex space-x-2">
                    <button className="w-8 h-8 rounded-full bg-blue-500 border-2 border-primary"></button>
                    <button className="w-8 h-8 rounded-full bg-gray-500 border-2 border-transparent"></button>
                    <button className="w-8 h-8 rounded-full bg-green-500 border-2 border-transparent"></button>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className="font-medium">Size:</span>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">Small</Button>
                    <Button variant="outline" size="sm" className="border-primary">Medium</Button>
                    <Button variant="outline" size="sm">Large</Button>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className="font-medium">Quantity:</span>
                  <div className="flex items-center border rounded-md">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="px-4 py-2">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-4 mb-8">
                <Button size="lg" className="flex-1">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
                <Button variant="outline" size="lg">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="text-sm text-muted-foreground space-y-2">
                <p><strong>SKU:</strong> ADDINA-001</p>
                <p><strong>Category:</strong> Chairs, Living Room</p>
                <p><strong>Tags:</strong> Modern, Comfort, Premium</p>
              </div>
            </div>
          </div>

          {/* Product Tabs */}
          <Tabs defaultValue="description" className="mb-16">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews (127)</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="mt-8">
              <Card>
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4">Product Description</h3>
                  <div className="prose max-w-none">
                    <p className="mb-4">
                      The Alexander roll arm sofa represents the perfect blend of comfort and contemporary design. 
                      This exceptional piece is crafted with premium materials and attention to detail that ensures 
                      both durability and style for your living space.
                    </p>
                    <p className="mb-4">
                      Featuring a classic rolled arm design with modern proportions, this sofa provides excellent 
                      support while maintaining an elegant silhouette. The high-quality foam cushioning offers 
                      superior comfort for extended relaxation.
                    </p>
                    <p>
                      Whether you're entertaining guests or enjoying a quiet evening at home, the Alexander sofa 
                      delivers the perfect combination of style, comfort, and functionality that will enhance any 
                      living room setting.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="specifications" className="mt-8">
              <Card>
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4">Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Dimensions</h4>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>Width: 84 inches</li>
                        <li>Depth: 36 inches</li>
                        <li>Height: 34 inches</li>
                        <li>Seat Height: 18 inches</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Materials</h4>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>Frame: Hardwood</li>
                        <li>Upholstery: Premium Fabric</li>
                        <li>Cushioning: High-density foam</li>
                        <li>Legs: Solid wood</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-8">
              <Card>
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-6">Customer Reviews</h3>
                  <div className="space-y-6">
                    {[1, 2, 3].map((review) => (
                      <div key={review} className="border-b pb-6 last:border-b-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold">John Smith</span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                              ))}
                            </div>
                          </div>
                          <span className="text-sm text-muted-foreground">2 days ago</span>
                        </div>
                        <p className="text-muted-foreground">
                          Excellent quality sofa! Very comfortable and looks great in our living room. 
                          The delivery was fast and the customer service was outstanding.
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Related Products */}
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-8">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  id={product.id.toString()}
                  image={product.image}
                  title={product.title}
                  price={product.price}
                  originalPrice={product.originalPrice}
                  discount={product.discount}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProductDetails;