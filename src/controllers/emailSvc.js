const axios = require('axios');

exports.sendMail = async ({ from, to, subject, text, html }) => {
  console.log({ from, to, subject, text, html });
  try {
    const res = await axios.post(`${process.env.SEND_MAIL}/grems-mailer/send`, {
      from,
      to,
      subject,
      text,
      html,
    });
    console.log(res.data);
  } catch (error) {
    return error;
  }
};
