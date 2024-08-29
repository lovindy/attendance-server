const nodemailer = require('nodemailer');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Your Name <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Use SendGrid in production
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }

    // Use a different mail service in development
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // Create the email content as an HTML string
  generateHTML(template, subject) {
    let html;
    if (template === 'welcome') {
      html = `<h1>Welcome, ${this.firstName}!</h1>
              <p>We're excited to have you at our platform. Please confirm your email address by clicking the link below:</p>
              <a href="${this.url}">Confirm your email</a>`;
    } else if (template === 'passwordReset') {
      html = `<h1>Password Reset</h1>
              <p>Hi ${this.firstName},</p>
              <p>You requested a password reset. Please click the link below to reset your password:</p>
              <a href="${this.url}">Reset your password</a>`;
    }

    return html;
  }

  // Send the actual email
  async send(template, subject) {
    // 1) Generate the HTML content
    const html = this.generateHTML(template, subject);

    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.convert(html),
    };

    // 3) Create a transport and send the email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to Our Platform!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)'
    );
  }
};
