import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useVendorAuth } from "@/hooks/useVendorAuth";
import { useVendor } from "@/hooks/useVendor";
import { useMessaging } from "@/hooks/useMessaging";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HelpCircle, Send, Mail, MessageCircle, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface SupportFormData {
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  channel: 'email' | 'message';
}

export default function VendorSupport() {
  const { user, loading, isVendor, shouldRedirectToAuth, shouldRedirectToBecomeVendor } = useVendorAuth();
  const { getVendorId } = useVendor();
  const { supportTickets, loading: messagingLoading, fetchSupportTickets } = useMessaging();
  const { toast } = useToast();
  const [formData, setFormData] = useState<SupportFormData>({
    subject: "",
    description: "",
    priority: 'medium',
    channel: 'message'
  });
  const [submitting, setSubmitting] = useState(false);

  // Load support tickets for current vendor
  useEffect(() => {
    const vendorId = getVendorId();
    if (user && isVendor && vendorId) {
      fetchSupportTickets(vendorId);
    }
  }, [user, isVendor, fetchSupportTickets, getVendorId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  if (shouldRedirectToAuth) {
    return <Navigate to="/auth" replace />;
  }

  if (shouldRedirectToBecomeVendor) {
    return <Navigate to="/become-vendor" replace />;
  }

  const handleInputChange = (field: keyof SupportFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.description.trim()) {
      return;
    }

    setSubmitting(true);
    
    try {
      const vendorId = getVendorId();
      if (!vendorId) {
        toast({
          title: "Erreur",
          description: "Erreur: Profil vendeur non trouvé",
          variant: "destructive"
        });
        return;
      }
      
      // Créer le ticket de support
      const { data: ticketData, error: ticketError } = await supabase
        .from('support_tickets')
        .insert({
          vendor_id: vendorId,
          subject: formData.subject.trim(),
          description: formData.description.trim(),
          priority: formData.priority,
          channel: formData.channel
        })
        .select('id')
        .single();

      if (ticketError) throw ticketError;

      // Envoyer l'email au super admin
      try {
        await supabase.functions.invoke('send-support-email', {
          body: {
            subject: formData.subject.trim(),
            message: formData.description.trim(),
            senderEmail: user?.email || '',
            senderName: user?.user_metadata?.display_name || 'Vendeur',
            ticketId: ticketData.id
          }
        });
      } catch (emailError) {
        console.error('Error sending support email:', emailError);
        // Ne pas bloquer le processus si l'email échoue
      }
      
      // Reset form
      setFormData({
        subject: "",
        description: "",
        priority: 'medium',
        channel: 'message'
      });
      
      toast({
        title: "Succès",
        description: "Ticket de support créé avec succès !"
      });
      
      // Refresh support tickets
      const currentVendorId = getVendorId();
      if (currentVendorId) {
        await fetchSupportTickets(currentVendorId);
      }
    } catch (error) {
      console.error('Erreur lors de la création du ticket:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la création du ticket de support",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: { variant: "secondary" as const, label: "Faible", icon: Clock },
      medium: { variant: "default" as const, label: "Moyenne", icon: Clock },
      high: { variant: "destructive" as const, label: "Haute", icon: AlertCircle },
      urgent: { variant: "destructive" as const, label: "Urgente", icon: AlertCircle }
    };
    
    const config = variants[priority as keyof typeof variants] || variants.medium;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      open: { variant: "default" as const, label: "Ouvert", icon: Clock },
      in_progress: { variant: "default" as const, label: "En cours", icon: Clock },
      resolved: { variant: "default" as const, label: "Résolu", icon: CheckCircle },
      closed: { variant: "secondary" as const, label: "Fermé", icon: CheckCircle }
    };
    
    const config = variants[status as keyof typeof variants] || variants.open;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" asChild>
              <Link to="/vendor-dashboard">
                ← Retour au Dashboard
              </Link>
            </Button>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <HelpCircle className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Support Vendeur</h1>
          </div>
          <p className="text-muted-foreground">
            Obtenez de l'aide de notre équipe support
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulaire de support */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Nouveau Ticket de Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="subject">Sujet *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    placeholder="Décrivez brièvement votre problème"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description détaillée *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Expliquez votre problème en détail..."
                    rows={5}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Priorité</Label>
                  <Select 
                    value={formData.priority} 
                    onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => handleInputChange('priority', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Faible - Question générale</SelectItem>
                      <SelectItem value="medium">Moyenne - Problème modéré</SelectItem>
                      <SelectItem value="high">Haute - Problème important</SelectItem>
                      <SelectItem value="urgent">Urgente - Problème critique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Canal de communication</Label>
                  <RadioGroup 
                    value={formData.channel} 
                    onValueChange={(value: 'email' | 'message') => handleInputChange('channel', value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="message" id="message" />
                      <Label htmlFor="message" className="flex items-center gap-2 cursor-pointer">
                        <MessageCircle className="h-4 w-4" />
                        Message direct (recommandé)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="email" id="email" />
                      <Label htmlFor="email" className="flex items-center gap-2 cursor-pointer">
                        <Mail className="h-4 w-4" />
                        Email
                      </Label>
                    </div>
                  </RadioGroup>
                  <p className="text-sm text-muted-foreground">
                    {formData.channel === 'message' 
                      ? 'Vous recevrez les réponses dans votre messagerie vendeur'
                      : 'Vous recevrez les réponses par email'
                    }
                  </p>
                </div>

                <Button type="submit" disabled={submitting} className="w-full gap-2">
                  <Send className="h-4 w-4" />
                  {submitting ? 'Envoi en cours...' : 'Envoyer le ticket'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Liste des tickets existants */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Mes Tickets de Support ({supportTickets.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                {messagingLoading ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Chargement des tickets...
                  </div>
                ) : supportTickets.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">Aucun ticket de support</h3>
                    <p>Vous n'avez pas encore créé de ticket de support</p>
                  </div>
                ) : (
                  <div className="space-y-4 p-4">
                    {supportTickets.map((ticket) => (
                      <Card key={ticket.id} className="shadow-sm">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium mb-1">{ticket.subject}</h4>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {ticket.description}
                              </p>
                            </div>
                            <div className="flex flex-col gap-1 ml-4">
                              {getStatusBadge(ticket.status)}
                              {getPriorityBadge(ticket.priority)}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                {ticket.channel === 'email' ? (
                                  <Mail className="h-3 w-3" />
                                ) : (
                                  <MessageCircle className="h-3 w-3" />
                                )}
                                {ticket.channel === 'email' ? 'Email' : 'Message'}
                              </span>
                              <span>#{ticket.id.slice(0, 8)}</span>
                            </div>
                            <span>
                              {format(new Date(ticket.created_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* FAQ/Aide rapide */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Questions Fréquentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Comment ajouter un produit ?</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Rendez-vous dans "Mes Produits" puis cliquez sur "Nouveau Produit" pour créer votre article.
                </p>

                <h4 className="font-medium mb-2">Comment gérer mes commandes ?</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Consultez la page "Mes Commandes" pour voir, traiter et mettre à jour vos commandes.
                </p>

                <h4 className="font-medium mb-2">Comment modifier mon profil vendeur ?</h4>
                <p className="text-sm text-muted-foreground">
                  Accédez à votre tableau de bord vendeur, onglet "Profil Vendeur" pour modifier vos informations.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Problème de paiement ?</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Créez un ticket de support avec priorité "Haute" pour les problèmes de paiement.
                </p>

                <h4 className="font-medium mb-2">Temps de réponse du support</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  • Urgente: 2-4 heures<br />
                  • Haute: 4-8 heures<br />
                  • Moyenne: 24 heures<br />
                  • Faible: 48 heures
                </p>

                <h4 className="font-medium mb-2">Contact direct</h4>
                <p className="text-sm text-muted-foreground">
                  Pour les urgences: support@gabomazone.com
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}