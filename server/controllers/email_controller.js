const nodemailer = require('nodemailer');
const xoauth2 = require('xoauth2');
const authConfig = require('../config/mail_config');
const Newsletter = require('../models/newsletter');
const User = require('../models/user');
const transporter = nodemailer.createTransport({
    service: "Gmail",
    port: 465,
    secure: true,
    auth: authConfig
});
let rand, host, link, mailOptions;

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
    verifyEmail(req, res, next) {
        console.log(req.protocol + ":/" + req.get('host'));
        console.log("http://" + host)
        if ((req.protocol + "://" + req.get('host')) == ("http://" + host)) {
            console.log("Domain is matched. Information is from Authentic email");
            if (req.query.id == rand) {
                console.log("email is verified");
                User.update({ email: mailOptions.to }, { verified: true }).then(() => {
                    res.end("<h1 style='text-align: center; font-family: monospace, sans-serif; margin: 50px auto;'>Votre email : " + mailOptions.to + " est maintenant vérifié.");
                })
            } else {
                console.log("email is not verified");
                res.end("<h1>Erreur dans la vérification de l'email</h1>");
            }
        } else {
            res.end("<h1>La requête proviens d'une source inconnue</h1>");
        }
    },
    sendEmail(req, res, next) {
        const { email, password } = req.body;
        rand = Math.floor((Math.random() * 100) + 54);
        host = req.get('host');
        console.log(host);
        link = "http://" + req.get('host') + "/api/sendmail/verify?id=" + rand;

        mailOptions = {
            from: authConfig.user,
            to: email,
            subject: `Vos informations`,
            html: `<div class="email__wrapper">
              <h2 style="text-align: center">Bienvenue !</h2>
              <br>
              <p style="text-align: center">Voici vos identifiants :</p>
              <p style="text-align: center">Email : ${email}</p>
              <p style="text-align: center">Mot de passe : ${password}</p>
              <p style="text-align: center">Avant de vous connecter veuillez confirmer votre adresse email via ce lien : ${link}</p>
              <p style="text-align: center">A bientôt !</p>
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