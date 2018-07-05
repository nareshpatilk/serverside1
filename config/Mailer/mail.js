const crediantials = require('./mailerConst');
var  nodemailer  =  require('nodemailer');

var  transporter  =  nodemailer.createTransport({

        service:  `${crediantials.Service}`,
        auth: {
        user:  `${crediantials.EMAILID}`,
        pass:   `${crediantials.EMAILPWD}`
        }
});
var  mailOptions  =  {
        from:  `${crediantials.EMAILID}`,
        to:  '',
        subject:  'Welcome To MIB FAN CLUB',
        html:  ''
};

module.exports  = {
        transporter : transporter,
        mailOptions : mailOptions
}  