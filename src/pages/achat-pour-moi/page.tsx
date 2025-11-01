import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import Button from '../../components/base/Button';
import Card from '../../components/base/Card';
import { Link } from 'react-router-dom';

interface ArticleItem {
  id: string;
  nom: string;
  options: string;
  url: string;
  prix: string;
  quantite: string;
}

const AchatPourMoi: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    nomSite: '',
    urlSite: '',
    adresseExpedition: 'Tualatin, Oregon',
    instructions: ''
  });

  const [articles, setArticles] = useState<ArticleItem[]>([
    { id: '1', nom: '', options: '', url: '', prix: '', quantite: '' }
  ]);

  React.useEffect(() => {
    if (user) {
      getProfile();
    }
  }, [user]);

  const getProfile = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single();
      setProfile(profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArticleChange = (id: string, field: string, value: string) => {
    setArticles(prev => prev.map(article => 
      article.id === id ? { ...article, [field]: value } : article
    ));
  };

  const addArticle = () => {
    const newId = (articles.length + 1).toString();
    setArticles(prev => [...prev, { 
      id: newId, 
      nom: '', 
      options: '', 
      url: '', 
      prix: '', 
      quantite: '' 
    }]);
  };

  const removeArticle = (id: string) => {
    if (articles.length > 1) {
      setArticles(prev => prev.filter(article => article.id !== id));
    }
  };

  const calculateTotal = () => {
    const subtotal = articles.reduce((sum, article) => {
      const prix = parseFloat(article.prix) || 0;
      const quantite = parseInt(article.quantite) || 0;
      return sum + (prix * quantite);
    }, 0);

    const fraisTraitement = 0.00; // Les frais sont indiqués mais à 0 dans l'image
    const taxeDomestique = 0.00;
    const fraisService = getServiceFee();
    
    return {
      subtotal,
      fraisTraitement,
      taxeDomestique,
      fraisService,
      total: subtotal + fraisTraitement + taxeDomestique + fraisService
    };
  };

  const getServiceFee = () => {
    if (!profile) return 19.99;
    return profile.subscription_type === 'free' ? 19.99 : 14.99;
  };

  const isFormValid = () => {
    return formData.nomSite && 
           formData.urlSite && 
           articles.some(article => article.nom && article.prix && article.quantite);
  };

  const handleSubmit = async () => {
    if (!user || !isFormValid()) return;

    setLoading(true);
    setError('');

    try {
      const totals = calculateTotal();
      
      const { error: insertError } = await supabase
        .from('shopping_requests')
        .insert([
          {
            user_id: user.id,
            nom_site: formData.nomSite,
            url_site: formData.urlSite,
            adresse_expedition: formData.adresseExpedition,
            instructions: formData.instructions,
            articles: articles.filter(article => article.nom),
            subtotal: totals.subtotal,
            frais_service: totals.fraisService,
            total: totals.total,
            statut: 'en_attente',
            created_at: new Date().toISOString()
          }
        ]);

      if (insertError) throw insertError;

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    const totals = calculateTotal();
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="pt-20">
          <div className="max-w-2xl mx-auto px-4 py-16 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="ri-check-line text-3xl text-green-600"></i>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Demande d'achat envoyée !
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Votre demande d'achat sur {formData.nomSite} a été transmise à notre équipe. 
              Vous recevrez une confirmation et un devis détaillé sous 24h.
            </p>
            <div className="bg-gray-50 rounded-lg p-6 text-left mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">Récapitulatif de votre commande :</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-medium">Site :</span> {formData.nomSite}</p>
                <p><span className="font-medium">Articles :</span> {articles.filter(a => a.nom).length} article(s)</p>
                <p><span className="font-medium">Sous-total :</span> ${totals.subtotal.toFixed(2)}</p>
                <p><span className="font-medium">Frais de service :</span> ${totals.fraisService.toFixed(2)}</p>
                <p><span className="font-medium">Total estimé :</span> ${totals.total.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => window.location.href = '/dashboard'}>
                Retour au tableau de bord
              </Button>
              <Button variant="outline" onClick={() => {
                setSuccess(false);
                setFormData({ nomSite: '', urlSite: '', adresseExpedition: 'Tualatin, Oregon', instructions: '' });
                setArticles([{ id: '1', nom: '', options: '', url: '', prix: '', quantite: '' }]);
              }}>
                Nouvelle demande
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              🛍️ Service Achat pour Moi
            </h1>
            <p className="text-lg text-gray-600">
              Notre équipe achète et expédie vos articles pour vous
            </p>
          </div>

          {/* Tarification */}
          <Card className="mb-8">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Tarification du service</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-6 rounded-lg border-2 ${!profile || profile?.subscription_type === 'free' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <i className="ri-user-line text-xl text-gray-600"></i>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Compte gratuit</h3>
                    <p className="text-3xl font-bold text-gray-900 mb-2">19,99€</p>
                    <p className="text-gray-600 text-sm">par commande + prix des articles</p>
                  </div>
                </div>
                <div className={`p-6 rounded-lg border-2 ${profile?.subscription_type !== 'free' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <i className="ri-vip-crown-line text-xl text-blue-600"></i>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Abonné Premium</h3>
                    <p className="text-3xl font-bold text-green-600 mb-2">14,99€</p>
                    <p className="text-gray-600 text-sm">par commande + prix des articles</p>
                  </div>
                </div>
              </div>
              {!profile || profile?.subscription_type === 'free' ? (
                <div className="mt-6">
                  <p className="text-gray-600 mb-4">💡 Économisez 5€ par commande avec un abonnement Premium</p>
                  <Button variant="outline" size="sm" onClick={() => window.location.href = '/abonnement'}>
                    Découvrir Premium
                  </Button>
                </div>
              ) : (
                <div className="mt-6">
                  <p className="text-green-600 font-medium">✅ Vous bénéficiez du tarif Premium !</p>
                </div>
              )}
            </div>
          </Card>

          <form id="achat-pour-moi-form" className="space-y-8">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {/* Informations boutique */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Dans quelle boutique souhaitez-vous que nous commandions ?
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du site *
                  </label>
                  <input
                    type="text"
                    name="nomSite"
                    placeholder="Action"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="urlSite" className="block text-sm font-medium text-gray-700 mb-2">
                    URL du site *
                  </label>
                  <input
                    type="url"
                    id="urlSite"
                    name="urlSite"
                    value={formData.urlSite}
                    onChange={handleInputChange}
                    placeholder="https://www.action.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </Card>

            {/* Articles */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Indiquez-nous les articles que vous souhaitez que nous commandions
                </h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addArticle}
                >
                  <i className="ri-add-line mr-2"></i>
                  Ajouter une ligne
                </Button>
              </div>

              <div className="space-y-4">
                {/* En-tête du tableau */}
                <div className="hidden md:grid md:grid-cols-6 gap-4 text-sm font-medium text-gray-700 pb-2 border-b">
                  <div>Nom de l'Article</div>
                  <div>Options</div>
                  <div>URL de l'Article</div>
                  <div>Prix (unitaire)</div>
                  <div>Quantité</div>
                  <div></div>
                </div>

                {/* Lignes d'articles */}
                {articles.map((article) => (
                  <div key={article.id} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="block md:hidden text-sm font-medium text-gray-700 mb-1">Nom de l'Article</label>
                      <input
                        type="text"
                        name={`nom-${article.id}`}
                        value={article.nom}
                        onChange={(e) => handleArticleChange(article.id, 'nom', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Ex: iPhone 15 Pro"
                      />
                    </div>
                    <div>
                      <label className="block md:hidden text-sm font-medium text-gray-700 mb-1">Options</label>
                      <input
                        type="text"
                        name={`options-${article.id}`}
                        value={article.options}
                        onChange={(e) => handleArticleChange(article.id, 'options', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Couleur, taille..."
                      />
                    </div>
                    <div>
                      <label className="block md:hidden text-sm font-medium text-gray-700 mb-1">URL de l'Article</label>
                      <input
                        type="url"
                        name={`url-${article.id}`}
                        value={article.url}
                        onChange={(e) => handleArticleChange(article.id, 'url', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <label className="block md:hidden text-sm font-medium text-gray-700 mb-1">Prix (unitaire)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        name={`prix-${article.id}`}
                        value={article.prix}
                        onChange={(e) => handleArticleChange(article.id, 'prix', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block md:hidden text-sm font-medium text-gray-700 mb-1">Quantité</label>
                      <input
                        type="number"
                        min="1"
                        name={`quantite-${article.id}`}
                        value={article.quantite}
                        onChange={(e) => handleArticleChange(article.id, 'quantite', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="1"
                      />
                    </div>
                    <div className="flex items-end">
                      {articles.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeArticle(article.id)}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <i className="ri-delete-bin-line"></i>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Résumé des coûts */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Résumé des coûts estimés</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Frais d'Envoi/Traitement Domestique (FR)</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Taxe Domestique (FR)</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Articles (sous-total)</span>
                  <span>${calculateTotal().subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium text-blue-600">
                  <span>Frais de service ReexpresseTrack</span>
                  <span>${getServiceFee().toFixed(2)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>${calculateTotal().total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Adresse d'expédition */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                À quel endroit voulez-vous expédier ces articles ?
              </h2>
              <div className="relative">
                <select
                  name="adresseExpedition"
                  value={formData.adresseExpedition}
                  onChange={(e) => handleInputChange('adresseExpedition', e.target.value)}
                  className="w-full px-4 py-3 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="">Sélectionnez une destination</option>
                  <option value="Guadeloupe">Guadeloupe</option>
                  <option value="Martinique">Martinique</option>
                  <option value="Guyane française">Guyane française</option>
                  <option value="La Réunion">La Réunion</option>
                  <option value="Maroc">Maroc</option>
                </select>
                <i className="ri-arrow-down-s-line absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
              </div>
            </Card>

            {/* Instructions */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Souhaitez-vous nous communiquer d'autres instructions ?
              </h2>
              <textarea
                name="instructions"
                value={formData.instructions}
                onChange={(e) => handleInputChange('instructions', e.target.value)}
                rows={4}
                maxLength={500}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Merci de nous indiquer toute instruction complémentaire. Nous ferons de notre mieux pour satisfaire toutes vos exigences dans la limite du raisonnable."
              />
              <div className="text-right text-sm text-gray-500 mt-2">
                {formData.instructions.length}/500 caractères
              </div>
            </Card>

            {/* Bouton de soumission */}
            <div className="text-center">
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!isFormValid() || loading}
                size="lg"
                className="px-12"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <i className="ri-shopping-cart-line mr-2"></i>
                    Envoyer la demande d'achat
                  </>
                )}
              </Button>
              <p className="text-sm text-gray-500 mt-4">
                Vous recevrez une confirmation et un devis détaillé sous 24h
              </p>
            </div>

            {/* Boutons de navigation supplémentaires */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/dashboard">
                  <Button variant="outline" className="w-full sm:w-auto whitespace-nowrap">
                    <i className="ri-dashboard-line mr-2"></i>
                    Retour au dashboard
                  </Button>
                </Link>
                <Link to="/calculateur">
                  <Button variant="outline" className="w-full sm:w-auto whitespace-nowrap">
                    <i className="ri-calculator-line mr-2"></i>
                    Calculer frais d'expédition
                  </Button>
                </Link>
                <Link to="/aide">
                  <Button variant="outline" className="w-full sm:w-auto whitespace-nowrap">
                    <i className="ri-question-line mr-2"></i>
                    Besoin d'aide ?
                  </Button>
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AchatPourMoi;
