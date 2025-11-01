import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { logger } from '@common/lib/logger.js';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: any[];
}

interface WelcomeEmailData {
  firstName: string;
  email: string;
  verificationLink?: string;
}

interface PasswordResetData {
  firstName: string;
  resetLink: string;
  expiresIn: string;
}

interface PackageNotificationData {
  firstName: string;
  trackingNumber: string;
  status: string;
  description: string;
  trackingLink: string;
}

interface QuoteCreatedData {
  firstName: string;
  quoteId: string;
  destination: string;
  amount: number;
  quoteLink: string;
}

type EmailProvider = 'smtp' | 'resend';

class EmailService {
  private transporter?: Transporter;
  private resend?: any;
  private provider: EmailProvider;
  private fromEmail: string;
  private fromName: string;

  constructor() {
    // Déterminer le provider d'email
    this.provider = (process.env.EMAIL_PROVIDER as EmailProvider) || 'smtp';
    this.fromEmail = process.env.EMAIL_FROM || process.env.SMTP_FROM_EMAIL || 'noreply@reexpresstrack.com';
    this.fromName = process.env.EMAIL_FROM_NAME || process.env.SMTP_FROM_NAME || 'ReExpressTrack';

    if (this.provider === 'resend') {
      // Configuration Resend (plus simple et moderne)
      this.initResend();
    } else {
      // Configuration SMTP traditionnelle
      this.initSMTP();
    }
  }

  /**
   * Initialiser Resend
   */
  private async initResend() {
    try {
      const { Resend } = await import('resend');
      const apiKey = process.env.RESEND_API_KEY;

      if (!apiKey) {
        logger.warn('⚠️ RESEND_API_KEY not configured. Email sending will fail.');
        return;
      }

      this.resend = new Resend(apiKey);
      logger.info('✅ Resend email service initialized');
    } catch (error) {
      logger.error('❌ Failed to initialize Resend:', error);
      logger.info('💡 Install resend with: npm install resend');
    }
  }

