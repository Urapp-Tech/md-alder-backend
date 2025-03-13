/* eslint-disable camelcase */

import { createTransport } from 'nodemailer';
import sendGridTransport from 'nodemailer-sendgrid-transport';
import {
  generateNewPhraseEmail,
  generateOTPEmail,
} from '#utilities/generate-email';

function getTransporter(req) {
  return createTransport(
    sendGridTransport({
      auth: {
        api_key: req.config.SENDGRID_API_KEY,
      },
    })
  );
}

export async function sendSignUpMail(req, obj, otp) {
  const transporter = getTransporter(req);

  const data = {
    logo: obj.logo,
    heading: 'Confirm your OTP verification',
    message: `your confirmation code is below - enter it in and we'll help you get registered.`,
    code: otp,
    expirationMessage: 'this code will expire in 1 hour.',
  };
  return transporter.sendMail({
    to: obj.email,
    from: req.config.SENDGRID_MAIL_FROM,
    subject: 'Your OTP Verification Code',
    html: generateOTPEmail(data),
  });
}

export async function sendPasswordRecoveryMailForDriver(req, email, otp) {
  const transporter = getTransporter(req);

  const data = {
    heading: 'Reset your password',
    message: `your confirmation code is below - enter it in and we'll help you reset your password.`,
    code: otp,
    expirationMessage: 'this code will expire in 1 hour.',
  };
  return transporter.sendMail({
    to: email,
    from: req.config.SENDGRID_MAIL_FROM,
    subject: 'Your Password Recovery OTP',
    html: generateOTPEmail(data),
  });
}

export async function sendToMailNewPhrase(req, subject, email, obj) {
  const transporter = getTransporter(req);

  return transporter.sendMail({
    to: email,
    from: req.config.SENDGRID_MAIL_FROM,
    subject,
    html: generateNewPhraseEmail(obj),
  });
}
