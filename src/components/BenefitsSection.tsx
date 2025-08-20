import { Truck, Shield, Headphones, Award } from "lucide-react";

const benefits = [
  {
    icon: Truck,
    title: "Free Delivery",
    description: "Free shipping on orders over $50"
  },
  {
    icon: Shield,
    title: "Money Back Guarantee",
    description: "30-day money back guarantee"
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Round-the-clock customer service"
  },
  {
    icon: Award,
    title: "Reliability",
    description: "Trusted by thousands of customers"
  }
];

const BenefitsSection = () => {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;