import React, { useState } from 'react';
import Button from '../../../components/base/Button';

interface Photo {
  url: string;
  filename: string;
  uploaded_at: string;
  description?: string;
}

interface PhotoGalleryProps {
  photos: Photo[];
  packageInfo?: {
    tracking_number?: string;
    description?: string;
    status?: string;
  };
  onAddPhoto?: () => void;
}

export default function PhotoGallery({ photos, packageInfo, onAddPhoto }: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [showLightbox, setShowLightbox] = useState(false);

  const openLightbox = (photo: Photo) => {
    setSelectedPhoto(photo);
    setShowLightbox(true);
  };

  const closeLightbox = () => {
    setShowLightbox(false);
    setSelectedPhoto(null);
  };

  const nextPhoto = () => {
    if (!selectedPhoto) return;
    const currentIndex = photos.findIndex(p => p.filename === selectedPhoto.filename);
    const nextIndex = (currentIndex + 1) % photos.length;
    setSelectedPhoto(photos[nextIndex]);
  };

  const prevPhoto = () => {
    if (!selectedPhoto) return;
    const currentIndex = photos.findIndex(p => p.filename === selectedPhoto.filename);
    const prevIndex = currentIndex === 0 ? photos.length - 1 : currentIndex - 1;
    setSelectedPhoto(photos[prevIndex]);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'received': return 'bg-green-100 text-green-800';
      case 'stored': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'received': return 'Reçu';
      case 'stored': return 'Stocké';
      case 'shipped': return 'Expédié';
      case 'pending': return 'En attente';
      default: return status || 'Inconnu';
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec infos du colis */}
      {packageInfo && (
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                📦 {packageInfo.tracking_number || 'Colis sans numéro'}
              </h3>
              <p className="text-gray-600">{packageInfo.description || 'Aucune description'}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(packageInfo.status)}`}>
              {getStatusText(packageInfo.status)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-600">
              <i className="ri-camera-line mr-2"></i>
              {photos.length} photo{photos.length > 1 ? 's' : ''}
            </div>
            {onAddPhoto && (
              <Button variant="outline" size="sm" onClick={onAddPhoto}>
                <i className="ri-add-line mr-2"></i>
                Ajouter une photo
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Grille de photos */}
      {photos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo, index) => (
            <div
              key={photo.filename}
              className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
              onClick={() => openLightbox(photo)}
            >
              <img
                src={photo.url}
                alt={photo.description || `Photo ${index + 1}`}
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-200"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                    <i className="ri-eye-line mr-1"></i>
                    Voir
                  </div>
                </div>
              </div>
              {photo.description && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
                  <p className="text-white text-xs truncate">{photo.description}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-camera-line text-3xl text-gray-400"></i>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune photo disponible</h3>
          <p className="text-gray-600 mb-6">
            Les photos de ce colis apparaîtront ici une fois téléchargées.
          </p>
          {onAddPhoto && (
            <Button onClick={onAddPhoto}>
              <i className="ri-camera-line mr-2"></i>
              Ajouter la première photo
            </Button>
          )}
        </div>
      )}

      {/* Lightbox */}
      {showLightbox && selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            {/* Bouton fermer */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 w-10 h-10 bg-white bg-opacity-20 text-white rounded-full flex items-center justify-center hover:bg-opacity-30 cursor-pointer z-10"
            >
              <i className="ri-close-line text-xl"></i>
            </button>

            {/* Navigation précédent */}
            {photos.length > 1 && (
              <button
                onClick={prevPhoto}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white bg-opacity-20 text-white rounded-full flex items-center justify-center hover:bg-opacity-30 cursor-pointer"
              >
                <i className="ri-arrow-left-line text-xl"></i>
              </button>
            )}

            {/* Navigation suivant */}
            {photos.length > 1 && (
              <button
                onClick={nextPhoto}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white bg-opacity-20 text-white rounded-full flex items-center justify-center hover:bg-opacity-30 cursor-pointer"
              >
                <i className="ri-arrow-right-line text-xl"></i>
              </button>
            )}

            {/* Image */}
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.description || 'Photo du colis'}
              className="max-w-full max-h-full object-contain"
            />

            {/* Infos photo */}
            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 text-white p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  {selectedPhoto.description && (
                    <p className="font-medium mb-1">{selectedPhoto.description}</p>
                  )}
                  <p className="text-sm opacity-75">
                    Ajoutée le {formatDate(selectedPhoto.uploaded_at)}
                  </p>
                </div>
                {photos.length > 1 && (
                  <div className="text-sm opacity-75">
                    {photos.findIndex(p => p.filename === selectedPhoto.filename) + 1} / {photos.length}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}