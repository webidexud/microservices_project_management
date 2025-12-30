// utils/sendTelegram.js
const axios = require('axios');

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

/**
 * Envía mensaje a Telegram
 * @param {String} message - Mensaje a enviar
 * @param {String} parseMode - Modo de parseo (Markdown, HTML) - opcional
 * @returns {Boolean} True si se envió correctamente
 */
const sendTelegram = async (message, parseMode = 'Markdown') => {
  try {
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: process.env.TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: parseMode,
    });
    console.log('✅ Mensaje enviado a Telegram');
    return true;
  } catch (error) {
    console.error('❌ Error enviando mensaje a Telegram:', error.response?.data || error.message);
    return false;
  }
};

module.exports = sendTelegram;