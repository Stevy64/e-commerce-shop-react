import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageSquare, Users, Send, Filter, Plus, Search, Clock, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import ConversationDetailsDialog from "@/components/ConversationDetailsDialog";

interface Conversation {
  id: string;
  title: string;
  type: string;
  created_at: string;
  last_message_at: string;
  conversation_participants: Array<{
    user_id: string;
    role: string;
    profiles: {
      display_name: string;
      first_name: string;
      last_name: string;
    };
  }>;
}

interface Vendor {
  id: string;
  business_name: string;
  user_id: string;
  profiles: {
    display_name: string;
    first_name: string;
    last_name: string;
  };
}

export default function SuperAdminMessaging() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [conversationDialogOpen, setConversationDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [createLoading, setCreateLoading] = useState(false);
  const [newConversation, setNewConversation] = useState({
    title: "",
    vendorId: "",
    initialMessage: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Récupérer les conversations
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select(`
          *,
          conversation_participants (
            user_id,
            role,
            profiles (
              display_name,
              first_name,
              last_name
            )
          )
        `)
        .order('last_message_at', { ascending: false });

      if (conversationsError) throw conversationsError;
      setConversations((conversationsData as any) || []);

      // Récupérer les vendeurs
      const { data: vendorsData, error: vendorsError } = await supabase
        .from('vendors')
        .select(`
          id,
          business_name,
          user_id,
          profiles (
            display_name,
            first_name,
            last_name
          )
        `)
        .eq('status', 'approved')
        .order('business_name');

      if (vendorsError) throw vendorsError;
      setVendors((vendorsData as any) || []);

    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les données",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);

    try {
      const selectedVendor = vendors.find(v => v.id === newConversation.vendorId);
      if (!selectedVendor) {
        throw new Error('Vendeur non trouvé');
      }

      // Créer la conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          title: newConversation.title,
          type: 'support'
        })
        .select()
        .single();

      if (convError) throw convError;

      // Ajouter les participants
      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert([
          {
            conversation_id: conversation.id,
            user_id: user!.id,
            role: 'admin'
          },
          {
            conversation_id: conversation.id,
            user_id: selectedVendor.user_id,
            role: 'participant'
          }
        ]);

      if (participantsError) throw participantsError;

      // Ajouter le message initial si fourni
      if (newConversation.initialMessage) {
        const { error: messageError } = await supabase
          .from('messages')
          .insert({
            conversation_id: conversation.id,
            sender_id: user!.id,
            content: newConversation.initialMessage,
            message_type: 'text'
          });

        if (messageError) throw messageError;
      }

      toast({
        title: "Conversation créée",
        description: "La conversation a été créée avec succès",
      });

      setIsCreateDialogOpen(false);
      setNewConversation({ title: "", vendorId: "", initialMessage: "" });
      fetchData();

    } catch (error) {
      console.error('Erreur lors de la création:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer la conversation",
      });
    } finally {
      setCreateLoading(false);
    }
  };

  const openConversationDetails = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setConversationDialogOpen(true);
  };

  const filteredConversations = conversations.filter(conversation => {
    const matchesSearch = conversation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conversation.conversation_participants.some(p => 
                           p.profiles?.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           p.profiles?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           p.profiles?.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    const matchesFilter = filterType === "all" || conversation.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getConversationParticipants = (conversation: Conversation) => {
    return conversation.conversation_participants
      .filter(p => p.user_id !== user?.id)
      .map(p => p.profiles?.display_name || p.profiles?.first_name || 'Utilisateur')
      .join(', ');
  };

  const getConversationTypeLabel = (type: string) => {
    switch (type) {
      case 'support': return 'Support';
      case 'direct': return 'Direct';
      case 'group': return 'Groupe';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p>Chargement des conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Messagerie Admin</h2>
          <p className="text-muted-foreground">Gérez les conversations avec les vendeurs et clients</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Conversation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Créer une conversation</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateConversation} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Titre de la conversation *</Label>
                <Input
                  id="title"
                  value={newConversation.title}
                  onChange={(e) => setNewConversation(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Objet de la conversation"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vendor">Vendeur *</Label>
                <Select 
                  value={newConversation.vendorId} 
                  onValueChange={(value) => setNewConversation(prev => ({ ...prev, vendorId: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un vendeur" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors.map((vendor) => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        {vendor.business_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="initialMessage">Message initial (optionnel)</Label>
                <Textarea
                  id="initialMessage"
                  value={newConversation.initialMessage}
                  onChange={(e) => setNewConversation(prev => ({ ...prev, initialMessage: e.target.value }))}
                  placeholder="Tapez votre message..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={createLoading}>
                  <Send className="h-4 w-4 mr-2" />
                  {createLoading ? "Création..." : "Créer"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{conversations.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Support</p>
                <p className="text-2xl font-bold">{conversations.filter(c => c.type === 'support').length}</p>
              </div>
              <Badge variant="default" className="h-8 w-8 rounded-full p-0 flex items-center justify-center" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Directes</p>
                <p className="text-2xl font-bold">{conversations.filter(c => c.type === 'direct').length}</p>
              </div>
              <Badge variant="secondary" className="h-8 w-8 rounded-full p-0 flex items-center justify-center" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vendeurs actifs</p>
                <p className="text-2xl font-bold">{vendors.length}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Rechercher par titre ou participant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filtrer par type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="support">Support</SelectItem>
            <SelectItem value="direct">Direct</SelectItem>
            <SelectItem value="group">Groupe</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Liste des conversations */}
      {filteredConversations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm || filterType !== "all" ? "Aucune conversation trouvée" : "Aucune conversation"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || filterType !== "all" 
                ? "Essayez de modifier vos critères de recherche" 
                : "Créez votre première conversation avec un vendeur"
              }
            </p>
            {(!searchTerm && filterType === "all") && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Créer une conversation
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredConversations.map((conversation) => (
            <Card key={conversation.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold line-clamp-1">{conversation.title}</h3>
                      <Badge variant="outline">
                        {getConversationTypeLabel(conversation.type)}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>Participants: {getConversationParticipants(conversation)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>
                          Dernière activité: {' '}
                          {format(new Date(conversation.last_message_at || conversation.created_at), 'PPp', { locale: fr })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openConversationDetails(conversation.id)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Ouvrir
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog de détails de conversation */}
      <ConversationDetailsDialog
        conversationId={selectedConversationId}
        open={conversationDialogOpen}
        onOpenChange={setConversationDialogOpen}
      />
    </div>
  );
}