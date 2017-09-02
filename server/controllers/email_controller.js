const nodemailer = require('nodemailer');
const xoauth2 = require('xoauth2');
const authConfig = require('../config/mail_config');
const Newsletter = require('../models/newsletter');
const transporter = nodemailer.createTransport({
    service: "Gmail",
    port: 465,
    secure: true,
    auth: authConfig
});

module.exports = {
    getEmails(req, res, next) {
        Newsletter.find({}).then(emails => res.json(emails))
    },
    addEmail(req, res, next) {
        console.log(req.body)
        Newsletter.create(req.body).then(() => {
            Newsletter.find({}).then(emails => res.json(emails))
        })
    },
    RemoveEmail(req, res, next) {
        Newsletter.findOneAndRemove({ _id: req.params.id }).then(() => {
            Newsletter.find({}).then(emails => res.json(emails))
        })
    },
    sendEmail(req, res, next) {
        const { to, mail, pass } = req.body;
        const mailOptions = {
            from: authConfig.user,
            to,
            subject: `Vos informations`,
            html: `<div class="email__wrapper">
              <h2>Bienvenue !</h2>
              <p>Voici vos ID's :</p>
              <p>Email: ${mail}</p>
              <p>Password: ${pass}</p>
              <p>A bientôt !</p>
            </div>`
        }
        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
                res.json({ success: 'successfully sent!' });
            }
        });
    }
}