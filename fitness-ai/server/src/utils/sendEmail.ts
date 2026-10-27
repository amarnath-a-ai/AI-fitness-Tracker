import nodemailer from 'nodemailer';
import { config } from '../config/env';
import { logger } from './logger';

interface SendEmailOptions {
  email: string;
  subject: string;
  message: string;
  html?: string;
}

export const sendEmail = async (options: SendEmailOptions): Promise<void> => {
  let transporter;

  // Check if SMTP is configured
  if (!config.smtp.host || !config.smtp.user) {
    logger.warn('SMTP credentials not provided in .env. Falling back to Ethereal Email (Test Account)...');
    
    // Generate test SMTP service account from ethereal.email
    const testAccount = await nodemailer.createTestAccount();
    
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } else {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465, // true for 465, false for other ports
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    });
  }

  const message = {
    from: `Athrix <${config.smtp.fromEmail}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(message);
    logger.info(`Email sent: ${info.messageId}`);
    
    if (!config.smtp.user) {
      logger.info(`✨ Ethereal Email Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
  } catch (error) {
    logger.error('Error sending email: ', error);
    throw new Error('Email could not be sent');
  }
};
