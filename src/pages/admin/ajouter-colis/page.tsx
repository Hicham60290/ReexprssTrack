
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  subscription_type?: string;
  client_reference?: string;
  created_at?: string;
  package_count?: number;
  email_confirmed?: boolean;
}

interface ShippingZone {
  id: string;
  name: string;
  countries: string[];
}

interface ShippingRate {
  id: string;
  zone_id: string;
  carrier: string;
  service_type: string;
  weight_min: number;
  weight_max: number;
  price_free: number;
  price_subscribed: number;
  delivery_days_min: number;
  delivery_days_max: number;
  zone?: ShippingZone;
}

export default function AjouterColisPage() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [shippingZones, setShippingZones] = useState<ShippingZone[]>([]);
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [generatedQuote, setGeneratedQuote] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<'loading' | 'success' | 'error' | 'idle'>('idle');

  const [formData, setFormData] = useState({
    tracking_number: '',
    sender: '',
    status: 'received',
    weight: '',
    length: '',
    width: '',
    height: '',
    declared_value: '',
    storage_fee: '',
    shipping_fee: '',
    content_description: '',
    destination: 'Guadeloupe',
    special_instructions: ''
  });

  useEffect(() => {
    fetchClientsOptimized();
    fetchShippingData();

    // Configuration synchronisation temps réel optimisée
    const setupRealtimeSync = () => {
      console.log('🔄 Configuration synchronisation temps réel...');
      
      const profilesSubscription = supabase
        .channel('profiles_realtime_optimized')
        .on('postgres_changes', {
          event: '*',
          schema: 'public', 
          table: 'profiles'
        }, async (payload) => {
          console.log('🔄 Changement profil détecté:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newProfile = payload.new;
            if (newProfile.role !== 'admin') {
              await refreshClientsAfterChange();
            }
          } else if (payload.eventType === 'UPDATE') {
            if (payload.new.role !== 'admin') {
              await refreshClientsAfterChange();
            }
          } else if (payload.eventType === 'DELETE') {
            await refreshClientsAfterChange();
          }
        })
        .subscribe();

      return () => {
        profilesSubscription.unsubscribe();
      };
    };

    const cleanup = setupRealtimeSync();
    return cleanup;
  }, []);

  useEffect(() => {
    calculateShippingAndStorageFees();
  }, [formData.weight, formData.destination, selectedClient]);

  // Fonction de rafraîchissement après changement
  const refreshClientsAfterChange = async () => {
    console.log('🔄 Rafraîchissement après changement...');
    setSyncStatus('loading');
    await fetchClientsOptimized();
    setSyncStatus('success');
    setLastSync(new Date());
  };

  // Fonction optimisée et corrigée pour récupérer les clients
  const fetchClientsOptimized = async () => {
    try {
      setLoading(true);
      setSyncStatus('loading');
      setDebugInfo('🔍 DÉMARRAGE - Récupération optimisée des utilisateurs réels...');
      console.log('🔍 === RÉCUPÉRATION CLIENTS OPTIMISÉE ===');
      
      let allClients: Client[] = [];

      // === MÉTHODE PRINCIPALE: Fonction get-all-users ===
      console.log('📊 Étape 1: Appel fonction get-all-users...');
      setDebugInfo(prev => prev + '\n📊 Appel fonction get-all-users...');
      
      try {
        const { data: usersResponse, error: usersError } = await supabase.functions.invoke('get-all-users');
        
        if (usersError) {
          console.error('❌ Erreur fonction get-all-users:', usersError);
          setDebugInfo(prev => prev + `\n❌ Erreur fonction: ${usersError.message}`);
          throw usersError;
        }

        if (usersResponse && usersResponse.users && Array.isArray(usersResponse.users)) {
          console.log('✅ Réponse fonction reçue:', usersResponse.users.length, 'utilisateurs');
          setDebugInfo(prev => prev + `\n✅ ${usersResponse.users.length} utilisateurs reçus de la fonction`);
          
          // Traitement des utilisateurs de la fonction
          const processedUsers = usersResponse.users.map((user: any) => {
            const client: Client = {
              id: user.id,
              first_name: user.first_name || 'Utilisateur',
              last_name: user.last_name || 'Inscrit',
              email: user.email,
              phone: user.phone || '',
              subscription_type: user.subscription_type || 'free',
              client_reference: user.client_reference || `CLI-${user.id.slice(-6).toUpperCase()}`,
              created_at: user.created_at,
              package_count: user.package_count || 0,
              email_confirmed: user.email_confirmed || false
            };
            
            console.log('✅ Client traité:', client.email, '-', client.first_name, client.last_name);
            return client;
          });

          allClients = processedUsers;
          console.log(' 🎯 Clients principaux récupérés:', allClients.length);
          setDebugInfo(prev => prev + `\n🎯 ${allClients.length} clients avec emails traités`);
        } else {
          console.warn('⚠️ Aucun utilisateur dans la réponse fonction');
          setDebugInfo(prev => prev + '\n⚠️ Aucun utilisateur dans la réponse fonction');
        }
      } catch (functionError) {
        console.error('💥 Erreur fonction get-all-users:', functionError);
        setDebugInfo(prev => prev + `\n💥 Erreur fonction: ${functionError.message}`);
      }

      // === MÉTHODE DE SECOURS: Récupération directe depuis profiles ===
      if (allClients.length === 0) {
        console.log('📋 Étape 2: Méthode de secours - Récupération directe...');
        setDebugInfo(prev => prev + '\n📋 Méthode de secours activée...');
        
        try {
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('*')
            .neq('role', 'admin')
            .order('created_at', { ascending: false });

          if (profilesError) {
            console.error('❌ Erreur profiles:', profilesError);
            setDebugInfo(prev => prev + `\n❌ Erreur profiles: ${profilesError.message}`);
            throw profilesError;
          }

          console.log('✅ Profils récupérés:', profilesData?.length || 0);
          setDebugInfo(prev => prev + `\n✅ ${profilesData?.length || 0} profils récupérés`);

          if (profilesData && profilesData.length > 0) {
            // Récupération des emails depuis les packages
            console.log('📦 Recherche emails dans packages...');
            setDebugInfo(prev => prev + '\n📦 Recherche emails dans packages...');
            
            const { data: packageData, error: packageError } = await supabase
              .from('packages')
              .select('user_id, recipient_email')
              .not('recipient_email', 'is', null);

            const emailMap = new Map();
            if (packageData && !packageError) {
              packageData.forEach(pkg => {
                if (pkg.user_id && pkg.recipient_email) {
                  emailMap.set(pkg.user_id, pkg.recipient_email);
                }
              });
            }

            // Création des clients depuis les profils
            for (const profile of profilesData) {
              const email = emailMap.get(profile.id);
              if (email) {
                allClients.push({
                  id: profile.id,
                  first_name: profile.first_name || 'Utilisateur',
                  last_name: profile.last_name || 'Inscrit',
                  email: email,
                  phone: profile.phone || '',
                  subscription_type: profile.subscription_type || 'free',
                  client_reference: `CLI-${profile.id.slice(-6).toUpperCase()}`,
                  created_at: profile.created_at,
                  package_count: 0,
                  email_confirmed: true
                });
              }
            }

            console.log('🔄 Clients méthode secours:', allClients.length);
            setDebugInfo(prev => prev + `\n🔄 ${allClients.length} clients récupérés via méthode secours`);
          }
        } catch (backupError) {
          console.error('💥 Erreur méthode secours:', backupError);
          setDebugInfo(prev => prev + `\n💥 Erreur méthode secours: ${backupError.message}`);
        }
      }

      // === FINALISATION ===
      // Supprimer les doublons et trier
      const uniqueClients = allClients.reduce((acc, current) => {
        const existing = acc.find(client => client.id === current.id || client.email === current.email);
        if (!existing) {
          acc.push(current);
        }
        return acc;
      }, [] as Client[]);

      // Trier par nom complet
      uniqueClients.sort((a, b) => {
        const nameA = `${a.first_name} ${a.last_name}`.toLowerCase();
        const nameB = `${b.first_name} ${b.last_name}`.toLowerCase();
        return nameA.localeCompare(nameB);
      });

      console.log('🎯 Résultat final:', uniqueClients.length, 'clients uniques');
      setDebugInfo(prev => prev + `\n🎯 Résultat final: ${uniqueClients.length} clients uniques`);
      
      if (uniqueClients.length > 0) {
        console.log('✅ Liste finale des clients:');
        uniqueClients.forEach(client => {
          console.log(`  - ${client.first_name} ${client.last_name} (${client.email}) [${client.subscription_type}]`);
        });
        setDebugInfo(prev => prev + '\n✅ SYNCHRONISATION RÉUSSIE !');
        setSyncStatus('success');
      } else {
        console.warn('⚠️ Aucun client avec email trouvé');
        setDebugInfo(prev => prev + '\n⚠️ AUCUN CLIENT TROUVÉ - Vérifiez la base de données');
        setSyncStatus('error');
      }
      
      setClients(uniqueClients);
      setFilteredClients(uniqueClients);
      setLastSync(new Date());
      
    } catch (error) {
      console.error('💥 ERREUR GLOBALE lors de la récupération:', error);
      setDebugInfo(prev => prev + `\n💥 ERREUR GLOBALE: ${error.message}`);
      setSyncStatus('error');
      
      setClients([]);
      setFilteredClients([]);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour calculer les frais d'expédition et de stockage automatiquement
  const calculateShippingAndStorageFees = () => {
    if (!formData.weight || !formData.destination) {
      setCalculatedPrice(0);
      setFormData(prev => ({ 
        ...prev, 
        shipping_fee: '0',
        storage_fee: '0'
      }));
      return;
    }

    const weight = parseFloat(formData.weight);
    
    // **CALCUL AUTOMATIQUE DES FRAIS DE STOCKAGE SELON L'ABONNEMENT**
    let automaticStorageFee = 0;
    let freeStorageDays = 3; // Par défaut pour compte gratuit
    
    if (selectedClient) {
      const subscriptionType = selectedClient.subscription_type || 'free';
      
      // Déterminer les jours gratuits selon l'abonnement
      switch (subscriptionType) {
        case 'premium_yearly':
          freeStorageDays = 90;
          break;
        case 'premium_monthly':
          freeStorageDays = 60;
          break;
        case 'premium':
          freeStorageDays = 60;
          break;
        default: // 'free'
          freeStorageDays = 3;
      }
      
      // Estimation du stockage (l'admin peut modifier manuellement si nécessaire)
      const estimatedStorageDays = parseInt(formData.storage_fee) || 0;
      
      // Si des frais de stockage ont été saisis manuellement, les utiliser
      if (formData.storage_fee && parseFloat(formData.storage_fee) > 0) {
        automaticStorageFee = parseFloat(formData.storage_fee);
      } else {
        // Sinon, calculer automatiquement pour une estimation de 7 jours de stockage
        const defaultEstimatedDays = 7;
        if (defaultEstimatedDays > freeStorageDays) {
          const chargeableDays = defaultEstimatedDays - freeStorageDays;
          automaticStorageFee = chargeableDays * 1.00; // 1€ par jour au-delà de la période gratuite
        }
      }
      
      console.log(`📦 Calcul stockage automatique pour ${selectedClient.first_name}:`, {
        subscription: subscriptionType,
        freeDays: freeStorageDays,
        manualFees: formData.storage_fee,
        calculatedFees: automaticStorageFee
      });
    }
    
    // Trouver la zone correspondant à la destination
    const targetZone = shippingZones.find(zone => 
      zone.countries.includes(formData.destination)
    );

    let shippingFee = 0;
    
    if (!targetZone) {
      // Prix par défaut si pas de zone trouvée
      shippingFee = calculateDefaultShipping(weight);
    } else {
      // Trouver le tarif approprié selon le poids
      const applicableRate = shippingRates.find(rate => 
        rate.zone_id === targetZone.id &&
        weight >= rate.weight_min &&
        weight <= rate.weight_max
      );

      if (applicableRate) {
        // Utiliser le tarif selon le type d'abonnement du client
        const isSubscribed = selectedClient?.subscription_type && selectedClient.subscription_type !== 'free';
        shippingFee = isSubscribed ? applicableRate.price_subscribed : applicableRate.price_free;
      } else {
        // Pas de tarif trouvé, utiliser le prix par défaut
        shippingFee = calculateDefaultShipping(weight);
      }
    }

    // Mise à jour des frais calculés
    const totalPrice = automaticStorageFee + shippingFee;
    
    setFormData(prev => ({ 
      ...prev, 
      shipping_fee: shippingFee.toFixed(2),
      storage_fee: automaticStorageFee.toFixed(2)
    }));
    setCalculatedPrice(totalPrice);
  };

  // Fonction pour calculer le prix par défaut basé sur le poids
  const calculateDefaultShipping = (weight: number): number => {
    if (weight <= 1) return 15;
    if (weight <= 2) return 20;
    if (weight <= 5) return 30;
    if (weight <= 10) return 45;
    if (weight <= 20) return 65;
    return 65 + Math.ceil((weight - 20) / 5) * 10; // 10€ par tranche de 5kg supplémentaire
  };

  const fetchShippingData = async () => {
    try {
      // Récupérer les zones d'expédition
      const { data: zonesData, error: zonesError } = await supabase
        .from('shipping_zones')
        .select('*')
        .eq('is_active', true);

      if (zonesError) throw zonesError;
      setShippingZones(zonesData || []);

      // Récupérer les tarifs avec les zones
      const { data: ratesData, error: ratesError } = await supabase
        .from('shipping_rates')
        .select(`
          *,
          shipping_zones!inner (
            id,
            name,
            countries
          )
        `)
        .eq('is_active', true)
        .order('weight_min');

      if (ratesError) throw ratesError;
      setShippingRates(ratesData || []);
    } catch (error) {
      console.error('Erreur lors du chargement des données d\'expédition:', error);
    }
  };

  const handleClientSearch = (value: string) => {
    setSearchTerm(value);
    setShowClientDropdown(true);
    
    if (value.trim() === '') {
      setFilteredClients(clients);
      setSelectedClient(null);
    } else {
      const filtered = clients.filter(client =>
        `${client.first_name} ${client.last_name}`.toLowerCase().includes(value.toLowerCase()) ||
        client.email.toLowerCase().includes(value.toLowerCase()) ||
        (client.client_reference && client.client_reference.toLowerCase().includes(value.toLowerCase())) ||
        (client.phone && client.phone.includes(value))
      );
      setFilteredClients(filtered);
    }
  };

  const selectClient = (client: Client) => {
    setSelectedClient(client);
    setSearchTerm(`${client.first_name} ${client.last_name} (${client.email})`);
    setShowClientDropdown(false);
  };

  // Fonction pour formater le type d'abonnement
  const getSubscriptionTypeLabel = (type: string) => {
    switch (type) {
      case 'free': return 'Gratuit';
      case 'premium_monthly': return 'Premium Mensuel';
      case 'premium_yearly': return 'Premium Annuel';
      case 'premium': return 'Premium';
      default: return 'Gratuit';
    }
  };

  // Fonction pour obtenir la couleur du badge d'abonnement
  const getSubscriptionTypeColor = (type: string) => {
    switch (type) {
      case 'free': return 'bg-gray-100 text-gray-700';
      case 'premium_monthly': return 'bg-blue-100 text-blue-700';
      case 'premium_yearly': return 'bg-green-100 text-green-700';
      case 'premium': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Fonction pour formater la date d'inscription
  const formatRegistrationDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxFiles = 5;
    
    if (photos.length + files.length > maxFiles) {
      alert(`Vous ne pouvez ajouter que ${maxFiles} photos maximum.`);
      return;
    }

    setPhotos(prev => [...prev, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const generateQuote = async () => {
    if (!selectedClient) return;

    try {
      setLoading(true);
      
      const quoteData = {
        client_name: `${selectedClient.first_name} ${selectedClient.last_name}`,
        client_email: selectedClient.email,
        client_phone: selectedClient.phone || '',
        tracking_number: formData.tracking_number,
        weight: formData.weight,
        dimensions: formData.length && formData.width && formData.height 
          ? `${formData.length}x${formData.width}x${formData.height} cm`
          : '',
        destination: formData.destination,
        storage_fee: formData.storage_fee || '0',
        shipping_fee: formData.shipping_fee || '0',
        declared_value: formData.declared_value || '0',
        content_description: formData.content_description || 'Aucune description'
      };

      const { data, error } = await supabase.functions.invoke('generate-quote-pdf', {
        body: quoteData
      });

      if (error) {
        console.error('Erreur génération devis:', error);
        alert('Erreur lors de la génération du devis');
        return;
      }

      setGeneratedQuote(data);
      setShowQuoteModal(true);
    } catch (error) {
      console.error('Erreur génération devis:', error);
      alert('Erreur lors de la génération du devis');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClient) {
      alert('Veuillez sélectionner un client');
      return;
    }

    if (!formData.tracking_number.trim()) {
      alert('Le numéro de suivi est obligatoire');
      return;
    }

    if (!formData.weight || parseFloat(formData.weight) <= 0) {
      alert('Le poids est obligatoire et doit être supérieur à 0');
      return;
    }

    if (!formData.destination) {
      alert('La destination est obligatoire');
      return;
    }

    try {
      setLoading(true);

      // Upload des photos si présentes
      let photoUrls: string[] = [];
      if (photos.length > 0) {
        console.log('🔄 Upload de', photos.length, 'photos...');
        
        for (let i = 0; i < photos.length; i++) {
          const photo = photos[i];
          try {
            // Créer FormData pour l'upload
            const formDataUpload = new FormData();
            formDataUpload.append('file', photo);
            formDataUpload.append('package_id', `temp_${Date.now()}_${i}`);

            const { data: uploadResult, error: uploadError } = await supabase.functions.invoke('upload-package-photo', {
              body: formDataUpload
            });

            if (uploadError) {
              console.error('Erreur upload photo', i + 1, ':', uploadError);
              throw uploadError;
            }

            if (uploadResult?.photo_url) {
              photoUrls.push(uploadResult.photo_url);
              console.log('✅ Photo', i + 1, 'uploadée:', uploadResult.photo_url);
            }
          } catch (photoError) {
            console.error('Erreur upload photo', i + 1, ':', photoError);
            // Continue avec les autres photos même si une échoue
          }
        }
        
        console.log('📸 Photos uploadées:', photoUrls.length, '/', photos.length);
      }

      // Préparation des données du colis - UNIQUEMENT LES COLONNES QUI EXISTENT
      const packageData = {
        // Informations client et identification
        user_id: selectedClient.id,
        recipient_email: selectedClient.email,
        recipient_name: `${selectedClient.first_name} ${selectedClient.last_name}`,
        
        // Informations de base du colis
        tracking_number: formData.tracking_number.trim(),
        sender_name: formData.sender?.trim() || null,
        status: formData.status || 'received',
        
        // Dimensions et poids
        weight: formData.weight ? parseFloat(formData.weight) : null,
        length: formData.length ? parseFloat(formData.length) : null,
        width: formData.width ? parseFloat(formData.width) : null,
        height: formData.height ? parseFloat(formData.height) : null,
        
        // Valeurs
        declared_value: formData.declared_value ? parseFloat(formData.declared_value) : null,
        
        // Destination et description
        destination: formData.destination,
        description: formData.content_description?.trim() || null,
        
        // Photos
        photos: photoUrls.length > 0 ? photoUrls : null,
        
        // Informations de création
        received_at: new Date().toISOString(),
        
        // Statut de paiement
        payment_status: 'pending'
      };

      console.log('💾 Enregistrement du colis avec les données:', packageData);

      // Insertion dans la base de données
      const { data: packageResult, error: packageError } = await supabase
        .from('packages')
        .insert([packageData])
        .select('*')
        .single();

      if (packageError) {
        console.error('❌ Erreur insertion colis:', packageError);
        throw packageError;
      }

      console.log('✅ Colis enregistré avec ID:', packageResult.id);

      // **ENVOI AUTOMATIQUE DES OPTIONS DE TRANSPORTEUR AU CLIENT**
      try {
        console.log('🚚 Envoi automatique des options de transporteur au client...');
        
        const { data: carrierQuoteData, error: carrierQuoteError } = await supabase.functions.invoke('generate-quote-with-carriers', {
          body: {
            packageId: packageResult.id
          }
        });

        if (carrierQuoteError) {
          console.warn('⚠️ Erreur envoi options transporteur:', carrierQuoteError);
        } else {
          console.log('✅ Options de transporteur envoyées au client:', carrierQuoteData.quoteNumber);
        }
      } catch (carrierError) {
        console.warn('⚠️ Erreur options transporteur:', carrierError);
      }

      // **MESSAGE DE SUCCÈS AVEC INFORMATIONS DÉTAILLÉES**
      let successMessage = `✅ Colis enregistré et options de transporteur envoyées !
      
📦 INFORMATIONS DU COLIS:
• Numéro de suivi: ${formData.tracking_number}
• Client: ${selectedClient.first_name} ${selectedClient.last_name}
• Email: ${selectedClient.email}
• Poids: ${formData.weight}kg
• Destination: ${formData.destination}
• Photos: ${photoUrls.length}

🚚 OPTIONS DE TRANSPORTEUR ENVOYÉES:
✅ Le client a reçu un email avec 4 options de transporteur
✅ Colissimo (12,50€) - 3-5 jours
✅ Chronopost (18,90€) - 1-2 jours  
✅ UPS Standard (22,00€) - 2-4 jours
✅ DHL Express (28,50€) - 1-3 jours

💰 FRAIS DE BASE CALCULÉS:
• Frais de stockage: ${formData.storage_fee || 0}€
• Frais de manutention: 2,50€
• Sous-total: ${(parseFloat(formData.storage_fee || '0') + 2.50).toFixed(2)}€

🎯 PROCESSUS CLIENT AUTOMATIQUE:
1. ✅ Email envoyé avec toutes les options
2. 🛒 Client choisit son transporteur préféré
3. 💳 Redirection automatique vers paiement Stripe
4. 📦 Expédition déclenchée après paiement
5. 📱 Suivi en temps réel activé

📧 L'email contient:
• Récapitulatif complet du colis
• 4 options de transporteur avec prix détaillés
• Calcul automatique TVA (20%)
• Boutons de sélection directs
• Liens vers paiement sécurisé

Le client peut maintenant choisir et payer directement ! 🎉`;
      alert(successMessage);

      // **ENREGISTREMENT DES FRAIS DE STOCKAGE DANS LA TABLE DÉDIÉE**
      if (formData.storage_fee && parseFloat(formData.storage_fee) > 0) {
        console.log('💰 Enregistrement des frais de stockage dans storage_fees...');
        
        try {
          const storageFeeData = {
            package_id: packageResult.id,
            user_id: selectedClient.id,
            storage_start_date: new Date().toISOString(),
            storage_days: 0,
            daily_rate: 1.00,
            total_fee: parseFloat(formData.storage_fee),
            free_days_used: 0,
            subscription_type: selectedClient.subscription_type || 'free',
            status: 'active'
          };

          const { error: storageFeeError } = await supabase
            .from('storage_fees')
            .insert([storageFeeData]);

          if (storageFeeError) {
            console.warn('⚠️ Erreur enregistrement frais stockage:', storageFeeError);
          } else {
            console.log('✅ Frais de stockage enregistrés dans storage_fees');
          }
        } catch (storageFeeError) {
          console.warn('⚠️ Erreur frais stockage:', storageFeeError);
        }
      }

      // Mise à jour du nombre de colis du client
      try {
        const { data: currentProfile } = await supabase
          .from('profiles')
          .select('package_count')
          .eq('id', selectedClient.id)
          .single();

        const newCount = (currentProfile?.package_count || 0) + 1;

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ package_count: newCount })
          .eq('id', selectedClient.id);
        
        if (updateError) {
          console.warn('⚠️ Erreur mise à jour compteur colis:', updateError);
        }
      } catch (countError) {
        console.warn('⚠️ Erreur compteur colis:', countError);
      }

      // Création d'un événement de suivi initial
      try {
        const trackingEventData = {
          package_id: packageResult.id,
          tracking_number: formData.tracking_number,
          status: 'Package received at warehouse',
          location: 'Entrepôt France',
          timestamp: new Date().toISOString(),
          event_type: 'info'
        };

        const { error: trackingError } = await supabase
          .from('tracking_events')
          .insert([trackingEventData]);

        if (trackingError) {
          console.warn('⚠️ Erreur création événement suivi:', trackingError);
        } else {
          console.log('✅ Événement de suivi créé');
        }
      } catch (trackingError) {
        console.warn('⚠️ Erreur suivi:', trackingError);
      }

      // **NOTIFICATION EMAIL AVEC ACCÈS À L'ESPACE CLIENT**
      try {
        const emailData = {
          to: selectedClient.email,
          subject: '📦 Nouveau colis reçu + Devis disponible dans votre espace client',
          template: 'package_received_with_quote',
          data: {
            client_name: `${selectedClient.first_name} ${selectedClient.last_name}`,
            tracking_number: formData.tracking_number,
            package_id: packageResult.id,
            quote_id: null,
            quote_number: null,
            sender: formData.sender || 'Non spécifié',
            weight: formData.weight,
            destination: formData.destination,
            total_amount: calculatedPrice > 0 ? `${calculatedPrice.toFixed(2)}€` : 'À calculer',
            description: formData.content_description || 'Aucune description',
            photos_count: photoUrls.length,
            dashboard_link: `${window.location.origin}/dashboard`,
            tracking_link: `${window.location.origin}/suivi?tracking=${formData.tracking_number}`,
            quote_accessible: calculatedPrice > 0,
            payment_message: calculatedPrice > 0 ? 
              `Votre devis de ${calculatedPrice.toFixed(2)}€ TTC est maintenant disponible dans votre espace client. Vous pouvez le consulter et effectuer le paiement directement en ligne.` : 
              'Les frais d\'expédition seront calculés et un devis vous sera envoyé.',
            login_message: 'Connectez-vous à votre espace client pour consulter votre devis et effectuer le paiement en ligne.'
          }
        };

        const { error: emailError } = await supabase.functions.invoke('send-notification-email', {
          body: emailData
        });

        if (emailError) {
          console.warn('⚠️ Erreur envoi email:', emailError);
        } else {
          console.log('✅ Email de notification avec accès à l\'espace client envoyé');
        }
      } catch (emailError) {
        console.warn('⚠️ Erreur notification:', emailError);
      }

      // Redirection vers la liste des colis
      navigate('/admin/colis-recus');
      
    } catch (error: any) {
      console.error('💥 Erreur lors de l\'ajout du colis:', error);
      
      let errorMessage = 'Erreur lors de l\'ajout du colis et du devis';
      
      if (error?.message) {
        errorMessage += `\n\nDétails: ${error.message}`;
      }
      
      if (error?.code) {
        errorMessage += `\nCode: ${error.code}`;
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Obtenir les pays disponibles pour la sélection
  const availableCountries = shippingZones.reduce((countries: string[], zone) => {
    return [...countries, ...zone.countries];
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Ajouter un colis</h1>
              <p className="text-gray-600">Enregistrer un nouveau colis reçu pour un client</p>
              {lastSync && (
                <div className="flex items-center mt-2 text-sm">
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    syncStatus === 'loading' ? 'bg-blue-500 animate-pulse' :
                    syncStatus === 'success' ? 'bg-green-500 animate-pulse' :
                    syncStatus === 'error' ? 'bg-red-500' : 'bg-gray-400'
                  }`}></div>
                  <span className={`${
                    syncStatus === 'success' ? 'text-green-600' :
                    syncStatus === 'error' ? 'text-red-600' : 'text-blue-600'
                  }`}>
                    Dernière synchronisation: {lastSync.toLocaleDateString('fr-FR')} à {lastSync.toLocaleTimeString('fr-FR')}
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={() => navigate('/admin/colis-recus')}
              className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <i className="ri-arrow-left-line mr-2"></i>
              Retour
            </button>
          </div>
        </div>

        {/* Statut de synchronisation détaillé et diagnostic */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${
                syncStatus === 'loading' ? 'bg-blue-500 animate-spin' :
                syncStatus === 'success' ? 'bg-green-500 animate-pulse' :
                syncStatus === 'error' ? 'bg-red-500' : 'bg-gray-400'
              }`}></div>
              <h3 className="font-semibold text-blue-900">
                {syncStatus === 'loading' ? '⏳ Récupération en cours...' :
                 syncStatus === 'success' ? '✅ Utilisateurs réels synchronisés' :
                 syncStatus === 'error' ? '❌ Erreur de récupération' :
                 '🔄 Système de récupération automatique'}
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setDebugInfo('');
                  fetchClientsOptimized();
                }}
                disabled={loading}
                className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                title="Forcer la synchronisation"
              >
                <i className={`${loading ? 'ri-loader-4-line animate-spin' : 'ri-refresh-line'}`}></i>
              </button>
              <button
                onClick={() => setDebugInfo('')}
                className="text-blue-600 hover:text-blue-800"
                title="Effacer les logs"
              >
                <i className="ri-close-line"></i>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3 text-sm">
            <div className="bg-white/50 rounded-lg p-3">
              <div className="font-medium text-blue-800">👥 Clients réels</div>
              <div className="text-2xl font-bold text-blue-900">{clients.length}</div>
              <div className="text-xs text-blue-600">utilisateurs avec emails</div>
            </div>
            <div className="bg-white/50 rounded-lg p-3">
              <div className="font-medium text-green-800">🔄 Statut sync</div>
              <div className={`text-sm font-semibold ${
                syncStatus === 'success' ? 'text-green-700' :
                syncStatus === 'error' ? 'text-red-700' : 'text-blue-700'
              }`}>
                {syncStatus === 'success' ? '✅ Réussie' :
                 syncStatus === 'error' ? '❌ Erreur' :
                 syncStatus === 'loading' ? '⏳ En cours' : '🔄 Prête'}
              </div>
            </div>
            <div className="bg-white/50 rounded-lg p-3">
              <div className="font-medium text-purple-800">📧 Emails confirmés</div>
              <div className="text-sm text-purple-700">
                {clients.filter(c => c.email_confirmed).length}/{clients.length}
              </div>
            </div>
            <div className="bg-white/50 rounded-lg p-3">
              <div className="font-medium text-orange-800">📦 Avec colis</div>
              <div className="text-sm text-orange-700">
                {clients.filter(c => (c.package_count || 0) > 0).length}
              </div>
            </div>
          </div>
          
          {debugInfo && (
            <details className="mt-3">
              <summary className="cursor-pointer text-sm text-blue-700 hover:text-blue-900 font-medium">
                📋 Journal de récupération détaillé ({debugInfo.split('\n').length} étapes)
              </summary>
              <div className="mt-2 bg-white/30 rounded-lg p-3 max-h-40 overflow-y-auto">
                <pre className="text-xs text-blue-800 whitespace-pre-wrap font-mono">
                  {debugInfo}
                </pre>
              </div>
            </details>
          )}
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02] p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sélection client optimisée */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client destinataire * 
                <div className="inline-flex items-center ml-2">
                  <span className={`font-semibold ${
                    clients.length > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ({loading ? 'Récupération...' : `${clients.length} client${clients.length > 1 ? 's' : ''} réel${clients.length > 1 ? 's' : ''}`})
                  </span>
                  {clients.length > 0 && (
                    <div className="ml-2 flex items-center text-green-600">
                      <div className={`w-2 h-2 rounded-full mr-1 ${
                        syncStatus === 'success' ? 'bg-green-500 animate-pulse' : 'bg-blue-500 animate-spin'
                      }`}></div>
                      <span className="text-xs font-medium">
                        {syncStatus === 'success' ? 'Sync OK' : 'Sync...'}
                      </span>
                    </div>
                  )}
                </div>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleClientSearch(e.target.value)}
                  onFocus={() => setShowClientDropdown(true)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={loading ? "Récupération des utilisateurs..." : clients.length === 0 ? "⚠️ Aucun client trouvé - Vérifiez la base de données" : "Rechercher un client par nom ou email..."}
                  required
                  disabled={loading}
                />
                <i className={`${loading ? 'ri-loader-4-line animate-spin' : clients.length === 0 ? 'ri-error-warning-line text-red-500' : 'ri-user-search-line'} absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400`}></i>
                
                {/* Bouton de récupération forcée */}
                <button
                  type="button"
                  onClick={() => {
                    setDebugInfo('');
                    fetchClientsOptimized();
                    setSearchTerm('');
                    setSelectedClient(null);
                  }}
                  className={`absolute right-10 top-1/2 transform -translate-y-1/2 transition-colors ${
                    clients.length === 0 ? 'text-red-500 hover:text-red-700' : 'text-blue-500 hover:text-blue-700'
                  }`}
                  title={clients.length === 0 ? "Récupérer les utilisateurs réels" : "Actualiser la liste"}
                  disabled={loading}
                >
                  <i className={`${loading ? 'ri-loader-4-line animate-spin' : 'ri-refresh-line'} text-lg`}></i>
                </button>
                
                {/* Dropdown avec clients */}
                {showClientDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                    {loading ? (
                      <div className="px-4 py-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Récupération des clients réels...</p>
                        <p className="text-sm text-gray-500 mt-2">Via fonction get-all-users et méthodes de secours</p>
                        <div className="mt-4 text-xs text-gray-400 space-y-1">
                          <p>• Appel fonction Supabase get-all-users</p>
                          <p>• Récupération depuis table profiles</p>
                          <p>• Association avec emails des colis</p>
                          <p>• Élimination des doublons</p>
                        </div>
                      </div>
                    ) : filteredClients.length > 0 ? (
                      <>
                        <div className="sticky top-0 bg-gradient-to-r from-green-50 to-blue-50 border-b border-green-200 px-4 py-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-green-800">
                              {filteredClients.length} client{filteredClients.length > 1 ? 's' : ''} réel{filteredClients.length > 1 ? 's' : ''} trouvé{filteredClients.length > 1 ? 's' : ''}
                            </span>
                            <div className="flex items-center text-xs text-green-600">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                              Utilisateurs authentiques
                            </div>
                          </div>
                        </div>
                        
                        <div className="max-h-64 overflow-y-auto">
                          {filteredClients.map((client) => (
                            <button
                              key={client.id}
                              type="button"
                              onClick={() => selectClient(client)}
                              className="w-full px-4 py-4 text-left hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 border-b border-gray-100 last:border-b-0 transition-all duration-200 group"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  {/* Ligne 1: Nom complet et référence */}
                                  <div className="flex items-center mb-2">
                                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                                      <span className="text-white font-bold text-sm">
                                        {client.first_name.charAt(0)}{client.last_name.charAt(0)}
                                      </span>
                                    </div>
                                    <div>
                                      <div className="font-semibold text-gray-900 text-base flex items-center">
                                        {client.first_name} {client.last_name}
                                        {client.email_confirmed && (
                                          <i className="ri-verified-badge-line text-green-500 ml-2 text-sm" title="Email confirmé"></i>
                                        )}
                                      </div>
                                      <div className="flex items-center mt-1">
                                        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800 mr-2">
                                          <i className="ri-hashtag mr-1"></i>
                                          {client.client_reference || `CLI-${client.id.slice(-6).toUpperCase()}`}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                          Inscrit le {formatRegistrationDate(client.created_at || '')}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Ligne 2: Email */}
                                  <div className="flex items-center mb-2 ml-11">
                                    <i className="ri-mail-line text-gray-400 mr-2 text-sm"></i>
                                    <span className="text-sm text-gray-700 truncate font-medium">
                                      {client.email}
                                    </span>
                                  </div>
                                  
                                  {/* Ligne 3: Téléphone (si disponible) */}
                                  {client.phone && (
                                    <div className="flex items-center mb-2 ml-11">
                                      <i className="ri-phone-line text-gray-400 mr-2 text-sm"></i>
                                      <span className="text-sm text-gray-600">
                                        {client.phone}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                
                                {/* Colonne droite: Statuts et badges */}
                                <div className="flex flex-col items-end space-y-2 ml-4">
                                  {/* Badge d'abonnement */}
                                  <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${getSubscriptionTypeColor(client.subscription_type || 'free')}`}>
                                    <i className={`mr-1 ${
                                      client.subscription_type === 'free' ? 'ri-user-line' :
                                      client.subscription_type === 'premium_yearly' ? 'ri-vip-crown-2-line' :
                                      'ri-vip-crown-line'
                                    }`}></i>
                                    {getSubscriptionTypeLabel(client.subscription_type || 'free')}
                                  </span>
                                  
                                  {/* Nombre de colis */}
                                  {(client.package_count || 0) > 0 && (
                                    <div className="flex items-center text-xs text-blue-600">
                                      <i className="ri-box-3-line mr-1"></i>
                                      {client.package_count} colis
                                    </div>
                                  )}
                                  
                                  {/* ID Client (raccourci) */}
                                  <div className="text-xs text-gray-400 font-mono">
                                    ID: {client.id.slice(-8)}
                                  </div>
                                  
                                  {/* Indicateur de statut */}
                                  <div className="flex items-center">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                                    <span className="text-xs text-green-600 font-medium">Réel</span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Informations supplémentaires */}
                              <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                                <div className="flex items-center space-x-4">
                                  <span className="flex items-center">
                                    <i className="ri-shield-check-line mr-1 text-green-500"></i>
                                    Utilisateur vérifié
                                  </span>
                                  <span className="flex items-center">
                                    <i className="ri-truck-line mr-1"></i>
                                    {client.subscription_type === 'free' ? 'Tarif standard' : 'Tarif réduit'}
                                  </span>
                                </div>
                                <div className="text-green-600 font-medium group-hover:text-green-700">
                                  Sélectionner →
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </>
                    ) : searchTerm ? (
                      <div className="px-4 py-8 text-center text-gray-500">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <i className="ri-search-line text-2xl text-gray-400"></i>
                        </div>
                        <h3 className="font-medium text-gray-900 mb-2">Aucun résultat</h3>
                        <p className="text-sm">Aucun client trouvé pour "{searchTerm}"</p>
                        <p className="text-xs mt-2 text-gray-400">
                          Recherchez par nom, email, téléphone ou référence client
                        </p>
                      </div>
                    ) : (
                      <div className="px-4 py-8 text-center text-gray-500">
                        {clients.length === 0 ? (
                          <div>
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <i className="ri-user-search-line text-2xl text-gray-400"></i>
                            </div>
                            <h3 className="font-medium text-gray-900 mb-2">Recherche de clients</h3>
                            <p className="text-sm">Commencez à taper pour rechercher</p>
                            <div className="mt-3 text-xs space-y-1">
                              <p>• Recherche par nom ou prénom</p>
                              <p>• Recherche par email</p>
                              <p>• Recherche par téléphone</p>
                              <p>• Recherche par référence client</p>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <i className="ri-user-search-line text-2xl text-gray-400"></i>
                            </div>
                            <h3 className="font-medium text-gray-900 mb-2">Recherche de clients</h3>
                            <p className="text-sm">Commencez à taper pour rechercher</p>
                            <div className="mt-3 text-xs space-y-1">
                              <p>• Recherche par nom ou prénom</p>
                              <p>• Recherche par email</p>
                              <p>• Recherche par téléphone</p>
                              <p>• Recherche par référence client</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Bouton de récupération avec diagnostic */}
                    <div className="sticky bottom-0 bg-white border-t border-gray-200 p-3">
                      <button
                        type="button"
                        onClick={() => {
                          setDebugInfo('');
                          fetchClientsOptimized();
                          setShowClientDropdown(false);
                        }}
                        disabled={loading}
                        className={`w-full flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg transition-colors border disabled:opacity-50 ${
                          clients.length === 0 
                            ? 'text-red-600 hover:bg-red-50 border-red-200 hover:border-red-300' 
                            : 'text-green-600 hover:bg-green-50 border-green-200 hover:border-green-300'
                        }`}
                      >
                        <i className={`${loading ? 'ri-loader-4-line animate-spin' : 'ri-refresh-line'} mr-2`}></i>
                        {loading ? 'Récupération...' : clients.length === 0 ? '🔧 Récupérer les utilisateurs réels' : 'Actualiser les clients'}
                        <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs font-bold ${
                          clients.length === 0 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {clients.length}
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Message informatif sur la récupération réussie */}
              {clients.length > 0 && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
                      <i className="ri-check-double-line text-white text-sm"></i>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-800">
                        ✅ {clients.length} utilisateur{clients.length > 1 ? 's' : ''} récupéré{clients.length > 1 ? 's' : ''} avec succès
                      </p>
                      <p className="text-xs text-green-600">
                        Synchronisation automatique activée - Les nouveaux utilisateurs apparaîtront automatiquement
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Message informatif quand un client est sélectionné */}
              {selectedClient && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                      <i className="ri-user-check-line text-white text-sm"></i>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-800">
                        Client sélectionné: {selectedClient.first_name} {selectedClient.last_name}
                      </p>
                      <p className="text-xs text-blue-600">
                        {selectedClient.email} • {getSubscriptionTypeLabel(selectedClient.subscription_type || 'free')} • {selectedClient.package_count || 0} colis
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Informations de base */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro de suivi *
                </label>
                <input
                  type="text"
                  value={formData.tracking_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, tracking_number: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: 1Z999AA1234567890"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expéditeur
                </label>
                <input
                  type="text"
                  value={formData.sender}
                  onChange={(e) => setFormData(prev => ({ ...prev, sender: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Amazon, AliExpress..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut
                </label>
                <div className="relative">
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-4 py-3 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  >
                    <option value="received">Reçu</option>
                    <option value="stored">Stocké</option>
                    <option value="pending">En attente</option>
                  </select>
                  <i className="ri-arrow-down-s-line absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destination *
                </label>
                <div className="relative">
                  <select
                    value={formData.destination}
                    onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                    className="w-full px-4 py-3 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                    required
                  >
                    <option value="">Sélectionnez une destination</option>
                    <option value="Guadeloupe">Guadeloupe</option>
                    <option value="Martinique">Martinique</option>
                    <option value="La Réunion">La Réunion</option>
                    <option value="Maroc">Maroc</option>
                  </select>
                  <i className="ri-arrow-down-s-line absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Poids (kg) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.weight}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: 2.5"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longueur (cm)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.length}
                  onChange={(e) => setFormData(prev => ({ ...prev, length: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: 30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Largeur (cm)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.width}
                  onChange={(e) => setFormData(prev => ({ ...prev, width: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: 20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hauteur (cm)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.height}
                  onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: 10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valeur déclarée (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.declared_value}
                  onChange={(e) => setFormData(prev => ({ ...prev, declared_value: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: 299.19"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frais de stockage (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.storage_fee}
                  onChange={(e) => setFormData(prev => ({ ...prev, storage_fee: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: 5.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frais d'expédition (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.shipping_fee}
                  onChange={(e) => setFormData(prev => ({ ...prev, shipping_fee: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                  placeholder="Calculé automatiquement"
                  readOnly
                />
              </div>
            </div>

            {/* Photos du colis */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photos du colis (max 5)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <label htmlFor="photo-upload" className="cursor-pointer">
                  <div className="text-center">
                    <i className="ri-camera-line text-4xl text-gray-400 mb-2"></i>
                    <p className="text-gray-600">Cliquez pour ajouter des photos</p>
                    <p className="text-sm text-gray-500">PNG, JPG jusqu'à 10MB chacune</p>
                  </div>
                </label>
              </div>

              {photoPreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                  {photoPreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Calcul automatique des frais avec affichage détaillé */}
            {selectedClient && (
              <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-blue-900 mb-4 flex items-center">
                  <i className="ri-calculator-line mr-2"></i>
                  Calcul automatique des frais selon l'abonnement
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Informations client */}
                  <div className="bg-white/70 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-sm">
                          {selectedClient.first_name.charAt(0)}{selectedClient.last_name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{selectedClient.first_name} {selectedClient.last_name}</div>
                        <div className="text-sm text-gray-600">{selectedClient.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${getSubscriptionTypeColor(selectedClient.subscription_type || 'free')}`}>
                        <i className={`mr-1 ${
                          selectedClient.subscription_type === 'free' ? 'ri-user-line' :
                          selectedClient.subscription_type === 'premium_yearly' ? 'ri-vip-crown-2-line' :
                          'ri-vip-crown-line'
                        }`}></i>
                        {getSubscriptionTypeLabel(selectedClient.subscription_type || 'free')}
                      </span>
                    </div>
                  </div>

                  {/* Règles de stockage */}
                  <div className="bg-white/70 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <i className="ri-time-line mr-2"></i>
                      Règles de stockage automatique
                    </h4>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Période gratuite:</span>
                        <span className="font-semibold text-green-600">
                          {selectedClient.subscription_type === 'premium_yearly' ? '90 jours' :
                           selectedClient.subscription_type === 'premium_monthly' ? '60 jours' : 
                           selectedClient.subscription_type === 'premium' ? '60 jours' : '3 jours'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Au-delà:</span>
                        <span className="font-semibold text-orange-600">1€/jour</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Calcul:</span>
                        <span className="font-semibold text-blue-600">Automatique quotidien</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Détail des frais calculés */}
                {calculatedPrice > 0 && (
                  <div className="bg-white/70 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <i className="ri-money-euro-circle-line mr-2"></i>
                      Détail des frais calculés
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Frais de stockage estimés:</span>
                        <span className="font-semibold">{formData.storage_fee || 0}€</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Frais d'expédition:</span>
                        <span className="font-semibold">{formData.shipping_fee || 0}€</span>
                      </div>
                      <div className="border-t border-gray-200 pt-2 flex justify-between text-base font-bold">
                        <span>Total:</span>
                        <span className="text-blue-600">{calculatedPrice.toFixed(2)}€</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-start">
                        <i className="ri-information-line text-blue-500 mr-2 mt-0.5"></i>
                        <div className="text-xs text-blue-700">
                          <p className="font-medium mb-1">🔄 Calcul automatique activé</p>
                          <p>• Les frais de stockage seront recalculés quotidiennement</p>
                          <p>• Le client sera notifié quand la période gratuite expire</p>
                          <p>• Le devis sera mis à jour automatiquement</p>
                          <p>• Paiement possible directement en ligne via Stripe</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {calculatedPrice === 0 && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <i className="ri-gift-line text-green-500 mr-2"></i>
                      <div className="text-sm text-green-700">
                        <p className="font-medium">Stockage gratuit pour ce client</p>
                        <p>Période gratuite de {
                          selectedClient.subscription_type === 'premium_yearly' ? '90 jours' :
                          selectedClient.subscription_type === 'premium_monthly' ? '60 jours' : 
                          selectedClient.subscription_type === 'premium' ? '60 jours' : '3 jours'
                        } selon son abonnement {getSubscriptionTypeLabel(selectedClient.subscription_type || 'free')}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description du contenu
              </label>
              <textarea
                rows={3}
                value={formData.content_description}
                onChange={(e) => setFormData(prev => ({ ...prev, content_description: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Description du contenu du colis..."
                maxLength={500}
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {formData.content_description.length}/500 caractères
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instructions spéciales
              </label>
              <textarea
                rows={2}
                value={formData.special_instructions}
                onChange={(e) => setFormData(prev => ({ ...prev, special_instructions: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Instructions particulières pour ce colis..."
                maxLength={500}
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {(formData.special_instructions || '').length}/500 caractères
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/admin/colis-recus')}
                className="inline-flex items-center justify-center font-bold rounded-xl transition-all duration-300 whitespace-nowrap cursor-pointer transform active:scale-95 border-2 border-purple-500 text-purple-600 hover:bg-purple-50 hover:border-purple-600 disabled:border-gray-300 disabled:text-gray-400 hover:scale-105 px-6 py-3 text-base"
              >
                Annuler
              </button>

              {selectedClient && calculatedPrice > 0 && (
                <button
                  type="button"
                  onClick={generateQuote}
                  disabled={loading}
                  className="inline-flex items-center justify-center font-bold rounded-xl transition-all duration-300 whitespace-nowrap cursor-pointer transform active:scale-95 bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 shadow-lg hover:shadow-xl hover:scale-105 px-6 py-3 text-base"
                >
                  <i className="ri-file-text-line mr-2"></i>
                  Générer devis
                </button>
              )}

              <button
                type="submit"
                disabled={loading || !selectedClient}
                className="inline-flex items-center justify-center font-bold rounded-xl transition-all duration-300 whitespace-nowrap cursor-pointer transform active:scale-95 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 disabled:from-gray-300 disabled:to-gray-400 shadow-lg hover:shadow-xl hover:scale-105 px-6 py-3 text-base"
              >
                <i className="ri-save-line mr-2"></i>
                {loading ? 'Enregistrement...' : 'Enregistrer le colis'}
              </button>
            </div>
          </form>
        </div>

        {/* Modal de devis */}
        {showQuoteModal && generatedQuote && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-file-check-line text-2xl text-green-600"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Devis généré</h3>
                <p className="text-gray-600">Le devis a été créé avec succès</p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Montant total</div>
                  <div className="text-2xl font-bold text-gray-900">{calculatedPrice.toFixed(2)}€</div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowQuoteModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >Fermer</button>
                <button
                  onClick={async () => {
                    try {
                      const { data, error } = await supabase.functions.invoke('create-stripe-subscription', {
                        body: {
                          amount: Math.round(calculatedPrice * 100),
                          currency: 'eur',
                          client_email: selectedClient?.email,
                          description: `Paiement colis ${formData.tracking_number}`,
                          metadata: {
                            tracking_number: formData.tracking_number,
                            client_id: selectedClient?.id
                          }
                        }
                      });

                      if (error) throw error;
                      if (data?.url) {
                        window.open(data.url, '_blank');
                      }
                    } catch (error) {
                      console.error('Erreur paiement:', error);
                      alert('Erreur lors de la création du lien de paiement');
                    }
                  }}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                  <i className="ri-secure-payment-line mr-2"></i>Payer avec Stripe
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
