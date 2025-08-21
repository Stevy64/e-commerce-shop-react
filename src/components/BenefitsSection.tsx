import { Truck, Shield, Headphones, Award } from "lucide-react";

/**
 * Liste des avantages et services proposés
 * Affichage des points forts de l'entreprise avec icônes
 */
const benefits = [
  {
    icon: Truck,
    title: "Livraison Gratuite",
    description: "Livraison gratuite sur les commandes de plus de 25 000 FCFA"
  },
  {
    icon: Shield,
    title: "Garantie Satisfait ou Remboursé",
    description: "Garantie de remboursement sous 30 jours"
  },
  {
    icon: Headphones,
    title: "Support 24h/7j",
    description: "Service client disponible en permanence"
  },
  {
    icon: Award,
    title: "Fiabilité",
    description: "Fait confiance par des milliers de clients"
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