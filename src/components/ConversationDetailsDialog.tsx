import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, User, Clock, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ConversationDetailsDialogProps {
  conversationId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  message_type: string;
  profiles: {
    display_name?: string;
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
  };
}

interface Participant {
  user_id: string;
  role: string;
  joined_at: string;
  profiles: {
    display_name?: string;
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
  };
}

interface ConversationDetails {
  id: string;
  title?: string;
  type: string;
  created_at: string;
  last_message_at?: string;
  order_id?: string;
}

export default function ConversationDetailsDialog({ 
  conversationId, 
  isOpen, 
  onClose 
}: ConversationDetailsDialogProps) {
  const [conversation, setConversation] = useState<ConversationDetails | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (conversationId && isOpen) {
      fetchConversationDetails();
    }
  }, [conversationId, isOpen]);

  const fetchConversationDetails = async () => {
    if (!conversationId) return;

    setLoading(true);
    try {
      // Récupérer les détails de la conversation
      const { data: conversationData, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (convError) throw convError;
      setConversation(conversationData);

      // Récupérer les participants
      const { data: participantsData, error: participantsError } = await supabase
        .from('conversation_participants')
        .select(`
          user_id,
          role,
          joined_at,
          profiles (
            display_name,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('conversation_id', conversationId);

      if (participantsError) throw participantsError;
      setParticipants(participantsData as any || []);

      // Récupérer les messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          sender_id,
          message_type,
          profiles (
            display_name,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;
      setMessages(messagesData as any || []);

    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error);
    } finally {
      setLoading(false);
    }
  };

  const getParticipantName = (participant: Participant) => {
    return participant.profiles?.display_name || 
           `${participant.profiles?.first_name || ''} ${participant.profiles?.last_name || ''}`.trim() ||
           'Utilisateur inconnu';
  };

  const getSenderName = (message: Message) => {
    return message.profiles?.display_name || 
           `${message.profiles?.first_name || ''} ${message.profiles?.last_name || ''}`.trim() ||
           'Utilisateur inconnu';
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'order': return 'Commande';
      case 'support': return 'Support';
      case 'direct': return 'Direct';
      default: return type;
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'order': return 'default';
      case 'support': return 'destructive';
      case 'direct': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {conversation?.title || 'Détails de la conversation'}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-muted-foreground">Chargement...</div>
          </div>
        ) : conversation ? (
          <div className="flex-1 flex flex-col gap-4">
            {/* Informations de la conversation */}
            <div className="flex items-center gap-4">
              <Badge variant={getTypeBadgeVariant(conversation.type)}>
                {getTypeLabel(conversation.type)}
              </Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Créée le {format(new Date(conversation.created_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}
              </div>
              {conversation.order_id && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <ShoppingCart className="h-4 w-4" />
                  Commande #{conversation.order_id.slice(0, 8)}
                </div>
              )}
            </div>

            {/* Participants */}
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <User className="h-4 w-4" />
                Participants ({participants.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {participants.map((participant) => (
                  <div key={participant.user_id} className="flex items-center gap-2 bg-muted p-2 rounded-lg">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={participant.profiles?.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {getParticipantName(participant).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-sm">
                      <div className="font-medium">{getParticipantName(participant)}</div>
                      <div className="text-xs text-muted-foreground">{participant.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Messages */}
            <div className="flex-1">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Messages ({messages.length})
              </h4>
              <ScrollArea className="h-[300px] border rounded-lg p-4">
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      Aucun message dans cette conversation
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div key={message.id} className="flex gap-3">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={message.profiles?.avatar_url} />
                          <AvatarFallback className="text-xs">
                            {getSenderName(message).charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{getSenderName(message)}</span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(message.created_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                            </span>
                            {message.message_type !== 'text' && (
                              <Badge variant="outline" className="text-xs">
                                {message.message_type}
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm bg-muted p-3 rounded-lg">
                            {message.content}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-muted-foreground">Conversation introuvable</div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}