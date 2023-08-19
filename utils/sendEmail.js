// eslint-disable-next-line import/no-extraneous-dependencies
const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // 1- create transporter {services that will send email like: ("gmail", "Mailgun", "mailtrap", "sendGrid")}
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT, //if secure false port: 587, if true port: 465
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  // 2- Define email options like (from or to who? , subject, email contnt)
  const mailOptions = {
    from: "موتون للكتب الالكترونية",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  // 3- send email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
