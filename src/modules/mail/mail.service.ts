import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend: Resend;
  private readonly logger = new Logger(MailService.name);
  private readonly fromAddress: string;

  constructor(private config: ConfigService) {
    this.resend = new Resend(this.config.get<string>('RESEND_API_KEY'));
    this.fromAddress = this.config.get<string>('MAIL_FROM')!;
  }

  //====== email verification otp ==========
  async sendEmailVerificationOtp(to: string, otp: string): Promise<void> {
    const { error } = await this.resend.emails.send({
      from: this.fromAddress,
      to,
      subject: 'SpendWise | Verify your email address.',
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fdfaf5; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fdfaf5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 480px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #f1ece1;">
          
          <!-- Top Accent Bar -->
          <tr>
            <td height="6" style="background-color: #e6d5b8;"></td>
          </tr>

          <tr>
            <td style="padding: 40px 30px; text-align: center;">
              <h2 style="color: #4a3f35; font-size: 24px; margin: 0 0 16px 0; font-weight: 700;">Confirm your email</h2>
              <p style="color: #7a6e5d; font-size: 16px; line-height: 1.5; margin: 0 0 32px 0;">
                Thanks for joining us! Please use the verification code below to secure your account. 
              </p>

              <!-- OTP Box -->
              <div style="background-color: #faf7f0; border: 2px dashed #e6d5b8; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
                <span style="display: block; color: #a89a85; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; font-weight: bold;">Your Code</span>
                <div style="font-size: 42px; font-weight: 800; letter-spacing: 10px; color: #5d5347; font-family: 'Courier New', Courier, monospace;">
                  ${otp}
                </div>
              </div>

              <p style="color: #9e9382; font-size: 14px; margin: 0;">
                This code expires in <strong style="color: #d4a373;">3 minutes</strong>.
              </p>
            </td>
          </tr>

          <!-- Footer/Security Note -->
          <tr>
            <td style="padding: 0 30px 40px 30px; text-align: center;">
              <div style="height: 1px; background-color: #f1ece1; margin-bottom: 24px;"></div>
              <p style="color: #b5ada2; font-size: 12px; line-height: 1.4; margin: 0;">
                If you didn't request this email, no further action is required. You can safely ignore this message.
              </p>
            </td>
          </tr>
        </table>

        <!-- Branding Footer -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 480px; margin-top: 20px;">
          <tr>
            <td align="center" style="color: #c4bdad; font-size: 12px;">
              &copy; 2024 Your Brand Name. All rights reserved.
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`,
    });

    if (error) {
      this.logger.error('Failed to send verification OTP', error);
      throw new Error('Email sending failed');
    }
  }

  // ========= password reset OTP ========
  async sendPasswordResetOtp(to: string, otp: string): Promise<void> {
    const { error } = await this.resend.emails.send({
      from: this.fromAddress,
      to,
      subject: 'SpendWise | Password Reset OTP',
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8f5f0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8f5f0; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 480px; background-color: #ffffff; border-radius: 20px; box-shadow: 0 10px 25px rgba(139, 126, 116, 0.1); border: 1px solid #e8e2d6;">
          
          <!-- Header Icon/Section -->
          <tr>
            <td style="padding: 40px 30px 20px 30px; text-align: center;">
              <div style="background-color: #fdfaf5; width: 60px; height: 60px; line-height: 60px; border-radius: 50%; display: inline-block; margin-bottom: 20px; border: 1px solid #e6d5b8;">
                <span style="font-size: 28px;">🔑</span>
              </div>
              <h2 style="color: #3d3630; font-size: 22px; margin: 0; font-weight: 700; letter-spacing: -0.5px;">Password Reset Request</h2>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 40px 30px 40px; text-align: center;">
              <p style="color: #70665c; font-size: 15px; line-height: 1.6; margin: 0;">
                We received a request to reset your password. Use the verification code below to proceed.
              </p>
            </td>
          </tr>

          <!-- OTP Section -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <div style="background-color: #3d3630; border-radius: 12px; padding: 30px; text-align: center; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);">
                <span style="display: block; color: #b5ada2; font-size: 11px; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 12px; font-weight: 600;">Verification Code</span>
                <div style="font-size: 38px; font-weight: 700; letter-spacing: 12px; color: #fdfaf5; margin-left: 12px;">
                  ${otp}
                </div>
              </div>
            </td>
          </tr>

          <!-- Expiry Notice -->
          <tr>
            <td style="padding: 0 40px 40px 40px; text-align: center;">
              <p style="color: #9e9382; font-size: 13px; margin: 0;">
                This code is valid for <strong style="color: #8c7e74;">3 minutes</strong>.
              </p>
              
              <!-- Security Warning -->
              <div style="margin-top: 30px; padding: 15px; background-color: #fff9f0; border-radius: 8px; border: 1px solid #f2e8d5;">
                <p style="color: #a68b6a; font-size: 12px; line-height: 1.5; margin: 0;">
                  <strong>Didn't request this?</strong><br> 
                  If you didn't try to reset your password, please ignore this email or contact support if you have concerns.
                </p>
              </div>
            </td>
          </tr>
        </table>

        <!-- Simple Footer -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 480px; margin-top: 25px;">
          <tr>
            <td align="center" style="color: #b5ada2; font-size: 12px; letter-spacing: 0.5px;">
              Sent by <strong>Your Company Name</strong>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`,
    });

    if (error) {
      this.logger.error('Failed to send password reset OTP', error);
      throw new Error('Email sending failed');
    }
  }

  // ======= forgot password otp ============
  async sendForgotPasswordOtp(to: string, otp: string) {
    const { error } = await this.resend.emails.send({
      from: this.fromAddress,
      to,
      subject: 'SpendWise | Forgot password OTP',
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Forgot Password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fdfaf5; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fdfaf5; padding: 50px 20px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; background-color: #ffffff; border-radius: 24px; box-shadow: 0 20px 40px rgba(74, 63, 53, 0.05); border: 1px solid #f1ece1;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: left;">
              <div style="font-size: 24px; font-weight: 700; color: #4a3f35; margin-bottom: 8px;">
                Reset your password
              </div>
              <div style="height: 3px; width: 40px; background-color: #d4a373; border-radius: 2px;"></div>
            </td>
          </tr>

          <!-- Body Text -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <p style="color: #7a6e5d; font-size: 16px; line-height: 1.6; margin: 0;">
                It happens to the best of us. Use the code below to securely reset your password. This code will expire shortly.
              </p>
            </td>
          </tr>

          <!-- OTP Display -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fcfbf7; border: 1px solid #e6d5b8; border-radius: 16px;">
                <tr>
                  <td style="padding: 32px; text-align: center;">
                    <span style="display: block; color: #a89a85; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; font-weight: bold;">One-Time Password</span>
                    <div style="font-size: 40px; font-weight: 800; letter-spacing: 8px; color: #5d5347; font-family: 'Monaco', 'Courier New', monospace;">
                      ${otp}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Expiry & Help -->
          <tr>
            <td style="padding: 0 40px 40px 40px; text-align: center;">
              <p style="color: #b5ada2; font-size: 14px; margin-bottom: 24px;">
                Expires in <span style="color: #4a3f35; font-weight: 600;">3 minutes</span>
              </p>
              
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="background-color: #fdfaf5; padding: 20px; border-radius: 12px; text-align: left;">
                    <p style="color: #9e9382; font-size: 12px; line-height: 1.5; margin: 0;">
                      <strong>Security Tip:</strong> If you didn't request a password reset, please ignore this email or change your account settings if you feel your security is at risk.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; margin-top: 30px;">
          <tr>
            <td align="center">
              <p style="color: #c4bdad; font-size: 12px; margin: 0;">
                Powered by <strong>SpendWise</strong>
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`,
    });

    if (error) {
      this.logger.error('Failed to send forgot password OTP', error);
      throw new Error('Email sending failed');
    }
  }
}
