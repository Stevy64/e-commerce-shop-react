import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Package, Eye, MessageSquare, X } from "lucide-react";
import { useVendor } from "@/hooks/useVendor";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

interface VendorNotification {
  id: string;
  vendor_id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  is_read: boolean;
  created_at: string;
}

export default function VendorNotifications() {
  const { vendor } = useVendor();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<VendorNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (vendor?.id) {
      fetchNotifications();
      subscribeToNotifications();
    }
  }, [vendor?.id]);

  const fetchNotifications = async () => {
    if (!vendor?.id) return;

    try {
      const { data, error } = await supabase
        .from('vendor_notifications')
        .select('*')
        .eq('vendor_id', vendor.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToNotifications = () => {
    if (!vendor?.id) return;

    const channel = supabase
      .channel('vendor-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'vendor_notifications',
          filter: `vendor_id=eq.${vendor.id}`
        },
        (payload) => {
          const newNotification = payload.new as VendorNotification;
          setNotifications(prev => [newNotification, ...prev.slice(0, 19)]);
          setUnreadCount(prev => prev + 1);
          
          // Afficher un toast pour la nouvelle notification
          toast({
            title: newNotification.title,
            description: newNotification.message,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('vendor_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!vendor?.id) return;

    try {
      const { error } = await supabase
        .from('vendor_notifications')
        .update({ is_read: true })
        .eq('vendor_id', vendor.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);

      toast({
        title: "Notifications marquées comme lues",
        description: "Toutes vos notifications ont été marquées comme lues",
      });
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
    }
  };

  const handleNotificationAction = (notification: VendorNotification) => {
    // Marquer comme lu
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    // Actions spécifiques selon le type
    switch (notification.type) {
      case 'new_order':
        if (notification.data?.order_id) {
          navigate(`/vendor/orders/${notification.data.order_id}`);
        } else {
          navigate('/vendor/orders');
        }
        break;
      case 'message':
        navigate('/vendor/messaging');
        break;
      case 'product_review':
        if (notification.data?.product_id) {
          navigate(`/vendor/products/${notification.data.product_id}`);
        } else {
          navigate('/vendor/products');
        }
        break;
      default:
        navigate('/vendor/dashboard');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_order':
        return Package;
      case 'message':
        return MessageSquare;
      case 'product_review':
        return Eye;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'new_order':
        return 'text-green-600';
      case 'message':
        return 'text-blue-600';
      case 'product_review':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p>Chargement des notifications...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
            >
              Tout marquer comme lu
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Aucune notification</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {notifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              return (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                    !notification.is_read ? 'bg-blue-50 border-blue-200' : 'bg-background'
                  }`}
                  onClick={() => handleNotificationAction(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full bg-muted ${getNotificationColor(notification.type)}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`text-sm font-medium ${!notification.is_read ? 'font-semibold' : ''}`}>
                          {notification.title}
                        </h4>
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(new Date(notification.created_at), 'PPp', { locale: fr })}
                      </p>
                      {notification.data && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          {notification.type === 'new_order' && notification.data.total_amount && (
                            <span>Montant: {notification.data.total_amount.toLocaleString()} FCFA</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}