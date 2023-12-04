const  nodemailer = require('nodemailer');
const pug =require('pug');
const htmlToText = require('html-to-text');

//new Email(user,url).sendWelcome();


module.exports= class Email{
    constructor(user,url){
        this.to=user.email;
        this.firstName=user.name.split(' ')[0];
        this.url=url;
        this.from=`Jonas Schmedtmann <${process.env.EMAIL_FROM}>`;

    }

    newTransport(){
        if(process.env.NODE_ENV === 'production'){
            //sendgrid
            return 1; 
        }

        return nodemailer.createTransport({
            host:process.env.EMAIL_HOST,
            port:process.env.EMAIL_PORT,
            auth:{
                user:process.env.EMAIL_USERNAME,
                pass:process.env.EMAIL_PASSWORD
            }

        });
    }

    //send the actual email
    async send(template,subject){
        //1) render HTML based on a pug template
        const html =pug.renderFile(
            `${__dirname}/../views/emails/${template}.pug`,
            {
                firstName:this.firstName,
                url:this.url,
                subject
            }
        );

        //2)define email options
        const mailOptions={
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText.fromString(html)
        };
 
        //3)create a transport and send email

        await this.newTransport().sendMail(mailOptions);
    }

    async sendWelcome(){
        await this.send('welcome','Welcome to the Natours family!');
    }

    async sendPasswordReset(){
        await this.send('passwordReset','Your password reset token (valid for only 10 minutes');
    };
}


// const sendEmail = async options =>{

//     //CREATE A TRANSPORTER
//     const transporter = nodemailer.createTransport({
//         host:process.env.EMAIL_HOST,
//         port:process.env.EMAIL_PORT,
//         auth:{
//             user:process.env.EMAIL_USERNAME,
//             pass:process.env.EMAIL_PASSWORD
//         }
//     });

//     //define the email options
//     const mailOptions = {

//         from :'Jonas Schmedtmann <hello@jonas.io>',
//         to: options.email,
//         subject: options.subject,
//         text: options.message
//     }

//     await transporter.sendMail(mailOptions);

// }

// module.exports = sendEmail;