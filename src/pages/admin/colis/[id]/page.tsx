
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { supabase } from '../../../../lib/supabase';
import Header from '../../../../components/feature/Header';
import Footer from '../../../../components/feature/Footer';
import Card from '../../../../components/base/Card';
import Button from '../../../../components/base/Button';
import PhotoGallery from '../../../dashboard/components/PhotoGallery';
import PhotoUpload from '../../../dashboard/components/PhotoUpload';

interface Package {
  id: string;
  tracking_number: string;
  description: string;
  status: string;
  photos: any[];
  user_id: string;
  created_at: string;
  updated_at: string;
  weight?: number;
  dimensions?: string;
  declared_value?: number;
  storage_fee?: number;
  shipping_fee?: number;
  user_email?: string;
  user_name?: string;
  user_phone?: string;
  user_address?: string;
}

export default function AdminPackageDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [packageData, setPackageData] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    tracking_number: '',
    description: '',
    status: '',
    weight: '',
    dimensions: '',
    declared_value: '',
    storage_fee: '',
    shipping_fee: '',
  });
  const [showNotifyMenu, setShowNotifyMenu] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const notifyMenuRef = useRef<HTMLDivElement>(null);

  /* -------------------------------------------------------------------------- */
  /*                                 Side‑effects                               */
  /* -------------------------------------------------------------------------- */

  // Vérification admin & chargement du colis
  useEffect(() => {
    const checkAdminAndLoadPackage = async () => {
      if (!user) {
        navigate('/connexion?redirect=/admin');
        return;
      }

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profile?.role !== 'admin') {
          navigate('/dashboard');
          return;
        }

        await loadPackage();
      } catch (error) {
        console.error('Erreur vérification admin:', error);
        navigate('/dashboard');
      }
    };

    checkAdminAndLoadPackage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, id, navigate]);

  // Fermer le menu de notification quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifyMenuRef.current && !notifyMenuRef.current.contains(event.target as Node)) {
        setShowNotifyMenu(false);
      }
    };

    if (showNotifyMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifyMenu]);

  // Auto‑hide messages
  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
        setErrorMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  /* -------------------------------------------------------------------------- */
  /*                               Data loading                                 */
  /* -------------------------------------------------------------------------- */

  const loadPackage = async () => {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select(`
          *,
          profiles:user_id (
            email,
            first_name,
            last_name,
            phone
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      const packageWithUserInfo = {
        ...data,
        user_email: data.profiles?.email || 'Email non disponible',
        user_name: `${data.profiles?.first_name || ''} ${data.profiles?.last_name || ''}`.trim() || 'Nom non disponible',
        user_phone: data.profiles?.phone || 'Téléphone non disponible',
        user_address: 'Adresse non disponible',
      };

      setPackageData(packageWithUserInfo);
      setFormData({
        tracking_number: data.tracking_number || '',
        description: data.description || '',
        status: data.status || 'pending',
        weight: data.weight?.toString() || '',
        dimensions: data.dimensions || '',
        declared_value: data.declared_value?.toString() || '',
        storage_fee: data.storage_fee?.toString() || '',
        shipping_fee: data.shipping_fee?.toString() || '',
      });
    } catch (error) {
      console.error('Erreur chargement colis:', error);
      navigate('/admin');
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                                 Handlers                                    */
  /* -------------------------------------------------------------------------- */

  const handleSave = async () => {
    if (!packageData) return;

    try {
      setActionLoading(true);
      setErrorMessage('');

      const updateData = {
        tracking_number: formData.tracking_number,
        description: formData.description,
        status: formData.status,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        dimensions: formData.dimensions,
        declared_value: formData.declared_value ? parseFloat(formData.declared_value) : null,
        storage_fee: formData.storage_fee ? parseFloat(formData.storage_fee) : null,
        shipping_fee: formData.shipping_fee ? parseFloat(formData.shipping_fee) : null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('packages').update(updateData).eq('id', packageData.id);
      if (error) throw error;

      await loadPackage();
      setEditMode(false);
      setSuccessMessage('✅ Modifications enregistrées avec succès !');
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      setErrorMessage('❌ Erreur lors de la sauvegarde des modifications');
    } finally {
      setActionLoading(false);
    }
  };

  const generateQuote = async () => {
    if (!packageData) return;

    try {
      setActionLoading(true);
      setErrorMessage('');

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) throw new Error('Session expirée. Veuillez vous reconnecter.');

      const { data, error } = await supabase.functions.invoke('generate-quote-pdf', {
        body: {
          packageId: packageData.id,
          includeCarrierOptions: true,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.success) {
        setSuccessMessage(
          `✅ Devis ${data.quoteNumber} généré avec succès ! Le client recevra un email avec les options de transporteur.`
        );
        await loadPackage();
      } else {
        throw new Error(data?.error || 'Erreur lors de la génération du devis');
      }
    } catch (error: any) {
      console.error('Erreur génération devis:', error);
      setErrorMessage(`❌ ${error.message || 'Erreur lors de la génération du devis'}`);
    } finally {
      setActionLoading(false);
    }
  };

  const deleteQuote = async (quoteId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce devis ? Cette action est irréversible.')) return;

    try {
      setActionLoading(true);
      setErrorMessage('');

      const { error: itemsError } = await supabase.from('quote_items').delete().eq('quote_id', quoteId);
      if (itemsError) {
        console.error('Erreur suppression items:', itemsError);
        throw itemsError;
      }

      const { error: quoteError } = await supabase.from('quotes').delete().eq('id', quoteId);
      if (quoteError) {
        console.error('Erreur suppression devis:', quoteError);
        throw quoteError;
      }

      setSuccessMessage('✅ Devis supprimé avec succès !');
      await loadPackage();
      window.location.reload();
    } catch (error: any) {
      console.error('Erreur suppression devis:', error);
      setErrorMessage(`❌ Erreur lors de la suppression du devis: ${error.message || 'Erreur inconnue'}`);
    } finally {
      setActionLoading(false);
    }
  };

  const notifyClient = async (notificationType: string, customMessage?: string) => {
    if (!packageData) return;

    try {
      setActionLoading(true);
      setErrorMessage('');

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) throw new Error('Session expirée. Veuillez vous reconnecter.');

      const { data, error } = await supabase.functions.invoke('notify-client-auto', {
        body: {
          packageId: packageData.id,
          notificationType,
          customMessage,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.success) {
        setSuccessMessage(`✅ Notification "${getNotificationLabel(notificationType)}" envoyée à ${data.recipient}`);
      } else {
        throw new Error(data?.error || "Erreur lors de l'envoi de la notification");
      }
    } catch (error: any) {
      console.error('Erreur notification:', error);
      setErrorMessage(`❌ ${error.message || "Erreur lors de l'envoi de la notification"}`);
    } finally {
      setActionLoading(false);
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                                 Helpers                                     */
  /* -------------------------------------------------------------------------- */

  const getNotificationLabel = (type: string) => {
    switch (type) {
      case 'package_received':
        return 'Colis reçu';
      case 'quote_ready':
        return 'Devis prêt';
      case 'package_shipped':
        return 'Colis expédié';
      case 'storage_reminder':
        return 'Rappel stockage';
      default:
        return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received':
        return 'bg-green-100 text-green-800';
      case 'stored':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'received':
        return 'Reçu';
      case 'stored':
        return 'Stocké';
      case 'shipped':
        return 'Expédié';
      case 'pending':
        return 'En attente';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /* -------------------------------------------------------------------------- */
  /*                                 Render UI                                   */
  /* -------------------------------------------------------------------------- */

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du colis...</p>
        </div>
      </div>
    );
  }

  if (!packageData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Colis introuvable</h1>
          <Button onClick={() => navigate('/admin')}>Retour à l'administration</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Feedback messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
            <p className="text-green-800 font-medium">{successMessage}</p>
            <button onClick={() => setSuccessMessage('')} className="text-green-600 hover:text-green-800">
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <p className="text-red-800 font-medium">{errorMessage}</p>
            <button onClick={() => setErrorMessage('')} className="text-red-600 hover:text-red-800">
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>
        )}

        {/* Header section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button variant="outline" onClick={() => navigate('/admin')} className="mb-4">
              <i className="ri-arrow-left-line mr-2"></i>
              Retour à l'admin
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              📦 {packageData.tracking_number}
              <span className={`ml-4 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(packageData.status)}`}>
                {getStatusText(packageData.status)}
              </span>
            </h1>
            <p className="text-gray-600 mt-2">Gestion administrative du colis</p>
          </div>

          <div className="flex space-x-3">
            <Button variant="outline" onClick={generateQuote} disabled={actionLoading}>
              <i className={`ri-${actionLoading ? 'loader-4-line animate-spin' : 'file-text-line'} mr-2`}></i>
              {actionLoading ? 'Génération...' : 'Générer devis PDF'}
            </Button>

            <div className="relative" ref={notifyMenuRef}>
              <Button variant="outline" onClick={() => setShowNotifyMenu(!showNotifyMenu)} disabled={actionLoading}>
                <i className="ri-notification-line mr-2"></i>
                Notifier client
              </Button>

              {showNotifyMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  <div className="p-2">
                    <button
                      onClick={() => {
                        notifyClient('package_received');
                        setShowNotifyMenu(false);
                      }}
                      disabled={actionLoading}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <i className="ri-package-line mr-2 text-green-600"></i>
                      Colis reçu
                    </button>
                    <button
                      onClick={() => {
                        notifyClient('quote_ready');
                        setShowNotifyMenu(false);
                      }}
                      disabled={actionLoading}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <i className="ri-file-text-line mr-2 text-blue-600"></i>
                      Devis prêt
                    </button>
                    <button
                      onClick={() => {
                        notifyClient('package_shipped');
                        setShowNotifyMenu(false);
                      }}
                      disabled={actionLoading}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <i className="ri-truck-line mr-2 text-purple-600"></i>
                      Colis expédié
                    </button>
                    <button
                      onClick={() => {
                        notifyClient('storage_reminder');
                        setShowNotifyMenu(false);
                      }}
                      disabled={actionLoading}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <i className="ri-time-line mr-2 text-orange-600"></i>
                      Rappel stockage
                    </button>
                  </div>
                </div>
              )}
            </div>

            <Button variant={editMode ? 'outline' : 'primary'} onClick={() => setEditMode(!editMode)} disabled={actionLoading}>
              <i className={`ri-${editMode ? 'close' : 'edit'}-line mr-2`}></i>
              {editMode ? 'Annuler' : 'Modifier'}
            </Button>
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left (details) */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Détails du colis</h2>

              {editMode ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Tracking number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Numéro de suivi</label>
                      <input
                        type="text"
                        value={formData.tracking_number}
                        onChange={(e) => setFormData({ ...formData, tracking_number: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8"
                      >
                        <option value="pending">En attente</option>
                        <option value="received">Reçu</option>
                        <option value="stored">Stocké</option>
                        <option value="shipped">Expédié</option>
                      </select>
                    </div>

                    {/* Weight */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Poids (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.weight}
                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Dimensions */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Dimensions (cm)</label>
                      <input
                        type="text"
                        placeholder="ex: 20x15x10"
                        value={formData.dimensions}
                        onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Declared value */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Valeur déclarée (€)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.declared_value}
                        onChange={(e) => setFormData({ ...formData, declared_value: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Storage fee */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Frais de stockage (€)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.storage_fee}
                        onChange={(e) => setFormData({ ...formData, storage_fee: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-blue-5"
                      />
                    </div>

                    {/* Shipping fee */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Frais d'expédition (€)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.shipping_fee}
                        onChange={(e) => setFormData({ ...formData, shipping_fee: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-2 mt-4">
                    <Button onClick={handleSave} disabled={actionLoading}>
                      <i className={`ri-${actionLoading ? 'loader-4-line animate-spin' : 'save-line'} mr-2`}></i>
                      {actionLoading ? 'Enregistrement...' : 'Enregistrer'}
                    </Button>
                    <Button variant="outline" onClick={() => setEditMode(false)} disabled={actionLoading}>
                      Annuler
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-gray-800">
                  <p><strong>Numéro de suivi :</strong> {packageData.tracking_number}</p>
                  <p><strong>Description :</strong> {packageData.description}</p>
                  <p><strong>Statut :</strong> {getStatusText(packageData.status)}</p>
                  <p><strong>Poids :</strong> {packageData.weight ?? 'N/A'} kg</p>
                  <p><strong>Dimensions :</strong> {packageData.dimensions ?? 'N/A'}</p>
                  <p><strong>Valeur déclarée :</strong> {packageData.declared_value ?? 'N/A'} €</p>
                  <p><strong>Frais de stockage :</strong> {packageData.storage_fee ?? 'N/A'} €</p>
                  <p><strong>Frais d'expédition :</strong> {packageData.shipping_fee ?? 'N/A'} €</p>
                  <p><strong>Créé le :</strong> {formatDate(packageData.created_at)}</p>
                  <p><strong>Mis à jour le :</strong> {formatDate(packageData.updated_at)}</p>
                </div>
              )}
            </Card>
          </div>

          {/* Right (photos) */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-4">
              <h2 className="text-lg font-semibold mb-4">Photos du colis</h2>
              <PhotoGallery photos={packageData.photos} />
              <Button variant="outline" onClick={() => setShowPhotoUpload(!showPhotoUpload)} className="mt-2">
                {showPhotoUpload ? 'Fermer le formulaire' : 'Ajouter des photos'}
              </Button>
              {showPhotoUpload && (
                <PhotoUpload
                  packageId={packageData.id}
                  onUploadComplete={loadPackage}
                />
              )}
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
