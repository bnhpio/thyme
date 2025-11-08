'use node';
import { render } from '@react-email/render';
import { v } from 'convex/values';
import nodemailer from 'nodemailer';
import { action } from '../_generated/server';
import InvitationEmail from '../email/templates/InvitationEmail';
import SupportEmail from '../email/templates/SupportEmail';
import WelcomeEmail from '../email/templates/WelcomeEmail';

// Email configuration - you'll need to set these environment variables
const SMTP_SERVER = process.env.SMTP_SERVER || 'smtp-relay.brevo.com';
const SMTP_PORT = process.env.SMTP_PORT || '587';
const BREVO_EMAIL = process.env.BREVO_EMAIL;
const BREVO_SMTP_KEY = process.env.BREVO_SMTP_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@yourdomain.com';
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'support@yourdomain.com';

// Create transporter instance
const createTransporter = () => {
  if (!BREVO_EMAIL || !BREVO_SMTP_KEY) {
    throw new Error(
      'Email configuration missing: BREVO_EMAIL and BREVO_SMTP_KEY are required',
    );
  }

  return nodemailer.createTransport({
    host: SMTP_SERVER,
    port: Number(SMTP_PORT),
    auth: {
      user: BREVO_EMAIL,
      pass: BREVO_SMTP_KEY,
    },
    debug: process.env.NODE_ENV === 'development',
  });
};

// Generic email sending function
export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
}) {
  try {
    console.log('Sending email to', to);
    const transporter = createTransporter();

    const result = await transporter.sendMail({
      from: EMAIL_FROM,
      to: Array.isArray(to) ? to.join(',') : to,
      subject,
      text,
      html,
    });

    console.log('Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

// Welcome email after joining
async function sendWelcomeEmail({
  to,
  organizationName,
  userName,
  role,
}: {
  to: string;
  organizationName: string;
  userName: string;
  role: string;
}) {
  const htmlContent = await render(
    WelcomeEmail({
      organizationName,
      userName,
      role,
    }),
  );

  return sendEmail({
    to,
    subject: `Welcome to ${organizationName}!`,
    html: htmlContent,
  });
}

// Support email function
async function sendSupportEmail({
  firstName,
  lastName,
  email,
  phone,
  message,
}: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
}) {
  const htmlContent = await render(
    SupportEmail({
      firstName,
      lastName,
      email,
      phone,
      message,
    }),
  );

  return sendEmail({
    to: SUPPORT_EMAIL,
    subject: `New Support Request from ${firstName} ${lastName}`,
    html: htmlContent,
  });
}

// Send welcome email after joining
export const sendWelcomeEmailAction = action({
  args: {
    to: v.string(),
    organizationName: v.string(),
    userName: v.string(),
    role: v.string(),
  },
  handler: async (_ctx, args) => {
    try {
      await sendWelcomeEmail({
        to: args.to,
        organizationName: args.organizationName,
        userName: args.userName,
        role: args.role,
      });

      console.log(
        `Welcome email sent to ${args.to} for ${args.organizationName}`,
      );
      return { success: true };
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      throw new Error('Failed to send welcome email');
    }
  },
});

// Send support email
export const sendSupportEmailAction = action({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.string(),
    message: v.string(),
  },
  handler: async (_ctx, args) => {
    try {
      await sendSupportEmail({
        firstName: args.firstName,
        lastName: args.lastName,
        email: args.email,
        phone: args.phone,
        message: args.message,
      });

      console.log(
        `Support email sent from ${args.firstName} ${args.lastName} (${args.email})`,
      );
      return { success: true };
    } catch (error) {
      console.error('Failed to send support email:', error);
      throw new Error('Failed to send support email');
    }
  },
});

// Send invitation email
async function sendInvitationEmailHelper({
  to,
  organizationName,
  inviterName,
  inviteUrl,
  role,
}: {
  to: string;
  organizationName: string;
  inviterName: string;
  inviteUrl: string;
  role: string;
}) {
  const htmlContent = await render(
    InvitationEmail({
      organizationName,
      inviterName,
      inviteUrl,
      role,
    }),
  );

  return sendEmail({
    to,
    subject: `You're invited to join ${organizationName}`,
    html: htmlContent,
  });
}

export const sendInvitationEmail = action({
  args: {
    to: v.string(),
    organizationName: v.string(),
    inviterName: v.string(),
    inviteUrl: v.string(),
    role: v.string(),
  },
  handler: async (_ctx, args) => {
    try {
      await sendInvitationEmailHelper({
        to: args.to,
        organizationName: args.organizationName,
        inviterName: args.inviterName,
        inviteUrl: args.inviteUrl,
        role: args.role,
      });

      console.log(
        `Invitation email sent to ${args.to} for ${args.organizationName}`,
      );
      return { success: true };
    } catch (error) {
      console.error('Failed to send invitation email:', error);
      throw new Error('Failed to send invitation email');
    }
  },
});
