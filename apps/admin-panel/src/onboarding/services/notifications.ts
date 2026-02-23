/**
 * Notification Service
 * Handles email, SMS, and push notifications
 */

import { Notification, NotificationType } from '../types';

// ============================================================================
// Configuration
// ============================================================================

interface NotificationConfig {
  emailProvider: 'sendgrid' | 'aws-ses' | 'mailgun';
  smsProvider: 'twilio' | 'aws-sns';
  pushProvider: 'firebase' | 'onesignal';
  apiKeys: {
    email?: string;
    sms?: string;
    push?: string;
  };
}

// ============================================================================
// Main Service
// ============================================================================

export class NotificationService {
  private config: NotificationConfig;

  constructor(config: NotificationConfig) {
    this.config = config;
  }

  /**
   * Send a notification based on type
   */
  async send(
    type: NotificationType,
    recipientType: 'driver' | 'restaurant' | 'admin',
    recipientId: string,
    data: Record<string, any>,
    channels: ('email' | 'sms' | 'push' | 'in_app')[] = ['email', 'in_app']
  ): Promise<Notification[]> {
    const notifications: Notification[] = [];

    const content = this.getNotificationContent(type, data);

    for (const channel of channels) {
      try {
        const notification = await this.sendViaChannel(
          channel,
          recipientType,
          recipientId,
          content,
          data
        );
        notifications.push(notification);
      } catch (error) {
        console.error(`Failed to send ${channel} notification:`, error);
      }
    }

    return notifications;
  }

  /**
   * Send via specific channel
   */
  private async sendViaChannel(
    channel: 'email' | 'sms' | 'push' | 'in_app',
    recipientType: 'driver' | 'restaurant' | 'admin',
    recipientId: string,
    content: { title: string; message: string },
    data: Record<string, any>
  ): Promise<Notification> {
    switch (channel) {
      case 'email':
        await this.sendEmail(recipientType, recipientId, content, data);
        break;
      case 'sms':
        await this.sendSMS(recipientType, recipientId, content.message);
        break;
      case 'push':
        await this.sendPush(recipientType, recipientId, content, data);
        break;
      case 'in_app':
        // Store in database for in-app display
        break;
    }

    return {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type: data.type as NotificationType,
      recipientType,
      recipientId,
      title: content.title,
      message: content.message,
      data,
      sentAt: new Date(),
      channel,
    };
  }

  /**
   * Send email notification
   */
  private async sendEmail(
    recipientType: 'driver' | 'restaurant' | 'admin',
    recipientId: string,
    content: { title: string; message: string },
    data: Record<string, any>
  ): Promise<void> {
    // In production, integrate with SendGrid, AWS SES, or Mailgun
    const emailData = {
      to: await this.getEmailAddress(recipientType, recipientId),
      subject: content.title,
      html: this.generateEmailTemplate(content.title, content.message, data),
    };

    console.log('[Email]', emailData);
  }

  /**
   * Send SMS notification
   */
  private async sendSMS(
    recipientType: 'driver' | 'restaurant' | 'admin',
    recipientId: string,
    message: string
  ): Promise<void> {
    // In production, integrate with Twilio or AWS SNS
    const smsData = {
      to: await this.getPhoneNumber(recipientType, recipientId),
      body: message.slice(0, 160), // SMS character limit
    };

    console.log('[SMS]', smsData);
  }

  /**
   * Send push notification
   */
  private async sendPush(
    recipientType: 'driver' | 'restaurant' | 'admin',
    recipientId: string,
    content: { title: string; message: string },
    data: Record<string, any>
  ): Promise<void> {
    // In production, integrate with Firebase Cloud Messaging or OneSignal
    const pushData = {
      to: await getPushToken(recipientType, recipientId),
      notification: {
        title: content.title,
        body: content.message,
      },
      data,
    };

    console.log('[Push]', pushData);
  }

