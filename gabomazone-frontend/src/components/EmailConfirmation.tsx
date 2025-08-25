import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Mail, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuthDjango";

interface EmailConfirmationProps {
  email: string;
  onBack: () => void;
}

const EmailConfirmation: React.FC<EmailConfirmationProps> = ({ email, onBack }) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { resendConfirmationEmail } = useAuth();

  const handleResendEmail = async () => {
    setLoading(true);
    try {
      await resendConfirmationEmail(email);
      toast({
        title: "Email renvoyé",
        description: "Un nouvel email de confirmation a été envoyé.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.response?.data?.error || "Erreur lors du renvoi de l'email",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">
          Vérifiez votre email
        </CardTitle>
        <CardDescription className="text-gray-600">
          Nous avons envoyé un lien de confirmation à
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center px-3 py-2 bg-blue-50 rounded-lg">
            <Mail className="w-4 h-4 text-blue-600 mr-2" />
            <span className="text-blue-800 font-medium">{email}</span>
          </div>
        </div>

        <div className="text-center text-sm text-gray-600">
          <p>Cliquez sur le lien dans l'email pour activer votre compte.</p>
          <p className="mt-2">Le lien expire dans 3 jours.</p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleResendEmail}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Renvoyer l'email
              </>
            )}
          </Button>

          <Button
            onClick={onBack}
            variant="ghost"
            className="w-full"
          >
            Retour à l'inscription
          </Button>
        </div>

        <div className="text-xs text-gray-500 text-center">
          <p>Vous ne trouvez pas l'email ? Vérifiez votre dossier spam.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailConfirmation;

