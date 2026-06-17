export const otpEmailTemplate = (code, email) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your OTP Code</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          background-color: #f9f9f9;
          margin: 0;
          padding: 0;
        }
        .wrapper {
          width: 100%;
          table-layout: fixed;
          background-color: #f9f9f9;
          padding-bottom: 40px;
        }
        .main {
          background-color: #ffffff;
          margin: 0 auto;
          width: 100%;
          max-width: 600px;
          border-spacing: 0;
          font-family: sans-serif;
          color: #333333;
        }
        .header {
          background-color: #FF7C7C;
          padding: 20px;
          text-align: center;
        }
        .header h1 {
          color: #ffffff;
          margin: 0;
          font-size: 24px;
          font-weight: bold;
          letter-spacing: 1px;
        }
        .content {
          padding: 40px 30px;
          background-color: #ffffff;
          text-align: center;
        }
        .icon-container {
          text-align: center;
          margin-bottom: 25px;
        }
        .greeting {
          font-size: 16px;
          margin-bottom: 15px;
        }
        .message {
          font-size: 16px;
          margin-bottom: 25px;
        }
        .otp-code {
          font-size: 36px;
          font-weight: bold;
          margin: 0 0 25px 0;
          color: #111111;
          letter-spacing: 4px;
        }
        .ignore-text {
          font-size: 14px;
          color: #555555;
          margin-bottom: 30px;
        }
        .signature {
          font-size: 16px;
          margin-bottom: 5px;
        }
        .team {
          font-size: 16px;
        }
        .footer {
          text-align: center;
          padding: 30px 20px;
          background-color: #ffffff;
        }
        .footer-logo {
          font-size: 18px;
          color: #FF7C7C;
          margin-bottom: 10px;
          font-weight: normal;
        }
        .copyright {
          font-size: 12px;
          color: #999999;
          margin: 0;
        }
      </style>
    </head>
    <body>
      <center class="wrapper">
        <table class="main" width="100%">
          <tr>
            <td class="header">
              <h1>RokKru</h1>
            </td>
          </tr>
          <tr>
            <td class="content">
              <div class="icon-container">
                <img src="https://img.icons8.com/ios-filled/100/FF7C7C/lock.png" alt="Lock Icon" width="60" height="60" style="display: block; margin: 0 auto; opacity: 0.8;" />
              </div>
              <p class="greeting">Hi, ${email}</p>
              <p class="message">Here's the confirmation code you requested:</p>
              <h2 class="otp-code">${code}</h2>
              <p class="ignore-text">If you didn't request this, you can ignore this email or let us know.</p>
              <p class="signature">Thanks,</p>
              <p class="team">The RokKru Team</p>
            </td>
          </tr>
          <tr>
            <td class="footer">
              <div class="footer-logo">RokKru</div>
              <p class="copyright">&copy; 2026 RokKru. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </center>
    </body>
    </html>
  `;
};
