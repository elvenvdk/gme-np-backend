const axios = require('axios');

exports.sendMail = async ({ from, to, subject, text, html }) => {
  try {
    await axios.post(`${process.env.SEND_MAIL}/grems-mailer/send`, {
      from,
      to,
      subject,
      text,
      html,
    });
  } catch (error) {
    return error;
  }
};
