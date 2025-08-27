import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

interface Conversation {
  id: string;
  title?: string;
  type: string;
  order_id?: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  participants?: ConversationParticipant[];
  last_message?: Message;
}

interface ConversationParticipant {
  id: string;
  conversation_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  last_read_at: string;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  file_url?: string;
  file_name?: string;
  created_at: string;
  edited_at?: string;
  is_deleted: boolean;
}

interface SupportTicket {
  id: string;
  vendor_id: string;
  subject: string;
  description: string;
  priority: string;
  status: string;
  channel: string;
  conversation_id?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export const useMessaging = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<{ [conversationId: string]: Message[] }>({});
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(false);

  // Récupérer les conversations de l'utilisateur
  const fetchConversations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          conversation_participants (
            user_id,
            role,
            last_read_at
          )
        `)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les messages d'une conversation
  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(prev => ({ ...prev, [conversationId]: data || [] }));
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des messages:', error);
      return [];
    }
  };

  // Envoyer un message
  const sendMessage = async (conversationId: string, content: string, messageType = 'text') => {
    if (!user || !content.trim()) return false;

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          conversation_id: conversationId,
          sender_id: user.id,
          content: content.trim(),
          message_type: messageType
        }])
        .select()
        .single();

      if (error) throw error;

      // Mettre à jour la liste des messages
      setMessages(prev => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []), data]
      }));

      // Mettre à jour la conversation avec la date du dernier message
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);

      return true;
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      toast.error('Erreur lors de l\'envoi du message');
      return false;
    }
  };

  // Créer une conversation
  const createConversation = async (
    title: string, 
    type: string, 
    participantIds: string[], 
    orderId?: string
  ) => {
    if (!user) return null;

    try {
      // Créer la conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert([{
          title,
          type,
          order_id: orderId
        }])
        .select()
        .single();

      if (convError) throw convError;

      // Ajouter les participants (y compris l'utilisateur actuel)
      const allParticipants = [...new Set([user.id, ...participantIds])];
      const participants = allParticipants.map(userId => ({
        conversation_id: conversation.id,
        user_id: userId,
        role: userId === user.id ? 'admin' : 'participant'
      }));

      const { error: partError } = await supabase
        .from('conversation_participants')
        .insert(participants);

      if (partError) throw partError;

      await fetchConversations();
      return conversation;
    } catch (error) {
      console.error('Erreur lors de la création de la conversation:', error);
      toast.error('Erreur lors de la création de la conversation');
      return null;
    }
  };

  // Créer un ticket de support
  const createSupportTicket = async (
    vendorId: string,
    subject: string,
    description: string,
    priority: string,
    channel: 'email' | 'message'
  ) => {
    try {
      setLoading(true);
      
      let conversationId = null;
      
      // Si c'est un message direct, créer une conversation avec les super admins
      if (channel === 'message') {
        // Récupérer les super admins
        const { data: superAdmins } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'super_admin');

        if (superAdmins && superAdmins.length > 0) {
          const conversation = await createConversation(
            `Support: ${subject}`,
            'support',
            superAdmins.map(admin => admin.user_id)
          );
          conversationId = conversation?.id;
        }
      }

      const { data, error } = await supabase
        .from('support_tickets')
        .insert([{
          vendor_id: vendorId,
          subject,
          description,
          priority,
          channel,
          conversation_id: conversationId
        }])
        .select()
        .single();

      if (error) throw error;

      setSupportTickets(prev => [data, ...prev]);
      toast.success(`Ticket de support créé avec succès${channel === 'email' ? ' - Un email sera envoyé' : ''}`);
      return data;
    } catch (error) {
      console.error('Erreur lors de la création du ticket:', error);
      toast.error('Erreur lors de la création du ticket de support');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les tickets de support d'un vendeur
  const fetchSupportTickets = async (vendorId: string) => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSupportTickets(data || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des tickets:', error);
    }
  };

  // Écouter les nouveaux messages en temps réel
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => ({
            ...prev,
            [newMessage.conversation_id]: [...(prev[newMessage.conversation_id] || []), newMessage]
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Charger les conversations au montage
  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  return {
    conversations,
    messages,
    supportTickets,
    loading,
    fetchConversations,
    fetchMessages,
    sendMessage,
    createConversation,
    createSupportTicket,
    fetchSupportTickets
  };
};