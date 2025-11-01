
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setSubmitMessage('Veuillez saisir votre email');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const formData = new URLSearchParams();
      formData.append('email', email);

      const response = await fetch('https://readdy.ai/api/form/d2u6khr3b7dn4hkpn23g', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData
      });

      if (response.ok) {
        setSubmitMessage('✅ Inscription réussie ! Merci de votre confiance.');
        setEmail('');
      } else {
        setSubmitMessage('❌ Erreur lors de l\'inscription. Veuillez réessayer.');
      }
    } catch (error) {
      setSubmitMessage('❌ Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <img 
                src="https://static.readdy.ai/image/99ff8ee0c27f1c25e3ad19898dcaee78/c414f29906d3d0747bacc0a0626da976.png" 
                alt="ReexpressTrack" 
                className="h-8 w-auto"
              />
            </div>
            <p className="text-gray-400 mb-4">
              Votre partenaire de confiance pour l'expédition vers les DOM-TOM depuis 2020.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="ri-facebook-fill text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="ri-twitter-fill text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="ri-instagram-fill text-xl"></i>
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/packages" className="text-gray-400 hover:text-white transition-colors">
                  Expédition DOM-TOM
                </Link>
              </li>
              <li>
                <Link to="/achat-pour-moi" className="text-gray-400 hover:text-white transition-colors">
                  Achat pour moi
                </Link>
              </li>
              <li>
                <Link to="/gestion-retour" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                  Service Retours
                  <span className="bg-yellow-500 text-gray-900 text-xs px-2 py-1 rounded-full font-semibold">
                    NOUVEAU
                  </span>
                </Link>
              </li>
              <li>
                <Link to="/abonnement" className="text-gray-400 hover:text-white transition-colors">
                  Abonnements
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Ressources</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/blog" className="text-gray-400 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/calculateur" className="text-gray-400 hover:text-white transition-colors">
                  Calculateur de tarifs
                </Link>
              </li>
              <li>
                <Link to="/suivi" className="text-gray-400 hover:text-white transition-colors">
                  Suivi de colis
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact</h3>
              <ul className="space-y-2">
                <li>
                  <span className="text-gray-600">📧 contact@reexpresstrack.com</span>
                </li>
                <li>
                  <span className="text-gray-600">📞 02076085500</span>
                </li>
                <li>
                  <span className="text-gray-600">
                    20 Wenlock Road<br />
                    London, England, N1 7GU<br />
                    Royaume-Uni
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Newsletter section Gen Z */}
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="max-w-md mx-auto text-center">
            <h3 className="text-xl font-black text-white mb-4">
              <span className="mr-2">📧</span>Stay Updated !
            </h3>
            <p className="text-gray-300 mb-6">
              Reçois nos tips exclusifs, promos et nouveautés directement dans ta boîte mail 📬
            </p>
            
            <form id="newsletter-form" data-readdy-form onSubmit={handleSubmit}>
              <div className="flex">
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ton@email.com"
                  required
                  className="flex-1 px-4 py-3 rounded-l-xl bg-white/10 backdrop-blur-sm text-white placeholder-gray-400 border border-gray-600 focus:border-purple-500 focus:outline-none"
                />
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-r-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="mr-2">🚀</span>
                  {isSubmitting ? 'Envoi...' : 'Go !'}
                </button>
              </div>
              
              {submitMessage && (
                <p className={`mt-3 text-sm ${submitMessage.includes('✅') ? 'text-green-400' : 'text-red-400'}`}>
                  {submitMessage}
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Liens légaux avec style moderne */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm flex items-center">
              <span className="mr-2">©</span>
              2025 ReexpresseTrack. Made with 
              <span className="mx-2 text-red-400 animate-pulse">❤️</span>
              for the next generation of shippers.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              {[
                { to: '/mentions-legales', label: 'Mentions légales' },
                { to: '/cgv', label: 'CGV' },
                { to: '/confidentialite', label: 'Privacy' }
              ].map((item, index) => (
                <Link 
                  key={index}
                  to={item.to} 
                  className="text-gray-400 hover:text-purple-400 text-sm cursor-pointer transition-colors duration-300"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Badge confiance */}
        <div className="text-center mt-8 pt-8 border-t border-gray-700">
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600/20 to-blue-600/20 backdrop-blur-sm rounded-full border border-green-500/30">
            <span className="mr-2 text-green-400">🔒</span>
            <span className="text-sm font-medium text-gray-300">
              Paiements sécurisés • Service client 24/7 • 10K+ clients satisfaits
            </span>
            <span className="ml-2 text-green-400">✅</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
