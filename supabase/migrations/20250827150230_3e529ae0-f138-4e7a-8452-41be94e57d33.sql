-- Mettre à jour le statut des commandes pour correspondre aux nouveaux statuts
-- Changer 'shipped' en 'shipping' pour être cohérent avec le nouveau système
UPDATE orders 
SET status = 'shipping' 
WHERE status = 'shipped';

-- Ajouter un commentaire pour documenter les statuts possibles
COMMENT ON COLUMN orders.status IS 'Statuts possibles: pending (en attente de validation), confirmed (validée), shipping (en cours de livraison), delivered (livrée), cancelled (annulée)';