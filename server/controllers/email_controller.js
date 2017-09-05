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
                    res.end("<h1>Email " + mailOptions.to + " is been Successfully verified");
                })
            } else {
                console.log("email is not verified");
                res.end("<h1>Bad Request</h1>");
            }
        } else {
            res.end("<h1>Request is from unknown source");
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
              <h2>Bienvenue !</h2>
              <p>Voici vos ID's :</p>
              <p>Email: ${email}</p>
              <p>Password: ${password}</p>
              <p>Avant de vous connecter veuillez confirmer votre adresse email via ce lien : ${link}</p>
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