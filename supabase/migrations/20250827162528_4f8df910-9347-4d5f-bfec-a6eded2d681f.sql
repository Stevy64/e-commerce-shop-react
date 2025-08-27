-- Create messaging system tables
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  type TEXT NOT NULL DEFAULT 'direct', -- 'direct', 'support', 'order'
  order_id UUID, -- Optional link to order
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.conversation_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'participant', -- 'participant', 'admin', 'moderator'
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text', -- 'text', 'file', 'system'
  file_url TEXT,
  file_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  edited_at TIMESTAMP WITH TIME ZONE,
  is_deleted BOOLEAN DEFAULT false
);

CREATE TABLE public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  status TEXT NOT NULL DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'closed'
  channel TEXT NOT NULL DEFAULT 'message', -- 'email', 'message'
  conversation_id UUID REFERENCES public.conversations(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view conversations they participate in"
ON public.conversations FOR SELECT
USING (id IN (
  SELECT conversation_id FROM public.conversation_participants 
  WHERE user_id = auth.uid()
));

CREATE POLICY "Users can create conversations"
ON public.conversations FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Participants can update conversations"
ON public.conversations FOR UPDATE
USING (id IN (
  SELECT conversation_id FROM public.conversation_participants 
  WHERE user_id = auth.uid()
));

-- RLS Policies for conversation_participants
CREATE POLICY "Users can view participants in their conversations"
ON public.conversation_participants FOR SELECT
USING (conversation_id IN (
  SELECT conversation_id FROM public.conversation_participants 
  WHERE user_id = auth.uid()
));

CREATE POLICY "Users can add participants to conversations they're in"
ON public.conversation_participants FOR INSERT
WITH CHECK (conversation_id IN (
  SELECT conversation_id FROM public.conversation_participants 
  WHERE user_id = auth.uid()
));

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their conversations"
ON public.messages FOR SELECT
USING (conversation_id IN (
  SELECT conversation_id FROM public.conversation_participants 
  WHERE user_id = auth.uid()
));

CREATE POLICY "Users can send messages to conversations they're in"
ON public.messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND 
  conversation_id IN (
    SELECT conversation_id FROM public.conversation_participants 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can edit their own messages"
ON public.messages FOR UPDATE
USING (sender_id = auth.uid());

-- RLS Policies for support_tickets
CREATE POLICY "Vendors can view their own support tickets"
ON public.support_tickets FOR SELECT
USING (vendor_id IN (
  SELECT id FROM public.vendors WHERE user_id = auth.uid()
));

CREATE POLICY "Vendors can create support tickets"
ON public.support_tickets FOR INSERT
WITH CHECK (vendor_id IN (
  SELECT id FROM public.vendors WHERE user_id = auth.uid()
));

CREATE POLICY "Super admins can view all support tickets"
ON public.support_tickets FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'super_admin'
));

-- Triggers for updated_at
CREATE TRIGGER update_conversations_updated_at
BEFORE UPDATE ON public.conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at
BEFORE UPDATE ON public.support_tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_conversations_last_message_at ON public.conversations(last_message_at DESC);
CREATE INDEX idx_conversation_participants_user_id ON public.conversation_participants(user_id);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX idx_support_tickets_vendor_id ON public.support_tickets(vendor_id);
CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);