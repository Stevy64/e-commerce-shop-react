/**
 * Configuration API pour l'e-commerce ADDINA
 * 
 * Ce fichier permet de basculer facilement entre Supabase et Django API
 * en changeant simplement la valeur de USE_DJANGO_API.
 */

// Configuration : true pour utiliser Django API, false pour Supabase
export const USE_DJANGO_API = true;

// Configuration de l'API Django
export const DJANGO_API_CONFIG = {
  baseURL: 'http://localhost:8000/api',
  timeout: 10000,
};

// Configuration Supabase (pour référence)
export const SUPABASE_CONFIG = {
  url: "https://kfjwalztrqunydnuehso.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmandhbHp0cnF1bnlkbnVlaHNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMTkwNjIsImV4cCI6MjA3MTY5NTA2Mn0.Rlr8c8g9ClqYQY4wtunBrX9aW9HhxdHLUgjb1byOCZQ"
};

// Messages d'information pour le développeur
if (USE_DJANGO_API) {
  console.log('🚀 Configuration: Utilisation de l\'API Django');
  console.log('📡 URL de l\'API:', DJANGO_API_CONFIG.baseURL);
} else {
  console.log('🔄 Configuration: Utilisation de Supabase');
  console.log('📡 URL Supabase:', SUPABASE_CONFIG.url);
}

// Types pour la compatibilité
export interface ApiConfig {
  USE_DJANGO_API: boolean;
  DJANGO_API_CONFIG: typeof DJANGO_API_CONFIG;
  SUPABASE_CONFIG: typeof SUPABASE_CONFIG;
}

export const apiConfig: ApiConfig = {
  USE_DJANGO_API,
  DJANGO_API_CONFIG,
  SUPABASE_CONFIG,
};

