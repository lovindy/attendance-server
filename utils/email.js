// Mail Libraries
const nodemailer = require('nodemailer');
const { htmlToText } = require('html-to-text');

// Email Service
class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.first_name || '';
    this.url = url;
    this.from = `HexCode+ Company <${process.env.EMAIL_FROM}>`;
  }

  // Create Transporter
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

    // Use local SMTP server in development
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT === '465', // true for port 465, false for other ports
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // Send Email with Message Template
  async send(template, subject) {
    // Create a more polished HTML email template
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          padding: 20px;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          background-color: #007BFF;
          padding: 20px;
          border-radius: 8px 8px 0 0;
          color: white;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .content {
          padding: 20px;
          line-height: 1.6;
        }
        .content p {
          margin: 0 0 15px;
        }
        .btn {
          display: inline-block;
          padding: 12px 24px;
          margin-top: 20px;
          color: #ffffff;
          background-color: #007BFF;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
        }
        .btn:hover {
          background-color: #0056b3;
        }
        .footer {
          margin-top: 20px;
          text-align: center;
          color: #888888;
          font-size: 12px;
        }
        .footer a {
          color: #007BFF;
          text-decoration: none;
        }
        .footer a:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${subject}</h1>
        </div>
        <div class="content">
          <p>Hi ${this.firstName},</p>
          <p>Welcome to our platform! Please confirm your email address by clicking the button below:</p>
          <a href="${this.url}" class="btn">Verify Email</a>
        </div>
        <div class="footer">
          <p>If you did not request this, please ignore this email.</p>
          <p>&copy; 2024 Our Platform. All rights reserved. | <a href="${this.unsubscribeUrl}">Unsubscribe</a></p>
        </div>
      </div>
    </body>
    </html>`;

    // Convert HTML to plain text for the text version of the email
    const text = htmlToText(html);

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text,
    };

    try {
      await this.newTransport().sendMail(mailOptions);
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Email sending failed');
    }
  }

  // Send Verification Email
  async sendVerification() {
    await this.send('emailVerification', 'Email Verification Link');
  }

  // Send Welcome Email to New User
  async sendWelcome() {
    await this.send('welcome', 'Welcome to Our Platform!');
  }

  // Send Password Reset Email
  async sendPasswordReset() {
    await this.send('passwordReset', 'Password Reset Token');
  }
}

module.exports = Email;
