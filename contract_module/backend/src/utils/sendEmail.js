// utils/sendEmail.js
const nodemailer = require('nodemailer');

// Configurar transporter - CORREGIDO: createTransport en lugar de createTransporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Envía un correo electrónico
 * @param {Object} options - Opciones del email
 * @param {String} options.to - Destinatario
 * @param {String} options.subject - Asunto
 * @param {String} options.html - Contenido HTML
 * @param {String} options.text - Contenido texto plano (opcional)
 * @returns {Boolean} True si se envió correctamente
 */
const sendEmail = async (options) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text || options.subject, // Fallback a subject si no hay text
  };

  try {
    const transporter = createTransporter();
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email enviado a: ${options.to}`);
    return true;
  } catch (error) {
    console.error('❌ Error enviando email:', error);
    return false;
  }
};

module.exports = sendEmail;