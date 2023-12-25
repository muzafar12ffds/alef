const axios = require('axios');

module.exports  = async (chatId, botToken, text, parse_mode="") => {
   // const botToken = process.env.TELEGRAM_API_TOKEN;
    try {
        await axios.post('https://api.telegram.org/bot' + botToken + '/sendMessage', {
          chat_id: chatId,
          text,
          parse_mode
        })
        console.log('Сообщение отправлено');
        return true;
      } catch (e) {
        console.log(e);
        return false;
      }

}