  /**
   * Get notification content based on type
   */
  private getNotificationContent(
    type: NotificationType,
    data: Record<string, any>
  ): { title: string; message: string } {
    const templates: Record<NotificationType, { title: string; message: string }> = {
      application_received: {
        title: 'Application Received',
        message: `Hi ${data.applicantName || 'there'}, we've received your application and are reviewing your documents.`,
      },
      document_rejected: {
        title: 'Document Update Required',
        message: `Your ${data.documentType} was not accepted. Reason: ${data.reason}. Please upload a clearer image.`,
      },
      background_check_initiated: {
        title: 'Background Check Started',
        message: 'Your background check has been initiated. This typically takes 3-5 business days.',
      },
      background_check_complete: {
        title: 'Background Check Complete',
        message: 'Your background check has been completed. Check your app for the results.',
      },
      approved: {
        title: data.autoApproved ? 'You\'re Approved! 🎉' : 'Application Approved! 🎉',
        message: data.autoApproved
          ? 'Great news! Your application has been automatically approved. You can start delivering now!'
          : 'Congratulations! Your application has been approved. Download the app to get started.',
      },
      rejected: {
        title: 'Application Update',
        message: data.appealAllowed
          ? `Your application was not approved. Reason: ${data.reason}. You may appeal this decision.`
          : `Your application was not approved. Reason: ${data.reason}.`,
      },
      orientation_reminder: {
        title: 'Complete Your Orientation',
        message: 'You\'re almost done! Complete your orientation to start earning.',
      },
      menu_extraction_complete: {
        title: 'Menu Ready for Review',
        message: `We've extracted ${data.itemsFound} items from your menu. Please review and confirm.`,
      },
      test_order_ready: {
        title: 'Test Orders Ready',
        message: 'Your test orders are ready. Complete them to finalize your onboarding.',
      },
      reminder_missing_docs: {
        title: 'Documents Needed',
        message: 'Your application is missing required documents. Upload them to continue.',
      },
      high_risk_flagged: {
        title: 'Application Flagged for Review',
        message: 'An application has been flagged for manual review due to elevated risk factors.',
      },
      auto_rejected: {
        title: 'Application Not Approved',
        message: 'Your application did not meet our requirements and was not approved.',
      },
    };

    return templates[type] || { title: 'Notification', message: 'You have a new notification.' };
  }

  /**
   * Generate HTML email template
   */
  private generateEmailTemplate(
    title: string,
    message: string,
    data: Record<string, any>
  ): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
    .content { background: #f9fafb; padding: 30px; margin: 20px 0; }
    .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; 
              text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Paradise Delivery</h1>
    </div>
    <div class="content">
      <h2>${title}</h2>
      <p>${message}</p>
      ${data.nextSteps ? `<p><strong>Next Steps:</strong> ${data.nextSteps}</p>` : ''}
      ${data.actionUrl ? `<a href="${data.actionUrl}" class="button">${data.actionText || 'Take Action'}</a>` : ''}
    </div>
    <div class="footer">
      <p>© 2026 Paradise Delivery. All rights reserved.</p>
      <p>Paradise, CA</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  // Mock methods - replace with actual database calls
  private async getEmailAddress(
    recipientType: string,
    recipientId: string
  ): Promise<string> {
    // Query database for email
    return 'applicant@example.com';
  }

  private async getPhoneNumber(
    recipientType: string,
    recipientId: string
  ): Promise<string> {
    // Query database for phone
    return '+15551234567';
  }
}

async function getPushToken(recipientType: string, recipientId: string): Promise<string> {
  // Query database for push token
  return 'push_token_xxx';
}

// ============================================================================
// Factory Function
// ============================================================================

export function createNotificationService(config: NotificationConfig): NotificationService {
  return new NotificationService(config);
}

// ============================================================================
// Batch Notifications
// ============================================================================

export async function sendDailyDigest(
  service: NotificationService,
  adminId: string,
  stats: {
    pendingReview: number;
    approvedToday: number;
    rejectedToday: number;
  }
): Promise<void> {
  await service.send(
    'high_risk_flagged', // Using as generic admin notification
    'admin',
    adminId,
    {
      type: 'daily_digest',
      title: 'Daily Onboarding Digest',
      message: `Pending: ${stats.pendingReview} | Approved: ${stats.approvedToday} | Rejected: ${stats.rejectedToday}`,
    },
    ['email']
  );
}

export async function sendDocumentReminder(
  service: NotificationService,
  applicationId: string,
  missingDocs: string[]
): Promise<void> {
  await service.send(
    'reminder_missing_docs',
    'driver',
    applicationId,
    {
      missingDocuments: missingDocs,
    },
    ['email', 'sms']
  );
}

export async function sendApprovalNotification(
  service: NotificationService,
  applicationId: string,
  applicantName: string,
  autoApproved: boolean = false
): Promise<void> {
  await service.send(
    'approved',
    'driver',
    applicationId,
    {
      applicantName,
      autoApproved,
      nextSteps: 'Download the driver app and start earning!',
    },
    ['email', 'sms', 'push']
  );
}
