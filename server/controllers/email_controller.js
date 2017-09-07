const nodemailer = require('nodemailer');
const xoauth2 = require('xoauth2');
const authConfig = require('../config/mail_config');
const Newsletter = require('../models/newsletter');
const User = require('../models/user');
const transporter = nodemailer.createTransport({
    service: "Gmail",
    port: 465,
    secure: true,
    auth: authConfig,
    tls: { rejectUnauthorized: false }
});
const generateMailTpl = (email, password, link) => {
    return `
    <div class="email__wrapper" style="color: #333; max-width: 500px; width: 100%; margin: 0 auto; border: 1px solid #000; padding: 20px;">
      <img alt="chaplin_logo" style="text-align: center;display: block;margin: 15px auto 30px;"src="http://ayho.fr/uploads/mini_logo.png"/>
      <h2 style="color: #333;text-align: center; display: block; padding: 20px;">Bienvenue parmi nous !</h2>
      <p style="color: #333;">Le cinéma Charlie Chaplin à Montmélian est heureux de vous compter parmi ses membres.
      <br><br>Afin de vous inscrire à des permanences et d'échanger avec nous sur notre forum, vous aurez besoin des identifiants suivants :</p>
      <br>
      <div style="display:table; margin: 0 auto;">
      <p><span style="display:inline-block; width: 100px; font-weight:bold;">Email</span> : ${email}</p>
      <p><span style="display:inline-block; width: 100px; font-weight:bold;">Mot de passe</span> : ${password}</p>
      </div>
      <br>
      <p> Pour valider votre inscription, veuillez confirmer votre adresse email en cliquant sur ce lien : <a style="color: #333; font-weight: bold" href="${link}" target="_blank">${link}</a></p>
      <br>
      <p style="color: #333;" >A très bientôt,</p>
      <p style="color: #333;">L'équipe du cinéma Charlie Chaplin</p>
    </div>
    `
}
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
                    res.end("<h1 style='text-align: center; font-family: monospace, sans-serif; margin: 50px auto;'>Votre email : " + mailOptions.to + " est maintenant v&eacute;rifi&eacute;.");
                })
            } else {
                console.log("email is not verified");
                res.end("<h1>Erreur dans la v&eacute;rification de l'email</h1>");
            }
        } else {
            res.end("<h1  style='text-align: center; font-family: monospace, sans-serif; margin: 50px auto;'>La requ&ecirc;te proviens d'une source inconnue</h1>");
        }
    },
    sendEmail(req, res, next) {
        const { email, password } = req.body;
        rand = Math.floor((Math.random() * 100) + 54);
        host = req.get('host');
        link = `http://${req.get('host')}/api/sendmail/verify?id=${rand}`;
        mailOptions = {
            from: authConfig.user,
            to: email,
            subject: `Vos informations`,
            html: generateMailTpl(email, password, link)
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