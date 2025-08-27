import { useAuth } from "./useAuth";
import { useUserRole } from "./useUserRole";
import { useVendor } from "./useVendor";

/**
 * Hook unifié pour l'authentification vendeur
 * Combine les vérifications de useAuth, useUserRole et useVendor
 */
export const useVendorAuth = () => {
  const { user, loading: authLoading } = useAuth();
  const { loading: roleLoading } = useUserRole();
  const { vendor, isApprovedVendor, hasVendorProfile, loading: vendorLoading } = useVendor();

  const loading = authLoading || roleLoading || vendorLoading;
  
  // Un utilisateur est un vendeur s'il a un profil vendeur approuvé
  const isVendor = hasVendorProfile() && isApprovedVendor();
  
  // Un utilisateur a demandé à devenir vendeur
  const hasPendingVendorRequest = hasVendorProfile() && !isApprovedVendor();
  
  // L'utilisateur doit-il être redirigé vers /become-vendor ?
  const shouldRedirectToBecomeVendor = !loading && user && !hasVendorProfile();
  
  // L'utilisateur doit-il être redirigé vers /auth ?
  const shouldRedirectToAuth = !loading && !user;

  return {
    user,
    vendor,
    loading,
    isVendor,
    hasPendingVendorRequest,
    shouldRedirectToBecomeVendor,
    shouldRedirectToAuth,
    isApprovedVendor,
    hasVendorProfile
  };
};