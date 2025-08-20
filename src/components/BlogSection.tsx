import { Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const blogPosts = [
  {
    id: 1,
    title: "The Ultimate Guide to Summer Fashion Trends 2024",
    excerpt: "Discover the hottest fashion trends for this summer season and learn how to incorporate them into your wardrobe...",
    author: "Jessica Miller",
    date: "March 15, 2024",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=250&fit=crop"
  },
  {
    id: 2,
    title: "Sustainable Fashion: Making Conscious Choices",
    excerpt: "Learn about sustainable fashion practices and how to build an eco-friendly wardrobe that looks great...",
    author: "David Wilson",
    date: "March 12, 2024",
    image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&h=250&fit=crop"
  },
  {
    id: 3,
    title: "How to Style Your Outfit for Any Occasion",
    excerpt: "From casual meetups to formal events, discover styling tips that will help you look your best at any occasion...",
    author: "Sophie Anderson",
    date: "March 10, 2024",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=250&fit=crop"
  }
];

const BlogSection = () => {
  return (
    <section className="py-16">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Latest from Our Blog</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Stay updated with the latest fashion trends, styling tips, and industry insights from our fashion experts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <Card key={post.id} className="group overflow-hidden border-0 shadow-sm hover:shadow-lg transition-shadow duration-300">
              <div className="aspect-video overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              
              <CardContent className="p-6">
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {post.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {post.author}
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                
                <p className="text-muted-foreground line-clamp-3 mb-4">
                  {post.excerpt}
                </p>
                
                <Button variant="outline" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  Read More
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <Button variant="outline">View All Articles</Button>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;