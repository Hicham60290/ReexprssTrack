
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import LazyImage from '../../components/base/LazyImage';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    packages: 0,
    quotes: 0,
    pendingPayments: 0,
    totalSavings: 0
  });
  const [frenchAddress, setFrenchAddress] = useState<any>(null);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [paymentLoading, setPaymentLoading] = useState<string | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteDetails, setQuoteDetails] = useState<any>(null);
  const [loadingQuoteDetails, setLoadingQuoteDetails] = useState(false);
  const [showCarrierModal, setShowCarrierModal] = useState(false);
  const [selectedCarrier, setSelectedCarrier] = useState<any>(null);
  const [carrierOptions, setCarrierOptions] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/connexion');
      return;
    }
    loadDashboardData();
  }, [user, navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      console.log('🔍 Chargement des données pour l\'utilisateur:', user?.id);

      // Charger l'adresse française
      const { data: addressData } = await supabase
        .from('french_addresses')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      setFrenchAddress(addressData);

      // Charger TOUS les devis (y inclu 
      const { data: quotesData, error: quotesError } = await supabase
        .from('quotes')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (quotesError) {
        console.error('❌ Erreur chargement devis:', quotesError);
      } else {
        console.log('✅ Devis chargés:', quotesData?.length || 0);
      }

      // Charger les colis avec plus de détails de debug
      console.log('🔍 Recherche des colis pour user_id:', user?.id);
      
      const { data: packagesData, error: packagesError } = await supabase
        .from('packages')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (packagesError) {
        console.error('❌ Erreur chargement colis:', packagesError);
      } else {
        console.log('✅ Colis trouvés:', packagesData?.length || 0);
        console.log('📦 Détails des colis:', packagesData);
        setPackages(packagesData || []);
      }

      // Récupérer les devis liés aux colis qui n'ont pas encore de devis dans la liste principale
      const packageIds = packagesData?.map(p => p.id) || [];
      const existingQuotePackageIds = quotesData?.map(q => q.package_id).filter(Boolean) || [];
      
      // Chercher les colis qui ont un quote_id mais dont le devis n'est pas encore dans la liste
      const colisAvecDevis = packagesData?.filter(pkg => 
        pkg.quote_id && !existingQuotePackageIds.includes(pkg.id)
      ) || [];

      console.log('🔍 Colis avec devis non listés:', colisAvecDevis.length);

      // Récupérer ces devis manquants
      let devisSupplementaires: any[] = [];
      if (colisAvecDevis.length > 0) {
        const quoteIds = colisAvecDevis.map(pkg => pkg.quote_id).filter(Boolean);
        if (quoteIds.length > 0) {
          const { data: extraQuotes } = await supabase
            .from('quotes')
            .select('*')
            .in('id', quoteIds);
          
          devisSupplementaires = extraQuotes || [];
          console.log('✅ Devis supplémentaires trouvé:', devisSupplementaires.length);
        }
      }

      // NOUVEAU: Créer des "pseudo-devis" pour les colis sans devis
      const colisSansDevis = packagesData?.filter(pkg => 
        !pkg.quote_id && 
        !quotesData?.some(q => q.package_id === pkg.id) &&
        !devisSupplementaires.some(q => q.package_id === pkg.id)
      ) || [];

      console.log('🔍 Colis sans devis trouvés:', colisSansDevis.length);

      const pseudoDevis = colisSansDevis.map(pkg => ({
        id: `pseudo-${pkg.id}`,
        quote_number: `ATTENTE-${pkg.tracking_number}`,
        package_id: pkg.id,
        user_id: pkg.user_id,
        payment_status: 'draft',
        amount_ht: 0,
        amount_ttc: 0,
        created_at: pkg.created_at,
        is_pseudo: true, // Marqueur pour identifier les pseudo-devis
        package_tracking: pkg.tracking_number,
        package_sender: pkg.sender_name
      }));

      // Combiner tous les devis
      const tousLesDevis = [...(quotesData || []), ...devisSupplementaires, ...pseudoDevis];
      
      // Dédupliquer par ID
      const devisUniques = tousLesDevis.filter((devis, index, self) => 
        index === self.findIndex(d => d.id === devis.id)
      );

      console.log('📊 Total devis uniques (avec pseudo-devis):', devisUniques.length);
      setQuotes(devisUniques);

      // Charger les photos de colis
      if (packageIds.length > 0) {
        const { data: photosData } = await supabase
          .from('package_photos')
          .select('*')
          .in('package_id', packageIds)
          .order('created_at', { ascending: false })
          .limit(6);

        console.log('📸 Photos trouvées:', photosData?.length || 0);
        setPhotos(photosData || []);
      }

      // Calculer les statistiques avec tous les devis (sans les pseudo-devis)
      const vraisDevis = devisUniques.filter(q => !q.is_pseudo);
      const pendingQuotes = vraisDevis?.filter(q => q.payment_status === 'pending') || [];

      setStats({
        packages: packagesData?.length || 0,
        quotes: vraisDevis?.length || 0,
        pendingPayments: pendingQuotes.length,
        totalSavings: vraisDevis?.reduce((sum, q) => sum + (q.savings || 0), 0) || 0
      });

      console.log('📊 Statistiques calculées:', {
        packages: packagesData?.length || 0,
        quotes: vraisDevis?.length || 0,
        pendingPayments: pendingQuotes.length
      });

    } catch (error) {
      console.error('❌ Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuotes = async () => {
    const { data: quotesData } = await supabase
      .from('quotes')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });
    setQuotes(quotesData || []);
  };

  const handlePayment = async (quoteId: string) => {
    try {
      setPaymentLoading(quoteId);
      
      console.log('🔵 FRONTEND: Début paiement pour devis:', quoteId);
      
      // Validation stricte des paramètres
      if (!quoteId || quoteId === 'undefined' || quoteId === 'null') {
        throw new Error('ID de devis invalide');
      }

      // Vérifier que le devis existe dans notre liste
      const quote = quotes.find(q => q.id === quoteId);
      if (!quote) {
        throw new Error('Devis introuvable dans la liste');
      }

      // Vérifier que le devis n'est pas un pseudo-devis
      if (quote.is_pseudo) {
        throw new Error('Ce colis est en attente de devis de l\'administrateur');
      }

      // Vérifier qu'un transporteur est sélectionné
      if (!quote.carrier_name) {
        throw new Error('Veuillez d\'abord sélectionner un transporteur');
      }

      // Vérifier que les montants sont cohérents
      if (!quote.amount_ht || !quote.carrier_price) {
        throw new Error('Données de prix incomplètes');
      }
      
      console.log('🔵 FRONTEND: Devis validé:', quote);
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('Vous devez être connecté pour effectuer un paiement');
      }
      
      console.log('🔵 FRONTEND: Session OK, user:', session.user.id);
      
      const token = session.access_token;
      const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      
      const requestBody = {
        quoteId: quoteId,
        carrier_name: quote.carrier_name,
        carrier_price: parseFloat(quote.carrier_price || '0'),
        carrier_delivery_time: quote.carrier_delivery_time,
        amount_ht: parseFloat(quote.amount_ht || '0'),
        amount_ttc: parseFloat(quote.amount_ttc || '0')
      };
      
      console.log('🔵 FRONTEND: Corps de la requête:', requestBody);
      
      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_SUPABASE_URL}/functions/v1/create-quote-payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader,
          },
          body: JSON.stringify(requestBody),
        }
      );

      console.log('🔵 FRONTEND: Réponse reçue, status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔴 FRONTEND: Erreur réponse:', errorText);
        let errorMessage = 'Erreur lors de la création du paiement';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
          console.error('🔴 FRONTEND: Détails erreur:', errorData);
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('🔵 FRONTEND: Données reçues:', data);

      if (!data.success || !data.url) {
        throw new Error('URL de paiement manquante dans la réponse');
      }
      
      console.log('🔵 FRONTEND: Redirection vers Stripe...');
      window.location.href = data.url;
      
    } catch (error: any) {
      console.error('🔴 FRONTEND: Erreur paiement:', error?.message || 'Erreur inconnue');
      alert(`Erreur lors du paiement: ${error?.message || 'Une erreur est survenue'}`);
    } finally {
      setPaymentLoading(null);
    }
  };

  const openQuoteModal = async (quote: any) => {
    setSelectedQuote(quote);
    setShowQuoteModal(true);
    setLoadingQuoteDetails(true);
    
    try {
      // Charger les articles du devis
      const { data: quoteItems } = await supabase
        .from('quote_items')
        .select('*')
        .eq('quote_id', quote.id)
        .order('created_at', { ascending: true });

      // Récupérer tous les package_ids du devis (depuis quote_items ET depuis le champ packages du quote)
      const packageIdsFromItems = quoteItems?.map(item => item.package_id).filter(Boolean) || [];
      const packageIdsFromQuote = quote.packages || [];
      
      // Combiner et dédupliquer les IDs
      const allPackageIds = [...new Set([...packageIdsFromItems, ...packageIdsFromQuote])];
      
      let packagesData: any[] = [];
      let photosData: any[] = [];

      if (allPackageIds.length > 0) {
        // Charger les informations COMPLÈTES des colis
        const { data: pkgs } = await supabase
          .from('packages')
          .select('*')
          .in('id', allPackageIds);
        
        packagesData = pkgs || [];

        // Charger TOUTES les photos des colis liés au devis
        const { data: photos } = await supabase
          .from('package_photos')
          .select('*')
          .in('package_id', allPackageIds)
          .order('created_at', { ascending: false });
        
        photosData = photos || [];
        
        console.log('📸 Photos chargées pour le devis:', photosData.length);
        console.log('📦 Collis liés:', allPackageIds);
        console.log('📦 Détails colis:', packagesData);
      }

      setQuoteDetails({
        items: quoteItems || [],
        packages: packagesData,
        photos: photosData
      });
    } catch (error) {
      console.error('Erreur chargement détails devis:', error);
    } finally {
      setLoadingQuoteDetails(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { text: string; class: string }> = {
      'pending': { text: 'En attente', class: 'bg-yellow-100 text-yellow-800' },
      'paid': { text: 'Payé', class: 'bg-green-100 text-green-800' },
      'cancelled': { text: 'Annulé', class: 'bg-red-100 text-red-800' }
    };
    const statusInfo = statusMap[status] || statusMap.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.class}`}>
        {statusInfo.text}
      </span>
    );
  };

  const carrierOptionsData = [
    {
      id: 'colissimo',
      name: 'Colissimo',
      price: 12.50,
      delivery_time: '3-5 jours',
      description: 'Service standard de La Poste',
      icon: 'ri-mail-line',
      color: 'blue'
    },
    {
      id: 'chronopost',
      name: 'Chronopost',
      price: 18.90,
      delivery_time: '1-2 jours',
      description: 'Livraison express garantie',
      icon: 'ri-time-line',
      color: 'orange'
    },
    {
      id: 'ups',
      name: 'UPS Standard',
      price: 22.00,
      delivery_time: '2-4 jours',
      description: 'Service international fiable',
      icon: 'ri-truck-line',
      color: 'yellow'
    },
    {
      id: 'dhl',
      name: 'DHL Express',
      price: 28.50,
      delivery_time: '1-3 jours',
      description: 'Livraison express internationale',
      icon: 'ri-flight-takeoff-line',
      color: 'red'
    }
  ];

  const openCarrierSelection = (quote: any) => {
    setSelectedQuote(quote);
    setCarrierOptions(carrierOptionsData);
    setShowCarrierModal(true);
  };

  const handleCarrierSelection = async (quote: any, carrier: any) => {
    try {
      setPaymentLoading(quote.id);
      setShowCarrierModal(false);
      
      console.log('🔵 FRONTEND: Sélection transporteur:', carrier);
      console.log('🔵 FRONTEND: Devis:', quote);
      
      // Validation stricte des paramètres
      if (!quote || !quote.id || quote.id === 'undefined' || quote.id === 'null') {
        throw new Error('ID de devis invalide');
      }

      if (!carrier || !carrier.name || !carrier.price) {
        throw new Error('Données transporteur invalides');
      }

      // Vérifier que le devis n'est pas un pseudo-devis
      if (quote.is_pseudo) {
        throw new Error('Ce colis est en attente de devis de l\'administrateur');
      }
      
      // Calculs des montants avec validation stricte
      const baseAmount = parseFloat(quote.amount_ht) || 20; // Valeur par défaut si manquante
      const carrierPrice = parseFloat(carrier.price) || 0;
      
      if (isNaN(baseAmount) || isNaN(carrierPrice)) {
        throw new Error('Montants invalides détectés');
      }
      
      if (baseAmount <= 0) {
        throw new Error('Montant de base invalide');
      }
      
      if (carrierPrice <= 0) {
        throw new Error('Prix transporteur invalide');
      }
      
      const totalHT = baseAmount + carrierPrice;
      const tva = totalHT * 0.20;
      const totalTTC = totalHT + tva;
      
      console.log('🔵 FRONTEND: Calculs validés:', {
        baseAmount,
        carrierPrice,
        totalHT,
        tva,
        totalTTC
      });

      // Obtenir le token d'authentification
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('Vous devez être connecté pour effectuer un paiement');
      }
      
      const token = session.access_token;
      const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      
      const requestBody = {
        quoteId: quote.id,
        carrier_name: carrier.name,
        carrier_price: carrierPrice,
        carrier_delivery_time: carrier.delivery_time || '3-5 jours',
        amount_ht: totalHT,
        tva_amount: tva,
        amount_ttc: totalTTC
      };
      
      console.log('🔵 FRONTEND: Corps de la requête validé:', requestBody);
      
      // Créer le paiement avec le transporteur sélectionné
      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_SUPABASE_URL}/functions/v1/create-quote-payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader,
          },
          body: JSON.stringify(requestBody),
        }
      );

      console.log('🔵 FRONTEND: Réponse reçue, status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔴 FRONTEND: Erreur réponse:', errorText);
        let errorMessage = 'Erreur lors de la création du paiement';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
          console.error('🔴 FRONTEND: Détails erreur:', errorData);
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('🔵 FRONTEND: Données reçues:', data);

      if (!data.success || !data.url) {
        throw new Error('URL de paiement manquante dans la réponse');
      }
      
      console.log('🔵 FRONTEND: Redirection vers Stripe...');
      window.location.href = data.url;
      
    } catch (error: any) {
      console.error('🔴 FRONTEND: Erreur paiement:', error?.message || 'Erreur inconnue');
      alert(`Erreur lors du paiement: ${error?.message || 'Une erreur est survenue'}`);
    } finally {
      setPaymentLoading(null);
      setShowCarrierModal(false);
    }
  };

  const handleChangeCarrier = async (quote: any, carrier: any) => {
    try {
      setPaymentLoading(quote.id);
      setShowCarrierModal(false);
      
      console.log('🔵 FRONTEND: Changement transporteur:', carrier);
      console.log('🔵 FRONTEND: Devis:', quote);
      
      // Validation des paramètres
      if (!quote || !quote.id) {
        throw new Error('Devis invalide');
      }

      if (!carrier || !carrier.name || !carrier.price) {
        throw new Error('Transporteur invalide');
      }

      // Vérifier que le devis n'est pas un pseudo-devis
      if (quote.is_pseudo) {
        throw new Error('Ce colis est en attente de devis de l\'administrateur');
      }
      
      // Calculs des montants avec validation
      const baseAmount = parseFloat(quote.amount_ht) || 0;
      const carrierPrice = parseFloat(carrier.price) || 0;
      
      if (isNaN(baseAmount) || isNaN(carrierPrice)) {
        throw new Error('Montants invalides détectés');
      }
      
      if (baseAmount <= 0) {
        throw new Error('Montant de base invalide');
      }
      
      const totalHT = baseAmount + carrierPrice;
      const tva = totalHT * 0.20;
      const totalTTC = totalHT + tva;
      
      // Calculer la différence avec le transporteur actuel
      const currentTotal = parseFloat(quote.amount_ttc) || 0;
      const difference = totalTTC - currentTotal;
      
      console.log('🔵 FRONTEND: Calculs changement:', {
        baseAmount,
        carrierPrice,
        totalHT,
        tva,
        totalTTC,
        currentTotal,
        difference
      });
      
      // Si la différence est positive, créer un paiement pour la différence
      if (difference > 0) {
        // Obtenir le token d'authentification
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          throw new Error('Vous devez être connecté');
        }
        
        const token = session.access_token;
        const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        
        const requestBody = {
          quoteId: quote.id,
          carrier_name: carrier.name,
          carrier_price: carrierPrice,
          carrier_delivery_time: carrier.delivery_time,
          amount_ht: totalHT,
          tva_amount: tva,
          amount_ttc: totalTTC,
          is_carrier_change: true,
          difference_amount: difference
        };
        
        console.log('🔵 FRONTEND: Corps de la requête changement:', requestBody);
        
        const response = await fetch(
          `${import.meta.env.VITE_PUBLIC_SUPABASE_URL}/functions/v1/create-quote-payment`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': authHeader,
            },
            body: JSON.stringify(requestBody),
          }
        );

        console.log('🔵 FRONTEND: Réponse reçue, status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('🔴 FRONTEND: Erreur réponse:', errorText);
          let errorMessage = 'Erreur lors du changement de transporteur';
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error || errorMessage;
            console.error('🔴 FRONTEND: Détails erreur:', errorData);
          } catch {
            errorMessage = errorText || errorMessage;
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log('🔵 FRONTEND: Données reçues:', data);

        if (!data.url) {
          throw new Error('URL de paiement manquante dans la réponse');
        }
        
        console.log('🔵 FRONTEND: Redirection vers Stripe pour supplément...');
        window.location.href = data.url;
      } else {
        // Si pas de supplément, juste mettre à jour le devis
        const { error } = await supabase
          .from('quotes')
          .update({
            carrier_name: carrier.name,
            carrier_price: carrierPrice,
            carrier_delivery_time: carrier.delivery_time,
            amount_ht: totalHT,
            tax_amount: tva,
            amount_ttc: totalTTC,
            updated_at: new Date().toISOString()
          })
          .eq('id', quote.id);

        if (error) {
          throw new Error('Erreur lors de la mise à jour du transporteur');
        }

        alert(`Transporteur changé avec succès ! ${difference < 0 ? `Vous économisez ${Math.abs(difference).toFixed(2)}€` : 'Aucun supplément requis'}`);
        
        // Recharger les données
        loadDashboardData();
      }
      
    } catch (error: any) {
      console.error('🔴 FRONTEND: Erreur changement transporteur:', error?.message || 'Erreur inconnue');
      alert(`Erreur lors du changement: ${error?.message || 'Une erreur est survenue'}`);
    } finally {
      setPaymentLoading(null);
      setShowCarrierModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header and stats */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Tableau de bord
          </h1>
          <p className="text-gray-600 mt-2">
            Bienvenue {user?.email} ! Gérez vos colis et commandes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <i className="ri-package-line text-blue-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Colis total</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.packages}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <i className="ri-file-text-line text-green-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Devis créés</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.quotes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <i className="ri-time-line text-yellow-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Paiements en attente</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pendingPayments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <i className="ri-money-euro-circle-line text-purple-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Économies totales</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalSavings.toFixed(2)}€</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section des colis récents */}
            {packages.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 border-b border-gray-100">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">
                      Mes colis récents
                    </h2>
                    <Link 
                      to="/packages"
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                    >
                      Voir tous
                      <i className="ri-arrow-right-line"></i>
                    </Link>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="space-y-4">
                    {packages.slice(0, 3).map((pkg) => (
                      <div key={pkg.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <i className="ri-package-line text-purple-600"></i>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {pkg.tracking_number}
                            </h4>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>{pkg.sender_name || 'Expéditeur inconnu'}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                pkg.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                pkg.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                pkg.status === 'received' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {pkg.status === 'delivered' ? 'Livré' :
                                 pkg.status === 'shipped' ? 'Expédié' :
                                 pkg.status === 'received' ? 'Reçu' :
                                 pkg.status === 'stored' ? 'Stocké' :
                                 pkg.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {pkg.weight ? `${pkg.weight}kg` : 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(pkg.created_at).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {packages.length > 3 && (
                    <div className="mt-4 text-center">
                      <Link 
                        to="/packages"
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        +{packages.length - 3} autres colis
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quotes list - Afficher TOUS les devis */}
            {quotes.length > 0 && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Mes devis ({quotes.filter(q => !q.is_pseudo).length})
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Gérez vos devis et procédez aux paiements
                  </p>
                  {quotes.filter(q => q.is_pseudo).length > 0 && (
                    <p className="text-orange-600 text-sm mt-1">
                      <i className="ri-information-line mr-1"></i>
                      {quotes.filter(q => q.is_pseudo).length} colis en attente de devis de l'administrateur
                    </p>
                  )}
                </div>

                {quotes.map((quote) => (
                  <div key={quote.id} className={`bg-white rounded-xl shadow-lg border overflow-hidden ${
                    quote.is_pseudo ? 'border-orange-200' : 'border-gray-100'
                  }`}>
                    <div className={`p-6 border-b ${
                      quote.is_pseudo 
                        ? 'bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-100' 
                        : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-gray-100'
                    }`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {quote.is_pseudo ? (
                              <span className="flex items-center gap-2">
                                <i className="ri-time-line text-orange-500"></i>
                                Colis en attente de devis
                              </span>
                            ) : (
                              `Devis #${quote.quote_number}`
                            )}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <i className="ri-calendar-line"></i>
                              {new Date(quote.created_at).toLocaleDateString('fr-FR')}
                            </span>
                            <span className="flex items-center gap-1">
                              <i className="ri-package-line"></i>
                              {quote.is_pseudo ? quote.package_tracking : (() => {
                                // Trouver le colis associé à ce devis
                                const colisAssocie = packages.find(pkg => 
                                  pkg.quote_id === quote.id || quote.package_id === pkg.id
                                );
                                return colisAssocie?.tracking_number || 'N/A';
                              })()}
                            </span>
                            {quote.is_pseudo && quote.package_sender && (
                              <span className="flex items-center gap-1">
                                <i className="ri-user-line"></i>
                                {quote.package_sender}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          {quote.is_pseudo ? (
                            <div className="text-lg font-bold text-orange-600">
                              En attente
                            </div>
                          ) : (
                            <>
                              <div className="text-2xl font-bold text-blue-600">
                                {quote.carrier_name ? 
                                  `${parseFloat(quote.carrier_price || 0).toFixed(2)}€` : 
                                  quote.amount_ttc ? `${parseFloat(quote.amount_ttc).toFixed(2)}€` : `${parseFloat(quote.amount_ht).toFixed(2)}€`
                                }
                              </div>
                              <div className="text-sm text-gray-500">
                                {quote.carrier_name ? 
                                  `Transporteur: ${quote.carrier_name}` :
                                  quote.amount_ttc ? 'TTC (base)' : 'HT (base)'
                                }
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      {quote.is_pseudo ? (
                        // Affichage pour les colis en attente de devis
                        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-orange-800 mb-1">
                                Colis reçu - Devis en préparation
                              </h4>
                              <p className="text-sm text-orange-700">
                                Notre équipe prépare votre devis avec les meilleures options de livraison. 
                                Vous recevrez un email dès qu'il sera prêt.
                              </p>
                            </div>
                            <div className="text-orange-600">
                              <i className="ri-time-line text-2xl"></i>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Affichage normal pour les vrais devis
                        <>
                          {/* Informations du transporteur */}
                          {quote.carrier_name ? (
                            <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-semibold text-green-800 mb-1">
                                    Transporteur sélectionné
                                  </h4>
                                  <div className="flex items-center gap-4 text-sm text-green-700">
                                    <span className="flex items-center gap-1">
                                      <i className="ri-truck-line"></i>
                                      {quote.carrier_name}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <i className="ri-time-line"></i>
                                      {quote.carrier_delivery_time}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <i className="ri-money-euro-circle-line"></i>
                                      +{parseFloat(quote.carrier_price || 0).toFixed(2)}€
                                    </span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => openCarrierSelection(quote)}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap"
                                >
                                  Changer transporteur
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="mb-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-semibold text-orange-800 mb-1">
                                    Transporteur à sélectionner
                                  </h4>
                                  <p className="text-sm text-orange-700">
                                    Choisissez votre option de livraison pour finaliser votre commande
                                  </p>
                                </div>
                                <button
                                  onClick={() => openCarrierSelection(quote)}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap"
                                >
                                  Choisir transporteur
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Statut du paiement */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${
                                quote.payment_status === 'paid' ? 'bg-green-500' : 
                                quote.payment_status === 'pending' ? 'bg-orange-500' : 'bg-gray-400'
                              }`}></div>
                              <span className="text-sm font-medium text-gray-700">
                                {quote.payment_status === 'paid' ? 'Payé' : 
                                 quote.payment_status === 'pending' ? 'En attente' : 'Brouillon'}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              {/* Bouton Voir le devis */}
                              <Link
                                to={`/quote-payment?id=${quote.id}`}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap"
                              >
                                <i className="ri-eye-line mr-2"></i>
                                Voir le devis
                              </Link>

                              {quote.payment_status === 'pending' && quote.carrier_name && (
                                <button
                                  onClick={() => handlePayment(quote.id)}
                                  disabled={paymentLoading === quote.id}
                                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium whitespace-nowrap disabled:opacity-50"
                                >
                                  {paymentLoading === quote.id ? (
                                    <div className="flex items-center gap-2">
                                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                      Traitement...
                                    </div>
                                  ) : (
                                    <>
                                      <i className="ri-secure-payment-line mr-2"></i>
                                      Payer maintenant
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Message si aucun colis ni devis */}
            {packages.length === 0 && quotes.length === 0 && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Aucun colis déclaré
                </h3>
                <p className="text-gray-600 mb-6">
                  Commencez par déclarer votre premier colis pour bénéficier de nos services.
                </p>
                <Link to="/declarer-colis">
                  <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium whitespace-nowrap">
                    <i className="ri-add-line mr-2"></i>
                    Déclarer un colis
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Right side (address & photos) */}
          <div className="space-y-6">
            {frenchAddress && (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Mon adresse française
                  </h3>
                </div>
                <div className="p-6">
                  <div className="text-sm text-gray-600 space-y-1">
                    <p className="font-medium text-gray-900">{frenchAddress.first_name} {frenchAddress.last_name}</p>
                    <p>{frenchAddress.address_line_1}</p>
                    {frenchAddress.address_line_2 && <p>{frenchAddress.address_line_2}</p>}
                    <p>{frenchAddress.postal_code} {frenchAddress.city}</p>
                    <p>France</p>
                  </div>
                </div>
              </div>
            )}

            {photos.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Photos récentes
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-3">
                    {photos.slice(0, 4).map((photo) => (
                      <div key={photo.id} className="aspect-square">
                        <LazyImage
                          src={photo.photo_url}
                          alt="Photo de colis"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                  {photos.length > 4 && (
                    <p className="text-sm text-gray-500 mt-3 text-center">
                      +{photos.length - 4} autres photos
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de sélection transporteur */}
      {showCarrierModal && selectedQuote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-900">
                  {selectedQuote.carrier_name ? 'Changer de transporteur' : 'Choisir votre transporteur'}
                </h3>
                <button
                  onClick={() => setShowCarrierModal(false)}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>
              
              {selectedQuote.carrier_name && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <i className="ri-information-line mr-1"></i>
                    Transporteur actuel : <strong>{selectedQuote.carrier_name}</strong> 
                    ({selectedQuote.carrier_delivery_time}) - {parseFloat(selectedQuote.carrier_price || 0).toFixed(2)}€
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Si vous choisissez un transporteur plus cher, vous devrez payer la différence.
                  </p>
                </div>
              )}
            </div>

            <div className="p-6">
              {/* Récapitulatif du devis */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Récapitulatif du devis</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Montant de base (HT)</span>
                    <span>{parseFloat(selectedQuote.amount_ht).toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TVA (20%)</span>
                    <span>{(parseFloat(selectedQuote.amount_ht) * 0.20).toFixed(2)}€</span>
                  </div>
                  <div className="border-t pt-2 font-semibold">
                    <div className="flex justify-between">
                      <span>Sous-total</span>
                      <span>{(parseFloat(selectedQuote.amount_ht) * 1.20).toFixed(2)}€</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Options de transporteur */}
              <div className="grid gap-4">
                {carrierOptionsData.map((carrier) => {
                  const baseAmount = parseFloat(selectedQuote.amount_ht) || 0;
                  const carrierPrice = parseFloat(carrier.price) || 0;
                  const totalHT = baseAmount + carrierPrice;
                  const tva = totalHT * 0.20;
                  const totalTTC = totalHT + tva;
                  
                  const currentTotal = parseFloat(selectedQuote.amount_ttc) || (baseAmount * 1.20);
                  const difference = totalTTC - currentTotal;
                  const isCurrentCarrier = selectedQuote.carrier_name === carrier.name;

                  return (
                    <div 
                      key={carrier.name}
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        isCurrentCarrier 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
                              carrier.color === 'blue' ? 'bg-blue-500' :
                              carrier.color === 'orange' ? 'bg-orange-500' :
                              carrier.color === 'yellow' ? 'bg-yellow-500' :
                              carrier.color === 'red' ? 'bg-red-500' : 'bg-gray-500'
                            }`}>
                              <i className={`${carrier.icon} text-white`}></i>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                {carrier.name}
                                {isCurrentCarrier && (
                                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                    Actuel
                                  </span>
                                )}
                              </h4>
                              <p className="text-sm text-gray-600 mb-3">{carrier.description}</p>
                              
                              {/* Calcul détaillé */}
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between text-gray-600">
                                  <span>Frais de transport</span>
                                  <span>+{carrierPrice.toFixed(2)}€</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                  <span>Total HT</span>
                                  <span>{totalHT.toFixed(2)}€</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                  <span>TVA (20%)</span>
                                  <span>{tva.toFixed(2)}€</span>
                                </div>
                                <div className="border-t pt-1 font-semibold">
                                  <div className="flex justify-between">
                                    <span>Total TTC</span>
                                    <span className="text-lg">{totalTTC.toFixed(2)}€</span>
                                  </div>
                                </div>
                                
                                {selectedQuote.carrier_name && !isCurrentCarrier && (
                                  <div className={`flex justify-between font-medium ${
                                    difference > 0 ? 'text-red-600' : difference < 0 ? 'text-green-600' : 'text-gray-600'
                                  }`}>
                                    <span>
                                      {difference > 0 ? 'Supplément à payer' : 
                                       difference < 0 ? 'Économie' : 'Aucune différence'}
                                    </span>
                                    <span>
                                      {difference !== 0 && (difference > 0 ? '+' : '')}{difference.toFixed(2)}€
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="ml-4">
                            {!isCurrentCarrier && (
                              <button
                                onClick={() => selectedQuote.carrier_name ? 
                                  handleChangeCarrier(selectedQuote, carrier) : 
                                  handleCarrierSelection(selectedQuote, carrier)
                                }
                                disabled={paymentLoading === selectedQuote.id}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium whitespace-nowrap disabled:opacity-50"
                              >
                                {paymentLoading === selectedQuote.id ? (
                                  <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Traitement...
                                  </div>
                                ) : (
                                  selectedQuote.carrier_name ? 
                                    (difference > 0 ? 'Payer supplément' : 'Changer gratuitement') :
                                    'Confirmer et payer'
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Quote details modal (original) */}
      {showQuoteModal && selectedQuote && (
        <div className="fixed inset-0 bg-black bg-opacity-5 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Devis #{selectedQuote.quote_number}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 flex items-center">
                    <i className="ri-calendar-line mr-2"></i>
                    Créé le {new Date(selectedQuote.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowQuoteModal(false);
                    setQuoteDetails(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>
            </div>

            <div className="p-6">
              {loadingQuoteDetails ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Statut et montants */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-700 font-semibold text-lg">Statut du paiement:</span>
                      {getStatusBadge(selectedQuote.payment_status)}
                    </div>
                    <div className="border-t border-blue-200 pt-4 space-y-3">
                      <div className="flex justify-between text-base">
                        <span className="text-gray-700">Montant HT:</span>
                        <span className="font-semibold text-gray-900">{selectedQuote.amount_ht?.toFixed(2)}€</span>
                      </div>
                      <div className="flex justify-between text-base">
                        <span className="text-gray-700">TVV ({(selectedQuote.tax_rate || 20)}%):</span>
                        <span className="font-semibold text-gray-900">{selectedQuote.tax_amount?.toFixed(2)}€</span>
                      </div>
                      <div className="flex justify-between text-xl border-t border-blue-200 pt-3">
                        <span className="font-bold text-gray-900">Montant TTC:</span>
                        <span className="font-bold text-blue-600">{selectedQuote.amount_ttc?.toFixed(2)}€</span>
                      </div>
                      {selectedQuote.savings > 0 && (
                        <div className="flex justify-between text-green-700 bg-green-100 -mx-6 -mb-6 mt-4 p-4 rounded-b-lg border-t border-green-200">
                          <span className="font-semibold flex items-center">
                            <i className="ri-price-tag-3-line mr-2 text-lg"></i>
                            Économies réalisées:
                          </span>
                          <span className="font-bold text-xl">{selectedQuote.savings?.toFixed(2)}€</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Informations détaillées des colis */}
                  {quoteDetails?.packages && quoteDetails.packages.length > 0 && (
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <i className="ri-package-line mr-2 text-blue-600"></i>
                        Détails des colis ({quoteDetails.packages.length})
                      </h4>
                      <div className="space-y-4">
                        {quoteDetails.packages.map((pkg: any, index: number) => (
                          <div key={pkg.id} className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-400 hover:shadow-lg transition-all bg-white">
                            <div className="flex justify-between items-start mb-4">
                              <h5 className="text-lg font-bold text-gray-900">
                                Colis #{index + 1}
                              </h5>
                              {pkg.status && (
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                  {pkg.status}
                                </span>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Colonne gauche */}
                              <div className="space-y-3">
                                {pkg.tracking_number && (
                                  <div className="bg-gray-50 rounded-lg p-3">
                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Numéro de suivi</label>
                                    <p className="text-sm font-mono font-medium text-gray-900 mt-1">{pkg.tracking_number}</p>
                                  </div>
                                )}
                                
                                {pkg.carrier && (
                                  <div className="bg-gray-50 rounded-lg p-3">
                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Expéditeur</label>
                                    <p className="text-sm font-medium text-gray-900 mt-1">{pkg.carrier}</p>
                                  </div>
                                )}
                                
                                {pkg.destination && (
                                  <div className="bg-gray-50 rounded-lg p-3">
                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Destination</label>
                                    <p className="text-sm font-medium text-gray-900 mt-1">{pkg.destination}</p>
                                  </div>
                                )}
                                
                                {pkg.weight && (
                                  <div className="bg-gray-50 rounded-lg p-3">
                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Poids</label>
                                    <p className="text-sm font-medium text-gray-900 mt-1 flex items-center">
                                      <i className="ri-scales-line mr-2 text-blue-600"></i>
                                      {pkg.weight} kg
                                    </p>
                                  </div>
                                )}
                              </div>
                              
                              {/* Colonne droite */}
                              <div className="space-y-3">
                                {(pkg.length || pkg.width || pkg.height) && (
                                  <div className="bg-gray-50 rounded-lg p-3">
                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Dimensions (L × l × H)</label>
                                    <p className="text-sm font-medium text-gray-900 mt-1 flex items-center">
                                      <i className="ri-ruler-line mr-2 text-blue-600"></i>
                                      {pkg.length || '?'} × {pkg.width || '?'} × {pkg.height || '?'} cm
                                    </p>
                                  </div>
                                )}
                                
                                {pkg.declared_value !== null && pkg.declared_value !== undefined && (
                                  <div className="bg-gray-50 rounded-lg p-3">
                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Valeur déclarée</label>
                                    <p className="text-sm font-medium text-gray-900 mt-1 flex items-center">
                                      <i className="ri-money-euro-circle-line mr-2 text-green-600"></i>
                                      {pkg.declared_value.toFixed(2)}€
                                    </p>
                                  </div>
                                )}
                                
                                {pkg.storage_fees !== null && pkg.storage_fees !== undefined && pkg.storage_fees > 0 && (
                                  <div className="bg-gray-50 rounded-lg p-3">
                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Frais de stockage</label>
                                    <p className="text-sm font-medium text-gray-900 mt-1 flex items-center">
                                      <i className="ri-archive-line mr-2 text-orange-600"></i>
                                      {pkg.storage_fees.toFixed(2)}€
                                    </p>
                                  </div>
                                )}
                                
                                {pkg.shipping_cost !== null && pkg.shipping_cost !== undefined && pkg.shipping_cost > 0 && (
                                  <div className="bg-gray-50 rounded-lg p-3">
                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Frais d'expédition</label>
                                    <p className="text-sm font-medium text-gray-900 mt-1 flex items-center">
                                      <i className="ri-truck-line mr-2 text-purple-600"></i>
                                      {pkg.shipping_cost.toFixed(2)}€
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Notes du colis */}
                            {pkg.notes && (
                              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                <label className="text-xs font-semibold text-yellow-800 uppercase tracking-wide flex items-center">
                                  <i className="ri-sticky-note-line mr-1"></i>
                                  Notes
                                </label>
                                <p className="text-sm text-yellow-900 mt-1">{pkg.notes}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Photos des colis */}
                  {quoteDetails?.photos && quoteDetails.photos.length > 0 && (
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <i className="ri-image-line mr-2 text-blue-600"></i>
                        Photos des colis ({quoteDetails.photos.length})
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {quoteDetails.photos.map((photo: any) => (
                          <div key={photo.id} className="group relative aspect-square rounded-xl overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-all shadow-sm hover:shadow-lg">
                            <LazyImage
                              src={photo.photo_url}
                              alt={`Photo colis - ${new Date(photo.created_at).toLocaleDateString('fr-FR')}`}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute bottom=0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <p className="text-xs text-white font-medium">
                                {new Date(photo.created_at).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Articles du devis */}
                  {quoteDetails?.items && quoteDetails.items.length > 0 && (
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <i className="ri-file-list-line mr-2 text-blue-600"></i>
                        Articles facturés ({quoteDetails.items.length})
                      </h4>
                      <div className="space-y-3">
                        {quoteDetails.items.map((item: any, index: number) => (
                          <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all bg-gray-50">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h5 className="font-semibold text-gray-900">
                                  Article #{index + 1}
                                </h5>
                                {item.description && (
                                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                )}
                              </div>
                              <span className="font-bold text-lg text-blue-600 ml-4">
                                {item.amount?.toFixed(2)}€
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Informations supplémentaires du devis */}
                  {selectedQuote.notes && (
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
                      <h4 className="font-bold text-blue-900 mb-3 flex items-center text-lg">
                        <i className="ri-information-line mr-2"></i>
                        Notes du devis
                      </h4>
                      <p className="text-sm text-blue-800 leading-relaxed">{selectedQuote.notes}</p>
                    </div>
                  )}

                  {/* Bouton de paiement si en attente */}
                  {selectedQuote.payment_status === 'pending' && (
                    <div className="border-t-2 border-gray-200 pt-6">
                      <button
                        onClick={() => {
                          setShowQuoteModal(false);
                          handlePayment(selectedQuote.id);
                        }}
                        disabled={paymentLoading === selectedQuote.id}
                        className="w-full px-6 py-4 text-lg font-bold text-white bg-gradient-to-r from-green-600 to-green-700 rounded-xl hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
                      >
                        {paymentLoading === selectedQuote.id ? (
                          <>
                            <i className="ri-loader-4-line animate-spin mr-3"></i>
                            Traitement du paiement...
                          </>
                        ) : (
                          <>
                            <i className="ri-secure-payment-line mr-3"></i>
                            Procéder au paiement - {selectedQuote.amount_ttc?.toFixed(2)}€
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Dashboard;
