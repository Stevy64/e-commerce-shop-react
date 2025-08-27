import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, User, Package } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/utils/currency";

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  vendor_id?: string;
  order_items: {
    id: string;
    product_id: string;
    quantity: number;
    price: number;
    products: {
      id: string;
      title: string;
      image_url: string;
      vendors?: {
        business_name: string;
      };
    };
  }[];
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  profiles?: {
    display_name: string;
    first_name: string;
    last_name: string;
  };
}

interface OrderMessagingProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderMessaging({ order, isOpen, onClose }: OrderMessagingProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (order && isOpen && user) {
      initializeConversation();
    }
  }, [order, isOpen, user]);

  const initializeConversation = async () => {
    if (!order || !user) return;

    try {
      // Chercher une conversation existante
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('id')
        .eq('order_id', order.id)
        .maybeSingle();

      if (existingConversation) {
        setConversationId(existingConversation.id);
        loadMessages(existingConversation.id);
      } else {
        // Créer une nouvelle conversation
        const { data: newConversation, error } = await supabase
          .from('conversations')
          .insert({
            title: `Commande #${order.id.slice(0, 8)}`,
            type: 'order',
            order_id: order.id
          })
          .select('id')
          .single();

        if (error) throw error;

        setConversationId(newConversation.id);

        // Ajouter les participants (client et vendeur)
        const participants = [
          { conversation_id: newConversation.id, user_id: user.id, role: 'customer' }
        ];

        // Ajouter le vendeur s'il existe
        if (order.vendor_id) {
          const { data: vendorData } = await supabase
            .from('vendors')
            .select('user_id')
            .eq('id', order.vendor_id)
            .single();

          if (vendorData) {
            participants.push({
              conversation_id: newConversation.id,
              user_id: vendorData.user_id,
              role: 'vendor'
            });
          }
        }

        await supabase
          .from('conversation_participants')
          .insert(participants);

        loadMessages(newConversation.id);
      }
    } catch (error) {
      console.error('Error initializing conversation:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'initialiser la conversation",
        variant: "destructive"
      });
    }
  };

  const loadMessages = async (convId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          sender_id,
          created_at
        `)
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Récupérer les profils des expéditeurs
      const messagesWithProfiles = await Promise.all(
        (data || []).map(async (message) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, first_name, last_name')
            .eq('user_id', message.sender_id)
            .maybeSingle();

          return {
            ...message,
            profiles: profile
          };
        })
      );

      setMessages(messagesWithProfiles);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !conversationId || !user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: newMessage.trim(),
          message_type: 'text'
        });

      if (error) throw error;

      setNewMessage("");
      loadMessages(conversationId);

      toast({
        title: "Message envoyé",
        description: "Votre message a été envoyé avec succès"
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getSenderName = (message: Message) => {
    if (message.profiles?.display_name) {
      return message.profiles.display_name;
    }
    if (message.profiles?.first_name || message.profiles?.last_name) {
      return `${message.profiles.first_name || ''} ${message.profiles.last_name || ''}`.trim();
    }
    return 'Utilisateur';
  };

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Messages - Commande #{order.id.slice(0, 8)}
          </DialogTitle>
        </DialogHeader>

        {/* Order Summary */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span className="font-medium">Commande #{order.id.slice(0, 8)}</span>
              </div>
              <Badge variant="outline">{formatPrice(order.total_amount)}</Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              {order.order_items.length} article(s) • 
              Passée le {new Date(order.created_at).toLocaleDateString('fr-FR')}
            </div>
          </CardContent>
        </Card>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 min-h-[300px] max-h-[400px] p-4 border rounded-lg">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Aucun message pour le moment</p>
              <p className="text-sm">Commencez la conversation avec le vendeur</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.sender_id === user?.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-3 w-3" />
                    <span className="text-xs font-medium">
                      {message.sender_id === user?.id ? 'Vous' : getSenderName(message)}
                    </span>
                  </div>
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(message.created_at).toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Message Input */}
        <div className="flex gap-2 pt-4">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Tapez votre message..."
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <Button 
            onClick={sendMessage} 
            disabled={!newMessage.trim() || loading}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}