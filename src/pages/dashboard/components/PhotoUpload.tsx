
import React, { useState, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import Button from '../../../components/base/Button';

interface PhotoUploadProps {
  packageId?: string;
  trackingNumber?: string;
  onUploadSuccess?: (photoUrl: string) => void;
  onClose?: () => void;
}

export default function PhotoUpload({ packageId, trackingNumber, onUploadSuccess, onClose }: PhotoUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [inputTrackingNumber, setInputTrackingNumber] = useState(trackingNumber || '');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    // Vérifier le type de fichier
    if (!selectedFile.type.startsWith('image/')) {
      setError('Veuillez sélectionner une image');
      return;
    }

    // Vérifier la taille (5MB max)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('L\'image doit faire moins de 5MB');
      return;
    }

    setFile(selectedFile);
    setError('');

    // Créer un aperçu
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Veuillez sélectionner une image');
      return;
    }

    if (!packageId && !inputTrackingNumber) {
      setError('Numéro de suivi requis');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Non authentifié');
      }

      const formData = new FormData();
      formData.append('file', file);
      if (packageId) formData.append('packageId', packageId);
      if (inputTrackingNumber) formData.append('trackingNumber', inputTrackingNumber);
      formData.append('description', description);

      const { data, error: uploadError } = await supabase.functions.invoke('upload-package-photo', {
        body: formData,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (uploadError) {
        throw uploadError;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Erreur lors du téléchargement');
      }

      // Succès
      if (onUploadSuccess) {
        onUploadSuccess(data.photo_url);
      }

      // Réinitialiser le formulaire
      setFile(null);
      setDescription('');
      setPreview(null);
      setInputTrackingNumber('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      if (onClose) {
        onClose();
      }

    } catch (err: any) {
      console.error('Erreur upload:', err);
      setError(err.message || 'Erreur lors du téléchargement');
    } finally {
      setUploading(false);
    }
  };

  const removePreview = () => {
    setFile(null);
    setPreview(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          📸 Ajouter une photo
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Zone de téléchargement */}
      <div className="space-y-4">
        {!preview ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
          >
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-camera-line text-2xl text-gray-400"></i>
            </div>
            <p className="text-gray-600 mb-2">Cliquez pour sélectionner une photo</p>
            <p className="text-gray-400 text-sm">JPG, PNG, WebP - Max 5MB</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        ) : (
          <div className="relative">
            <img
              src={preview}
              alt="Aperçu"
              className="w-full h-64 object-cover rounded-lg border"
            />
            <button
              onClick={removePreview}
              className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 cursor-pointer"
            >
              <i className="ri-close-line"></i>
            </button>
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
              {(file!.size / 1024 / 1024).toFixed(1)} MB
            </div>
          </div>
        )}

        {/* Numéro de suivi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Numéro de suivi du colis *
          </label>
          <input
            type="text"
            value={inputTrackingNumber}
            onChange={(e) => setInputTrackingNumber(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: 1Z999AA1234567890"
            required
          />
        </div>

        {/* Description optionnelle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description (optionnel)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            maxLength={200}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Ex: Vue d'ensemble du colis, état de l'emballage..."
          />
          <p className="text-xs text-gray-500 mt-1">
            {description.length}/200 caractères
          </p>
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-end space-x-3">
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
          )}
          <Button
            onClick={handleUpload}
            disabled={!file || uploading || !inputTrackingNumber}
            className="whitespace-nowrap"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Upload en cours...
              </>
            ) : (
              <>
                <i className="ri-upload-line mr-2"></i>
                Télécharger la photo
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
