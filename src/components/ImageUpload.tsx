import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  currentImageUrl?: string;
  onImageUpload: (url: string) => void;
  bucket: string;
  folder?: string;
  maxSizeMB?: number;
  acceptedFormats?: string[];
  className?: string;
  label?: string;
}

export const ImageUpload = ({ 
  currentImageUrl, 
  onImageUpload, 
  bucket, 
  folder = "images",
  maxSizeMB = 5,
  acceptedFormats = ["image/png", "image/jpeg", "image/jpg"],
  className = "",
  label = "Image"
}: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateFile = (file: File): string | null => {
    // Vérifier le format
    if (!acceptedFormats.includes(file.type)) {
      return `Format non supporté. Formats acceptés: ${acceptedFormats.map(f => f.split('/')[1]).join(', ')}`;
    }

    // Vérifier la taille
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      return `Fichier trop volumineux. Taille maximale: ${maxSizeMB}MB`;
    }

    return null;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validation du fichier
    const validationError = validateFile(file);
    if (validationError) {
      toast({
        variant: "destructive",
        title: "Erreur de fichier",
        description: validationError,
      });
      return;
    }

    setUploading(true);

    try {
      // Créer une preview locale
      const localPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(localPreviewUrl);

      // Générer un nom de fichier unique
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      // Upload vers Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      onImageUpload(publicUrl);
      
      toast({
        title: "Image uploadée",
        description: "L'image a été uploadée avec succès",
      });

      // Nettoyer l'URL de preview locale
      URL.revokeObjectURL(localPreviewUrl);
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur d'upload",
        description: error.message || "Impossible d'uploader l'image",
      });
      setPreviewUrl(currentImageUrl || null);
    }

    setUploading(false);
  };

  const removeImage = () => {
    setPreviewUrl(null);
    onImageUpload("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Label htmlFor="image-upload">{label}</Label>
      
      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
        {previewUrl ? (
          <div className="relative inline-block">
            <img
              src={previewUrl}
              alt="Preview"
              className="max-w-full max-h-48 rounded-lg shadow-md"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 rounded-full w-8 h-8 p-0"
              onClick={removeImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">
                Cliquez pour uploader ou glissez-déposez
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {acceptedFormats.map(f => f.split('/')[1]).join(', ').toUpperCase()} jusqu'à {maxSizeMB}MB
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex-1"
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? "Upload en cours..." : previewUrl ? "Changer l'image" : "Choisir une image"}
        </Button>
        
        {previewUrl && (
          <Button
            type="button"
            variant="ghost"
            onClick={removeImage}
            disabled={uploading}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        id="image-upload"
        type="file"
        accept={acceptedFormats.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};