  /**
   * Initialiser SMTP
   */
  private initSMTP() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Vérifier la connexion SMTP au démarrage
    this.verifyConnection();
  }

  private async verifyConnection() {
    try {
      await this.transporter?.verify();
      logger.info('✅ SMTP connection verified successfully');
    } catch (error) {
      logger.error('❌ SMTP connection failed:', error);
    }
  }

  /**
   * Envoyer un email générique
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      if (this.provider === 'resend' && this.resend) {
        // Utiliser Resend
        const result = await this.resend.emails.send({
          from: `${this.fromName} <${this.fromEmail}>`,
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text || this.stripHtml(options.html),
        });

        logger.info(`Email sent successfully to ${options.to} via Resend: ${result.data?.id}`);
        return true;
      } else if (this.transporter) {
        // Utiliser SMTP
        const info = await this.transporter.sendMail({
          from: `"${this.fromName}" <${this.fromEmail}>`,
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text || this.stripHtml(options.html),
          attachments: options.attachments,
        });

        logger.info(`Email sent successfully to ${options.to} via SMTP: ${info.messageId}`);
        return true;
      } else {
        logger.error('No email provider configured');
        return false;
      }
    } catch (error) {
      logger.error(`Failed to send email to ${options.to}:`, error);
      return false;
    }
  }

  /**
   * Email de bienvenue après inscription
   */
  async sendWelcomeEmail(email: string, data: WelcomeEmailData): Promise<boolean> {
    const html = this.getWelcomeTemplate(data);

    return this.sendEmail({
      to: email,
      subject: '🎉 Bienvenue sur ReExpressTrack !',
      html,
    });
  }

  /**
   * Email de confirmation d'adresse email
   */
  async sendEmailVerification(email: string, verificationLink: string, firstName: string): Promise<boolean> {
    const html = this.getEmailVerificationTemplate({ firstName, verificationLink });

    return this.sendEmail({
      to: email,
      subject: '📧 Confirmez votre adresse email - ReExpressTrack',
      html,
    });
  }

  /**
   * Email de réinitialisation de mot de passe
   */
  async sendPasswordReset(email: string, data: PasswordResetData): Promise<boolean> {
    const html = this.getPasswordResetTemplate(data);

    return this.sendEmail({
      to: email,
      subject: '🔐 Réinitialisation de votre mot de passe',
      html,
    });
  }

  /**
   * Email de notification de colis reçu
   */
  async sendPackageReceivedEmail(email: string, data: PackageNotificationData): Promise<boolean> {
    const html = this.getPackageReceivedTemplate(data);

    return this.sendEmail({
      to: email,
      subject: '📦 Votre colis est arrivé à notre entrepôt !',
      html,
    });
  }

  /**
   * Email de notification de colis expédié
   */
  async sendPackageShippedEmail(email: string, data: PackageNotificationData): Promise<boolean> {
    const html = this.getPackageShippedTemplate(data);

    return this.sendEmail({
      to: email,
      subject: '🚚 Votre colis a été expédié !',
      html,
    });
  }

  /**
   * Email de notification de colis livré
   */
  async sendPackageDeliveredEmail(email: string, data: PackageNotificationData): Promise<boolean> {
    const html = this.getPackageDeliveredTemplate(data);

    return this.sendEmail({
      to: email,
      subject: '✅ Votre colis a été livré !',
      html,
    });
  }

  /**
   * Email de devis créé
   */
  async sendQuoteCreatedEmail(email: string, data: QuoteCreatedData): Promise<boolean> {
    const html = this.getQuoteCreatedTemplate(data);

    return this.sendEmail({
      to: email,
      subject: '💰 Votre devis est prêt !',
      html,
    });
  }

  /**
   * Email d'invitation
   */
  async sendInvitationEmail(email: string, inviterName: string, inviteLink: string): Promise<boolean> {
    const html = this.getInvitationTemplate({ inviterName, inviteLink });

    return this.sendEmail({
      to: email,
      subject: `🎁 ${inviterName} vous invite sur ReExpressTrack`,
      html,
    });
  }

  // ========================================
  // TEMPLATES HTML
  // ========================================

  private getBaseTemplate(content: string): string {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ReExpressTrack</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #fff7ed 0%, #fce7f3 50%, #f3e8ff 100%);
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: white;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #f97316 0%, #ec4899 50%, #a855f7 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      color: white;
      margin: 0;
    }
    .content {
      padding: 40px 30px;
    }
    .button {
      display: inline-block;
      padding: 16px 32px;
      background: linear-gradient(135deg, #f97316 0%, #ec4899 100%);
      color: white;
      text-decoration: none;
      border-radius: 12px;
      font-weight: bold;
      margin: 20px 0;
      transition: transform 0.2s;
    }
    .button:hover {
      transform: scale(1.05);
    }
    .footer {
      background: #f9fafb;
      padding: 30px;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
    }
    .social-links {
      margin: 20px 0;
    }
    .social-links a {
      margin: 0 10px;
      color: #f97316;
      text-decoration: none;
    }
    h1 {
      color: #1f2937;
      margin-top: 0;
    }
    p {
      color: #4b5563;
      line-height: 1.6;
    }
    .highlight-box {
      background: linear-gradient(135deg, #fff7ed 0%, #fce7f3 100%);
      border-left: 4px solid #f97316;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="logo">📦 ReExpressTrack</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p><strong>ReExpressTrack</strong></p>
      <p>Votre service de réexpédition vers les DOM-TOM et le Maroc</p>
      <div class="social-links">
        <a href="https://facebook.com/reexpresstrack">Facebook</a>
        <a href="https://twitter.com/reexpresstrack">Twitter</a>
        <a href="https://instagram.com/reexpresstrack">Instagram</a>
      </div>
      <p style="font-size: 12px; color: #9ca3af;">
        64 Route de Mouy, 60290 Cauffry, France<br>
        Email: <a href="mailto:contact@reexpresstrack.com" style="color: #f97316;">contact@reexpresstrack.com</a>
      </p>
      <p style="font-size: 12px; color: #9ca3af; margin-top: 20px;">
        Vous recevez cet email car vous avez un compte ReExpressTrack.<br>
        <a href="https://reexpresstrack.com/email-settings" style="color: #f97316;">Gérer mes préférences d'emails</a>
      </p>
    </div>
  </div>
</body>
</html>
    `;
  }

  private getWelcomeTemplate(data: WelcomeEmailData): string {
    const content = `
      <h1>🎉 Bienvenue ${data.firstName} !</h1>
      <p>Nous sommes ravis de vous accueillir sur <strong>ReExpressTrack</strong>, votre service de réexpédition de confiance vers les DOM-TOM et le Maroc.</p>

      <div class="highlight-box">
        <h3 style="margin-top: 0; color: #f97316;">✨ Votre compte est prêt !</h3>
        <p style="margin-bottom: 0;">Vous pouvez dès maintenant profiter de votre adresse française gratuite et commencer à recevoir vos colis.</p>
      </div>

      <h3>📋 Prochaines étapes :</h3>
      <p>
        <strong>1.</strong> Complétez votre profil<br>
        <strong>2.</strong> Récupérez votre adresse française personnalisée<br>
        <strong>3.</strong> Commencez vos achats sur vos sites préférés<br>
        <strong>4.</strong> Nous nous occupons de tout le reste !
      </p>

      <div style="text-align: center;">
        <a href="https://reexpresstrack.com/dashboard" class="button">
          Accéder à mon espace 🚀
        </a>
      </div>

      <p style="margin-top: 30px;">
        <strong>Besoin d'aide ?</strong> Notre équipe est à votre disposition pour répondre à toutes vos questions.
      </p>

      <p>À très bientôt,<br>
      <strong>L'équipe ReExpressTrack</strong></p>
    `;

    return this.getBaseTemplate(content);
  }

  private getEmailVerificationTemplate(data: { firstName: string; verificationLink: string }): string {
    const content = `
      <h1>📧 Confirmez votre adresse email</h1>
      <p>Bonjour ${data.firstName},</p>
      <p>Merci de vous être inscrit sur ReExpressTrack ! Pour finaliser votre inscription, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous.</p>

      <div style="text-align: center;">
        <a href="${data.verificationLink}" class="button">
          Confirmer mon email ✅
        </a>
      </div>

      <div class="highlight-box">
        <p style="margin: 0; font-size: 14px;">
          <strong>⚠️ Ce lien expire dans 24 heures.</strong><br>
          Si vous n'avez pas créé de compte, ignorez cet email.
        </p>
      </div>

      <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
        Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :<br>
        <a href="${data.verificationLink}" style="color: #f97316; word-break: break-all;">${data.verificationLink}</a>
      </p>
    `;

    return this.getBaseTemplate(content);
  }

  private getPasswordResetTemplate(data: PasswordResetData): string {
    const content = `
      <h1>🔐 Réinitialisation de mot de passe</h1>
      <p>Bonjour ${data.firstName},</p>
      <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe.</p>

      <div style="text-align: center;">
        <a href="${data.resetLink}" class="button">
          Réinitialiser mon mot de passe 🔑
        </a>
      </div>

      <div class="highlight-box">
        <p style="margin: 0; font-size: 14px;">
          <strong>⏰ Ce lien expire dans ${data.expiresIn}.</strong><br>
          Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
        </p>
      </div>

      <p style="margin-top: 30px;">
        <strong>⚠️ Pour votre sécurité :</strong><br>
        • Ne partagez jamais votre mot de passe<br>
        • Choisissez un mot de passe unique et complexe<br>
        • Activez l'authentification à deux facteurs si disponible
      </p>

      <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
        Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :<br>
        <a href="${data.resetLink}" style="color: #f97316; word-break: break-all;">${data.resetLink}</a>
      </p>
    `;

    return this.getBaseTemplate(content);
  }

  private getPackageReceivedTemplate(data: PackageNotificationData): string {
    const content = `
      <h1>📦 Votre colis est arrivé !</h1>
      <p>Bonjour ${data.firstName},</p>
      <p>Bonne nouvelle ! Nous avons reçu votre colis à notre entrepôt en France.</p>

      <div class="highlight-box">
        <p style="margin: 0;"><strong>Numéro de tracking :</strong> ${data.trackingNumber}</p>
        <p style="margin: 10px 0 0 0;"><strong>Description :</strong> ${data.description}</p>
      </div>

      <p>Votre colis est actuellement en cours de traitement. Vous pouvez suivre son statut en temps réel depuis votre espace client.</p>

      <div style="text-align: center;">
        <a href="${data.trackingLink}" class="button">
          Suivre mon colis 🔍
        </a>
      </div>

      <p style="margin-top: 30px;">
        <strong>Prochaines étapes :</strong><br>
        1. Votre colis sera préparé pour l'expédition<br>
        2. Vous recevrez une notification quand il sera expédié<br>
        3. Suivi en temps réel jusqu'à la livraison
      </p>
    `;

    return this.getBaseTemplate(content);
  }

  private getPackageShippedTemplate(data: PackageNotificationData): string {
    const content = `
      <h1>🚚 Votre colis est en route !</h1>
      <p>Bonjour ${data.firstName},</p>
      <p>Votre colis a été expédié et est actuellement en transit vers sa destination finale.</p>

      <div class="highlight-box">
        <p style="margin: 0;"><strong>Numéro de tracking :</strong> ${data.trackingNumber}</p>
        <p style="margin: 10px 0 0 0;"><strong>Statut :</strong> ${data.status}</p>
      </div>

      <div style="text-align: center;">
        <a href="${data.trackingLink}" class="button">
          Suivre mon colis en temps réel 📍
        </a>
      </div>

      <p style="margin-top: 30px;">
        Vous recevrez une notification dès que votre colis sera livré. 🎉
      </p>
    `;

    return this.getBaseTemplate(content);
  }

  private getPackageDeliveredTemplate(data: PackageNotificationData): string {
    const content = `
      <h1>✅ Colis livré avec succès !</h1>
      <p>Bonjour ${data.firstName},</p>
      <p>Excellente nouvelle ! Votre colis a été livré avec succès.</p>

      <div class="highlight-box">
        <p style="margin: 0;"><strong>Numéro de tracking :</strong> ${data.trackingNumber}</p>
        <p style="margin: 10px 0 0 0;"><strong>Description :</strong> ${data.description}</p>
      </div>

      <p style="margin-top: 30px;">
        <strong>Nous espérons que vous êtes satisfait de notre service ! 😊</strong>
      </p>

      <p>
        Si vous avez des questions ou des remarques, n'hésitez pas à nous contacter.
      </p>

      <div style="text-align: center;">
        <a href="https://reexpresstrack.com/support" class="button">
          Contacter le support 💬
        </a>
      </div>
    `;

    return this.getBaseTemplate(content);
  }

  private getQuoteCreatedTemplate(data: QuoteCreatedData): string {
    const content = `
      <h1>💰 Votre devis est prêt !</h1>
      <p>Bonjour ${data.firstName},</p>
      <p>Nous avons préparé un devis pour votre envoi vers <strong>${data.destination}</strong>.</p>

      <div class="highlight-box">
        <p style="margin: 0; font-size: 24px; color: #f97316;">
          <strong>${data.amount.toFixed(2)} €</strong>
        </p>
        <p style="margin: 10px 0 0 0; font-size: 14px; color: #6b7280;">
          Tarif estimé pour votre expédition
        </p>
      </div>

      <p>Ce tarif comprend :</p>
      <p>
        ✅ Réception à notre entrepôt<br>
        ✅ Traitement et préparation<br>
        ✅ Expédition sécurisée<br>
        ✅ Suivi en temps réel
      </p>

      <div style="text-align: center;">
        <a href="${data.quoteLink}" class="button">
          Voir mon devis complet 📋
        </a>
      </div>

      <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
        Ce devis est valable pendant 30 jours.
      </p>
    `;

    return this.getBaseTemplate(content);
  }

  private getInvitationTemplate(data: { inviterName: string; inviteLink: string }): string {
    const content = `
      <h1>🎁 Vous avez été invité !</h1>
      <p><strong>${data.inviterName}</strong> vous invite à rejoindre ReExpressTrack, le service de réexpédition vers les DOM-TOM et le Maroc.</p>

      <div class="highlight-box">
        <h3 style="margin-top: 0; color: #f97316;">✨ Avantages exclusifs :</h3>
        <p style="margin-bottom: 0;">
          🎁 Adresse française gratuite à vie<br>
          💰 Jusqu'à 60% d'économie sur vos envois<br>
          📦 Stockage gratuit pendant 30 jours<br>
          🚚 Suivi en temps réel 24/7
        </p>
      </div>

      <div style="text-align: center;">
        <a href="${data.inviteLink}" class="button">
          Créer mon compte gratuitement 🚀
        </a>
      </div>

      <p style="margin-top: 30px;">
        Rejoignez des milliers d'utilisateurs qui font confiance à ReExpressTrack pour leurs envois vers les DOM-TOM et le Maroc !
      </p>
    `;

    return this.getBaseTemplate(content);
  }

  /**
   * Retirer les balises HTML pour le texte brut
   */
  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }
}

export const emailService = new EmailService();
export default emailService;
