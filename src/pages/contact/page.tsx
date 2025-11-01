import React, { useState, useEffect } from 'react';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import Button from '../../components/base/Button';
import Card from '../../components/base/Card';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: '',
    urgent: false
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    { value: 'general', label: 'Question générale' },
    { value: 'shipping', label: 'Problème d\'expédition' },
    { value: 'billing', label: 'Facturation' },
    { value: 'technical', label: 'Problème technique' },
    { value: 'partnership', label: 'Partenariat' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Préparer les données du formulaire
      const formSubmitData = new FormData();
      formSubmitData.append('name', formData.name);
      formSubmitData.append('email', formData.email);
      formSubmitData.append('subject', formData.subject);
      formSubmitData.append('category', formData.category);
      formSubmitData.append('message', formData.message);
      formSubmitData.append('urgent', formData.urgent ? 'Oui' : 'Non');

      // Utiliser l'URL du formulaire Readdy
      const response = await fetch('https://readdy.ai/api/form/d2rli27frndo9ftj14ng', {
        method: 'POST',
        body: formSubmitData,
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({
          name: '',
          email: '',
          subject: '',
          category: '',
          message: '',
          urgent: false
        });
      } else {
        throw new Error('Erreur lors de l\'envoi');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'envoi du message. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <section className="py-24">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Card>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-check-line text-2xl text-green-600"></i>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Message envoyé !
              </h1>
              <p className="text-gray-600 mb-6">
                Merci pour votre message. Notre équipe vous répondra sous 24h maximum.
              </p>
              <Button onClick={() => setSubmitted(false)}>
                Envoyer un autre message
              </Button>
            </Card>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Nous contacter
          </h1>
          <p className="text-xl text-blue-100">
            Notre équipe est là pour vous aider 7j/7
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Informations de contact */}
            <div className="space-y-6">
              <Card>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <i className="ri-customer-service-line text-blue-600 text-xl"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Support client</h3>
                    <p className="text-gray-600 text-sm">Réponse sous 2h en moyenne</p>
                  </div>
                </div>
                <p className="text-gray-600">
                  Notre équipe support est disponible pour répondre à toutes vos questions.
                </p>
              </Card>

              <Card>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <i className="ri-mail-line text-green-600 text-xl"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Email</h3>
                    <p className="text-gray-600 text-sm">contact@reexpresstrack.com</p>
                  </div>
                </div>
                <p className="text-gray-600">
                  Écrivez-nous directement pour toute question spécifique.
                </p>
              </Card>

              <Card>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                    <i className="ri-time-line text-purple-600 text-xl"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Horaires</h3>
                    <p className="text-gray-600 text-sm">Lun-Ven 9h-18h, Sam 10h-16h</p>
                  </div>
                </div>
                <p className="text-gray-600">
                  Notre équipe est disponible 6 jours sur 7 pour vous accompagner.
                </p>
              </Card>

              <Card>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                    <i className="ri-phone-line text-orange-600 text-xl"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Téléphone</h3>
                    <p className="text-gray-600 text-sm">0207 608 5500</p>
                  </div>
                </div>
                <p className="text-gray-600">
                  Appelez-nous pour une assistance immédiate.
                </p>
              </Card>
            </div>

            {/* Formulaire de contact */}
            <div className="lg:col-span-2">
              <Card>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Envoyez-nous un message
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6" id="contact-form" data-readdy-form>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom complet *
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        maxLength={100}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Catégorie *
                    </label>
                    <select 
                      name="category"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm pr-8"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      <option value="">Sélectionnez une catégorie</option>
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sujet *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      required
                      maxLength={200}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="Résumez votre demande en quelques mots"
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      required
                      maxLength={500}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                      placeholder="Décrivez votre demande en détail..."
                      value={formData.message}
                      onChange={(e) => {
                        if (e.target.value.length <= 500) {
                          setFormData({...formData, message: e.target.value});
                        }
                      }}
                    />
                    <p className="text-gray-500 text-xs mt-1">
                      {formData.message.length}/500 caractères
                    </p>
                  </div>

                  <div>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="urgent"
                        className="mr-3"
                        checked={formData.urgent}
                        onChange={(e) => setFormData({...formData, urgent: e.target.checked})}
                      />
                      <span className="text-sm text-gray-700">
                        Demande urgente (réponse prioritaire)
                      </span>
                    </label>
                  </div>

                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? 'Envoi en cours...' : 'Envoyer le message'}
                  </Button>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
