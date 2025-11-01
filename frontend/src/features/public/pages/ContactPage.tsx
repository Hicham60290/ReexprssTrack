import { useState, useEffect } from 'react'
import { Mail, Phone, MapPin, Send, Clock, Sparkles, CheckCircle } from 'lucide-react'
import { Input } from '@/shared/components/ui/Input'
import { Label } from '@/shared/components/ui/Label'
import api from '@/shared/lib/api'
import PublicHeader from '../components/PublicHeader'
import PublicFooter from '../components/PublicFooter'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    document.title = 'Contact - Nous contacter | ReExpressTrack'
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await api.post('/support/contact', formData)

      setSubmitted(true)
      setFormData({ name: '', email: '', subject: '', message: '' })

      setTimeout(() => setSubmitted(false), 5000)
    } catch (error: any) {
      console.error('Error sending contact message:', error)
      alert(error.response?.data?.message || 'Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      value: 'contact@reexpresstrack.com',
      link: 'mailto:contact@reexpresstrack.com',
      subtitle: 'Nous répondons sous 24h',
      gradient: 'from-orange-500 to-pink-500',
      emoji: '📧'
    },
    {
      icon: Phone,
      title: 'Téléphone',
      value: '+33 1 23 45 67 89',
      link: 'tel:+33123456789',
      subtitle: 'Lun-Ven : 9h-18h',
      gradient: 'from-purple-500 to-indigo-500',
      emoji: '📞'
    },
    {
      icon: MapPin,
      title: 'Adresse',
      value: '12 Rue de la Réexpédition\n75001 Paris, France',
      link: null,
      subtitle: 'Visitez notre entrepôt',
      gradient: 'from-blue-500 to-cyan-500',
      emoji: '📍'
    }
  ]

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <PublicHeader />

      {/* Animated Background with Bubbles */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50">
        {/* Large gradient orbs */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-orange-400/20 to-pink-500/20 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-purple-400/20 to-indigo-500/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-[500px] h-[500px] bg-gradient-to-br from-pink-400/20 to-orange-500/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>

        {/* 3D Animated Bubbles */}
        {[...Array(18)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-bubble-float"
            style={{
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
              background: `radial-gradient(circle at 30% 30%, ${
                ['rgba(255,200,150,0.2)', 'rgba(200,150,255,0.2)', 'rgba(150,200,255,0.2)', 'rgba(255,150,200,0.2)'][
                  Math.floor(Math.random() * 4)
                ]
              }, transparent)`,
              animationDuration: `${Math.random() * 15 + 20}s`,
              animationDelay: `${Math.random() * 5}s`,
              filter: 'blur(2px)'
            }}
          >
            <div className="w-full h-full rounded-full animate-bubble-3d"></div>
          </div>
        ))}
      </div>

      <div className="flex-1 pt-24 pb-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16 animate-float">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-pink-600 rounded-3xl mb-6 shadow-xl animate-float animation-delay-1000">
              <Mail className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                Contactez-nous
              </span>
            </h1>

            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Une question ? Notre équipe est là pour vous aider 24/7
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Info Cards */}
            <div className="lg:col-span-1 space-y-6">
              {contactInfo.map((info, index) => (
                <div
                  key={index}
                  className="animate-float"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="glass rounded-3xl p-6 border-2 border-white/40 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl relative overflow-hidden group">
                    {/* Gradient overlay on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${info.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}></div>

                    <div className="relative z-10">
                      {/* Icon */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`w-14 h-14 bg-gradient-to-br ${info.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                          <info.icon className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                            <span>{info.emoji}</span>
                            {info.title}
                          </h3>
                          <p className="text-sm text-gray-500">{info.subtitle}</p>
                        </div>
                      </div>

                      {/* Contact Value */}
                      {info.link ? (
                        <a
                          href={info.link}
                          className={`block font-semibold text-lg hover:underline bg-gradient-to-r ${info.gradient} bg-clip-text text-transparent mb-2`}
                        >
                          {info.value}
                        </a>
                      ) : (
                        <p className="text-gray-900 font-medium whitespace-pre-line">
                          {info.value}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Hours Card */}
              <div className="animate-float animation-delay-3000">
                <div className="glass rounded-3xl p-6 border-2 border-white/40 shadow-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10"></div>

                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                        <span>⏰</span>
                        Horaires
                      </h3>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Lundi - Vendredi</span>
                        <span className="font-semibold text-gray-900">9h - 18h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Samedi</span>
                        <span className="font-semibold text-gray-900">10h - 16h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dimanche</span>
                        <span className="font-semibold text-gray-900">Fermé</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2 animate-float animation-delay-1000">
              <div className="glass rounded-[3rem] p-8 md:p-10 border-2 border-white/40 shadow-2xl relative overflow-hidden">
                {/* Gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-pink-500/5 to-purple-500/5"></div>

                <div className="relative z-10">
                  <div className="mb-8">
                    <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-4 border-2 border-white/40">
                      <Sparkles className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-semibold text-gray-700">Formulaire de Contact</span>
                    </div>

                    <h2 className="text-3xl font-bold mb-2">
                      <span className="bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                        Envoyez-nous un message
                      </span>
                    </h2>
                    <p className="text-gray-600">
                      Remplissez le formulaire ci-dessous et nous vous répondrons rapidement
                    </p>
                  </div>

                  {submitted ? (
                    <div className="glass-dark border-2 border-green-500/30 rounded-3xl p-10 text-center animate-float">
                      <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-slow">
                        <CheckCircle className="w-10 h-10 text-white" />
                      </div>

                      <h3 className="text-2xl font-bold text-green-600 mb-3">
                        Message envoyé avec succès !
                      </h3>

                      <p className="text-gray-700 text-lg">
                        Merci pour votre message. Nous vous répondrons dans les plus brefs délais.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="name" className="text-gray-900 font-semibold mb-2 block">
                            Nom complet *
                          </Label>
                          <div className="glass rounded-2xl p-1 border-2 border-white/40">
                            <Input
                              id="name"
                              name="name"
                              type="text"
                              required
                              value={formData.name}
                              onChange={handleChange}
                              placeholder="Jean Dupont"
                              className="bg-white/50 border-none h-12 rounded-xl"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="email" className="text-gray-900 font-semibold mb-2 block">
                            Email *
                          </Label>
                          <div className="glass rounded-2xl p-1 border-2 border-white/40">
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              required
                              value={formData.email}
                              onChange={handleChange}
                              placeholder="jean.dupont@example.com"
                              className="bg-white/50 border-none h-12 rounded-xl"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="subject" className="text-gray-900 font-semibold mb-2 block">
                          Sujet *
                        </Label>
                        <div className="glass rounded-2xl p-1 border-2 border-white/40">
                          <Input
                            id="subject"
                            name="subject"
                            type="text"
                            required
                            value={formData.subject}
                            onChange={handleChange}
                            placeholder="Question sur..."
                            className="bg-white/50 border-none h-12 rounded-xl"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="message" className="text-gray-900 font-semibold mb-2 block">
                          Message *
                        </Label>
                        <div className="glass rounded-2xl p-1 border-2 border-white/40">
                          <textarea
                            id="message"
                            name="message"
                            required
                            value={formData.message}
                            onChange={handleChange}
                            rows={6}
                            className="w-full px-4 py-3 bg-white/50 border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none"
                            placeholder="Votre message..."
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="group relative w-full"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-pink-600 rounded-2xl blur-lg group-hover:blur-xl transition-all opacity-70"></div>
                        <div className="relative bg-gradient-to-r from-orange-500 to-pink-600 text-white px-8 py-5 rounded-2xl font-bold text-lg hover:scale-105 transition-transform shadow-xl flex items-center justify-center gap-3">
                          {isSubmitting ? (
                            <>
                              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                              Envoi en cours...
                            </>
                          ) : (
                            <>
                              <Send className="w-6 h-6" />
                              Envoyer le message
                            </>
                          )}
                        </div>
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  )
}
