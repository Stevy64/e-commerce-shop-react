import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useMessaging } from "@/hooks/useMessaging";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, User, Clock } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function VendorMessaging() {
  const { user, loading: authLoading } = useAuth();
  const { isVendor, loading: roleLoading } = useUserRole();
  const { conversations, messages, loading, fetchMessages, sendMessage } = useMessaging();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isVendor) {
    return <Navigate to="/become-vendor" replace />;
  }

  const handleConversationSelect = async (conversationId: string) => {
    setSelectedConversation(conversationId);
    await fetchMessages(conversationId);
  };

  const handleSendMessage = async () => {
    if (!selectedConversation || !newMessage.trim()) return;
    
    const success = await sendMessage(selectedConversation, newMessage.trim());
    if (success) {
      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getConversationTitle = (conversation: any) => {
    if (conversation.title) return conversation.title;
    if (conversation.type === 'support') return 'Support Technique';
    if (conversation.type === 'order') return `Commande #${conversation.order_id?.slice(0, 8)}`;
    return 'Conversation';
  };

  const getConversationBadge = (conversation: any) => {
    const badges = {
      support: { variant: "destructive" as const, label: "Support" },
      order: { variant: "default" as const, label: "Commande" },
      direct: { variant: "secondary" as const, label: "Direct" }
    };
    
    const config = badges[conversation.type as keyof typeof badges] || badges.direct;
    
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <MessageCircle className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Ma Messagerie</h1>
          </div>
          <p className="text-muted-foreground">
            Communiquez avec vos clients et l'équipe support
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Liste des conversations */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Conversations ({conversations.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                {loading ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Chargement des conversations...
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Aucune conversation</p>
                    <p className="text-xs">Les messages clients apparaîtront ici</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        onClick={() => handleConversationSelect(conversation.id)}
                        className={`p-4 cursor-pointer border-b hover:bg-accent transition-colors ${
                          selectedConversation === conversation.id ? 'bg-accent' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium truncate">
                                {getConversationTitle(conversation)}
                              </p>
                              {getConversationBadge(conversation)}
                            </div>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(new Date(conversation.last_message_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Zone de messages */}
          <Card className="lg:col-span-2">
            {selectedConversation ? (
              <>
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    {getConversationTitle(conversations.find(c => c.id === selectedConversation))}
                    {getConversationBadge(conversations.find(c => c.id === selectedConversation))}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="p-0 flex flex-col h-[500px]">
                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages[selectedConversation]?.map((message) => (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${
                            message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          {message.sender_id !== user?.id && (
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                <User className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              message.sender_id === user?.id
                                ? 'bg-primary text-primary-foreground ml-auto'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p
                              className={`text-xs mt-1 ${
                                message.sender_id === user?.id
                                  ? 'text-primary-foreground/70'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              {format(new Date(message.created_at), 'HH:mm', { locale: fr })}
                            </p>
                          </div>
                          {message.sender_id === user?.id && (
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>Moi</AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      )) || (
                        <div className="text-center text-muted-foreground py-8">
                          <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>Aucun message dans cette conversation</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  {/* Zone de saisie */}
                  <div className="border-t p-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Tapez votre message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleSendMessage} 
                        disabled={!newMessage.trim()}
                        size="icon"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Appuyez sur Entrée pour envoyer
                    </p>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center text-muted-foreground">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Sélectionnez une conversation</h3>
                  <p>Choisissez une conversation dans la liste pour commencer à discuter</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Informations utiles */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>À propos de la messagerie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Messages clients</h4>
                <p className="text-muted-foreground">
                  Recevez des messages de vos clients concernant leurs commandes
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Support technique</h4>
                <p className="text-muted-foreground">
                  Contactez l'équipe support via la page dédiée
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Notifications</h4>
                <p className="text-muted-foreground">
                  Recevez des notifications pour les nouveaux messages
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