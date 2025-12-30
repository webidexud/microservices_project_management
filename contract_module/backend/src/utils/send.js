// utils/send.js
const sendEmail = require('./sendEmail');
const sendTelegram = require('./sendTelegram');
const statusConfig= require('./statusMessages');

/**
 * Envía email y Telegram (ambos)
 * @param {Object} emailOptions - Opciones para el email
 * @param {String} telegramMessage - Mensaje para Telegram
 * @returns {Object} Resultados de los envíos
 */
const sendBoth = async (emailOptions, telegramMessage) => {
  const results = {
    email: false,
    telegram: false
  };

  try {
    // Enviar email
    if (emailOptions) {
      results.email = await sendEmail(emailOptions);
    }

    // Enviar Telegram
    if (telegramMessage) {
      results.telegram = await sendTelegram(telegramMessage);
    }

    return results;

  } catch (error) {
    console.error('Error en sendBoth:', error);
    throw error;
  }
};


const decisionSend = async(data) => {

  switch (data.rows[0].status){
      case statusConfig.incompleto.label:
        console.log("Correo enviado con el estado incompleto");
        await sendEmail({
          to:'juan1juan.jdar@gmail.com',
          subject:"[Contrac module] Correos de prueba",
          html:`<h1>Correos de prueba</h1><p>Esto es un correo de prueba incompleto</p>`
        });
        break;
      case statusConfig.firmando_abogado.label:
        console.log("Correo enviado con el estado firmando_abogado");
        await sendEmail({
          to:'juan1juan.jdar@gmail.com',
          subject:"[Contrac module] Correos de prueba",
          html:`<h1>Correos de prueba</h1><p>Esto es un correo de prueba firmando_abogado</p>`
        });
        break;
      case statusConfig.firmando_cliente.label:
        console.log("Correo enviado con el estado firmando_cliente");
        await sendEmail({
          to:'juan1juan.jdar@gmail.com',
          subject:"[Contrac module] Correos de prueba",
          html:`<h1>Correos de prueba</h1><p>Esto es un correo de prueba firmando_cliente</p>`
        });
        break;
      case statusConfig.firmando_director.label:
        console.log("Correo enviado con el estado firmando_director");
        await sendEmail({
          to:'juan1juan.jdar@gmail.com',
          subject:"[Contrac module] Correos de prueba",
          html:`<h1>Correos de prueba</h1><p>Esto es un correo de prueba firmando_director</p>`
        });
        break;
      case statusConfig.activa.label:
        console.log("Correo enviado con el estado activa");
        await sendEmail({
          to:'juan1juan.jdar@gmail.com',
          subject:"[Contrac module] Correos de prueba",
          html:`<h1>Correos de prueba</h1><p>Esto es un correo de prueba activa</p>`
        });
        break;
      case statusConfig.suspendida.label:
        console.log("Correo enviado con el estado suspendida");
        await sendEmail({
          to:'juan1juan.jdar@gmail.com',
          subject:"[Contrac module] Correos de prueba",
          html:`<h1>Correos de prueba</h1><p>Esto es un correo de prueba suspendida</p>`
        });
        break;
      case statusConfig.cancelada.label:
        console.log("Correo enviado con el estado cancelada");
        await sendEmail({
          to:'juan1juan.jdar@gmail.com',
          subject:"[Contrac module] Correos de prueba",
          html:`<h1>Correos de prueba</h1><p>Esto es un correo de prueba cancelada</p>`
        });
        break;

      default:
        console.warn(`⚠️ Estado no reconocido: ${data.rows[0].status}`);
        break;
    }

}


// Exportar todas las funciones
module.exports = {
  sendEmail,
  sendTelegram,
  sendBoth,
  decisionSend
};