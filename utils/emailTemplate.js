// emailTemplate.js

module.exports = (firstName, url, subject) => `
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
      <p>Hi ${firstName},</p>
      <p>Welcome to our platform! Please confirm your email address by clicking the button below:</p>
      <a href="${url}" class="btn">Verify Email</a>
    </div>
    <div class="footer">
      <p>If you did not request this, please ignore this email.</p>
      <p>&copy; 2024 Our Platform. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
