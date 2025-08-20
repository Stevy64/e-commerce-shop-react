import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Blog = () => {
  const blogPosts = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop",
      title: "Colour ideas for kitchen and dining spaces",
      excerpt: "Lorem ipsum dolor sit amet consectetur adipiscing elit Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien fringilla, mattis ligula consectetur, ultrices mauris. Maecenas vitae mattis tellus.",
      author: "Alex Manie",
      date: "January 22, 2022",
      comments: 35,
      category: "Interior Design"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=400&fit=crop",
      title: "Modern furniture trends for 2024",
      excerpt: "Discover the latest trends in modern furniture design and how to incorporate them into your home. From minimalist aesthetics to bold statement pieces, explore what's trending this year.",
      author: "Sarah Johnson",
      date: "January 20, 2022",
      comments: 28,
      category: "Trends"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&h=400&fit=crop",
      title: "How to choose the perfect sofa for your living room",
      excerpt: "A comprehensive guide to selecting the ideal sofa that combines comfort, style, and functionality. Learn about different materials, sizes, and configurations.",
      author: "Mike Davis",
      date: "January 18, 2022",
      comments: 42,
      category: "Furniture Guide"
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop",
      title: "Small space, big style: Maximizing tiny homes",
      excerpt: "Transform your small living space into a stylish and functional home with these expert tips and space-saving furniture solutions.",
      author: "Emma Wilson",
      date: "January 15, 2022",
      comments: 31,
      category: "Small Spaces"
    },
    {
      id: 5,
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=400&fit=crop",
      title: "Sustainable furniture: Eco-friendly choices",
      excerpt: "Learn about sustainable furniture options and how to make environmentally conscious choices for your home without compromising on style or quality.",
      author: "David Brown",
      date: "January 12, 2022",
      comments: 19,
      category: "Sustainability"
    },
    {
      id: 6,
      image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&h=400&fit=crop",
      title: "The art of mixing vintage and modern furniture",
      excerpt: "Discover how to successfully blend vintage pieces with modern furniture to create a unique and personalized interior design that tells your story.",
      author: "Lisa Chen",
      date: "January 10, 2022",
      comments: 25,
      category: "Design Tips"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Page Header */}
      <section className="bg-muted py-16">
        <div className="container">
          <h1 className="text-5xl font-bold text-foreground mb-4">Blog Classic</h1>
          <p className="text-lg text-muted-foreground">Stay updated with the latest furniture trends and home decor ideas</p>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="space-y-12">
                {blogPosts.map((post) => (
                  <Card key={post.id} className="overflow-hidden border-0 shadow-sm">
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                    <CardContent className="p-8">
                      <div className="flex items-center space-x-4 mb-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          By {post.author}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {post.date}
                        </div>
                        <div className="flex items-center">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          {post.comments}
                        </div>
                      </div>
                      
                      <Badge variant="secondary" className="mb-4">
                        {post.category}
                      </Badge>
                      
                      <h2 className="text-2xl font-bold text-foreground mb-4 hover:text-primary transition-colors">
                        <Link to={`/blog/${post.id}`}>
                          {post.title}
                        </Link>
                      </h2>
                      
                      <p className="text-muted-foreground mb-6 leading-relaxed">
                        {post.excerpt}
                      </p>
                      
                      <Button asChild>
                        <Link to={`/blog/${post.id}`}>
                          Read More
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex justify-center mt-12">
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">Previous</Button>
                  <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">1</Button>
                  <Button variant="outline" size="sm">2</Button>
                  <Button variant="outline" size="sm">3</Button>
                  <Button variant="outline" size="sm">Next</Button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="space-y-8">
                {/* Recent Posts */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Recent Posts</h3>
                    <div className="space-y-4">
                      {blogPosts.slice(0, 3).map((post) => (
                        <div key={post.id} className="flex space-x-3">
                          <img
                            src={post.image}
                            alt={post.title}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h4 className="text-sm font-medium line-clamp-2 hover:text-primary">
                              <Link to={`/blog/${post.id}`}>
                                {post.title}
                              </Link>
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1">{post.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Categories */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Categories</h3>
                    <div className="space-y-2">
                      {["Interior Design", "Trends", "Furniture Guide", "Small Spaces", "Sustainability", "Design Tips"].map((category) => (
                        <div key={category} className="flex justify-between items-center">
                          <span className="text-sm hover:text-primary cursor-pointer">{category}</span>
                          <Badge variant="outline" className="text-xs">
                            {Math.floor(Math.random() * 10) + 1}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Tags */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {["furniture", "design", "modern", "vintage", "minimalist", "home", "decor", "style"].map((tag) => (
                        <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;