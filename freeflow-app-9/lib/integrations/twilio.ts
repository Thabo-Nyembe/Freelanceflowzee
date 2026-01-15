// =====================================================
// KAZI Twilio Integration - SMS & Voice
// Send SMS, make calls, and manage voice communications
// =====================================================

export interface TwilioConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
  messagingServiceSid?: string;
}

export interface SMSMessage {
  to: string;
  body: string;
  from?: string;
  mediaUrl?: string[];
  statusCallback?: string;
}

export interface VoiceCall {
  to: string;
  from?: string;
  url?: string;
  twiml?: string;
  record?: boolean;
  statusCallback?: string;
}

export interface TwilioResponse {
  sid: string;
  status: string;
  dateCreated: string;
  to: string;
  from: string;
  body?: string;
  price?: string;
  errorCode?: number;
  errorMessage?: string;
}

class TwilioService {
  private static instance: TwilioService;
  private config: TwilioConfig | null = null;

  private constructor() {}

  static getInstance(): TwilioService {
    if (!TwilioService.instance) {
      TwilioService.instance = new TwilioService();
    }
    return TwilioService.instance;
  }

  /**
   * Initialize Twilio with credentials
   */
  initialize(config: TwilioConfig): void {
    this.config = config;
  }

  /**
   * Initialize from environment variables
   */
  initializeFromEnv(): void {
    this.config = {
      accountSid: process.env.TWILIO_ACCOUNT_SID || '',
      authToken: process.env.TWILIO_AUTH_TOKEN || '',
      fromNumber: process.env.TWILIO_PHONE_NUMBER || '',
      messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
    };
  }

  private getAuthHeader(): string {
    if (!this.config) {
      throw new Error('Twilio not initialized. Call initialize() first.');
    }
    const credentials = Buffer.from(`${this.config.accountSid}:${this.config.authToken}`).toString('base64');
    return `Basic ${credentials}`;
  }

  private getBaseUrl(): string {
    if (!this.config) throw new Error('Twilio not initialized');
    return `https://api.twilio.com/2010-04-01/Accounts/${this.config.accountSid}`;
  }

  // =====================================================
  // SMS OPERATIONS
  // =====================================================

  /**
   * Send an SMS message
   */
  async sendSMS(message: SMSMessage): Promise<TwilioResponse> {
    if (!this.config) throw new Error('Twilio not initialized');

    const formData = new URLSearchParams();
    formData.append('To', message.to);
    formData.append('Body', message.body);
    formData.append('From', message.from || this.config.fromNumber);

    if (message.mediaUrl) {
      message.mediaUrl.forEach(url => formData.append('MediaUrl', url));
    }

    if (message.statusCallback) {
      formData.append('StatusCallback', message.statusCallback);
    }

    if (this.config.messagingServiceSid) {
      formData.append('MessagingServiceSid', this.config.messagingServiceSid);
    }

    const response = await fetch(`${this.getBaseUrl()}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send SMS');
    }

    return {
      sid: data.sid,
      status: data.status,
      dateCreated: data.date_created,
      to: data.to,
      from: data.from,
      body: data.body,
      price: data.price,
      errorCode: data.error_code,
      errorMessage: data.error_message,
    };
  }

  /**
   * Send bulk SMS messages
   */
  async sendBulkSMS(messages: SMSMessage[]): Promise<TwilioResponse[]> {
    return Promise.all(messages.map(msg => this.sendSMS(msg)));
  }

  /**
   * Get SMS message details
   */
  async getMessage(messageSid: string): Promise<TwilioResponse> {
    const response = await fetch(`${this.getBaseUrl()}/Messages/${messageSid}.json`, {
      headers: {
        'Authorization': this.getAuthHeader(),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to get message');
    }

    return {
      sid: data.sid,
      status: data.status,
      dateCreated: data.date_created,
      to: data.to,
      from: data.from,
      body: data.body,
      price: data.price,
      errorCode: data.error_code,
      errorMessage: data.error_message,
    };
  }

  /**
   * List recent SMS messages
   */
  async listMessages(limit = 20): Promise<TwilioResponse[]> {
    const response = await fetch(`${this.getBaseUrl()}/Messages.json?PageSize=${limit}`, {
      headers: {
        'Authorization': this.getAuthHeader(),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to list messages');
    }

    return data.messages.map((msg: any) => ({
      sid: msg.sid,
      status: msg.status,
      dateCreated: msg.date_created,
      to: msg.to,
      from: msg.from,
      body: msg.body,
      price: msg.price,
    }));
  }

  // =====================================================
  // VOICE OPERATIONS
  // =====================================================

  /**
   * Initiate a voice call
   */
  async makeCall(call: VoiceCall): Promise<TwilioResponse> {
    if (!this.config) throw new Error('Twilio not initialized');

    const formData = new URLSearchParams();
    formData.append('To', call.to);
    formData.append('From', call.from || this.config.fromNumber);

    if (call.url) {
      formData.append('Url', call.url);
    } else if (call.twiml) {
      formData.append('Twiml', call.twiml);
    }

    if (call.record) {
      formData.append('Record', 'true');
    }

    if (call.statusCallback) {
      formData.append('StatusCallback', call.statusCallback);
    }

    const response = await fetch(`${this.getBaseUrl()}/Calls.json`, {
      method: 'POST',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to make call');
    }

    return {
      sid: data.sid,
      status: data.status,
      dateCreated: data.date_created,
      to: data.to,
      from: data.from,
    };
  }

  /**
   * Get call details
   */
  async getCall(callSid: string): Promise<TwilioResponse> {
    const response = await fetch(`${this.getBaseUrl()}/Calls/${callSid}.json`, {
      headers: {
        'Authorization': this.getAuthHeader(),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to get call');
    }

    return {
      sid: data.sid,
      status: data.status,
      dateCreated: data.date_created,
      to: data.to,
      from: data.from,
      price: data.price,
    };
  }

  /**
   * End an active call
   */
  async endCall(callSid: string): Promise<TwilioResponse> {
    const formData = new URLSearchParams();
    formData.append('Status', 'completed');

    const response = await fetch(`${this.getBaseUrl()}/Calls/${callSid}.json`, {
      method: 'POST',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to end call');
    }

    return {
      sid: data.sid,
      status: data.status,
      dateCreated: data.date_created,
      to: data.to,
      from: data.from,
    };
  }

  // =====================================================
  // VERIFICATION OPERATIONS
  // =====================================================

  /**
   * Send verification code via SMS
   */
  async sendVerificationCode(to: string, code: string): Promise<TwilioResponse> {
    return this.sendSMS({
      to,
      body: `Your KAZI verification code is: ${code}. This code expires in 10 minutes.`,
    });
  }

  /**
   * Send OTP for two-factor authentication
   */
  async sendOTP(to: string, code: string, appName = 'KAZI'): Promise<TwilioResponse> {
    return this.sendSMS({
      to,
      body: `Your ${appName} one-time password is: ${code}. Do not share this code with anyone.`,
    });
  }

  // =====================================================
  // NOTIFICATION TEMPLATES
  // =====================================================

  /**
   * Send invoice notification
   */
  async sendInvoiceNotification(to: string, data: {
    invoiceNumber: string;
    amount: string;
    dueDate: string;
    clientName: string;
    paymentLink?: string;
  }): Promise<TwilioResponse> {
    let body = `Hi ${data.clientName}, Invoice #${data.invoiceNumber} for ${data.amount} is due on ${data.dueDate}.`;
    if (data.paymentLink) {
      body += ` Pay now: ${data.paymentLink}`;
    }
    return this.sendSMS({ to, body });
  }

  /**
   * Send appointment reminder
   */
  async sendAppointmentReminder(to: string, data: {
    clientName: string;
    appointmentTime: string;
    appointmentDate: string;
    serviceName?: string;
  }): Promise<TwilioResponse> {
    let body = `Hi ${data.clientName}, reminder: You have an appointment on ${data.appointmentDate} at ${data.appointmentTime}.`;
    if (data.serviceName) {
      body += ` Service: ${data.serviceName}`;
    }
    return this.sendSMS({ to, body });
  }

  /**
   * Send project update notification
   */
  async sendProjectUpdate(to: string, data: {
    clientName: string;
    projectName: string;
    status: string;
    message?: string;
  }): Promise<TwilioResponse> {
    let body = `Hi ${data.clientName}, your project "${data.projectName}" status has been updated to: ${data.status}.`;
    if (data.message) {
      body += ` ${data.message}`;
    }
    return this.sendSMS({ to, body });
  }

  /**
   * Send payment received notification
   */
  async sendPaymentReceived(to: string, data: {
    clientName: string;
    amount: string;
    invoiceNumber?: string;
  }): Promise<TwilioResponse> {
    let body = `Hi ${data.clientName}, we've received your payment of ${data.amount}.`;
    if (data.invoiceNumber) {
      body += ` Invoice #${data.invoiceNumber} has been marked as paid.`;
    }
    body += ' Thank you!';
    return this.sendSMS({ to, body });
  }

  // =====================================================
  // WEBHOOK HANDLING
  // =====================================================

  /**
   * Verify Twilio webhook signature
   */
  verifyWebhookSignature(
    signature: string,
    url: string,
    params: Record<string, string>
  ): boolean {
    if (!this.config) throw new Error('Twilio not initialized');

    // Sort parameters alphabetically and concatenate
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => key + params[key])
      .join('');

    const data = url + sortedParams;

    // Create HMAC-SHA1 signature
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha1', this.config.authToken)
      .update(Buffer.from(data, 'utf-8'))
      .digest('base64');

    return signature === expectedSignature;
  }

  /**
   * Parse incoming SMS webhook
   */
  parseIncomingSMS(body: Record<string, string>): {
    messageSid: string;
    from: string;
    to: string;
    body: string;
    numMedia: number;
    mediaUrls: string[];
  } {
    const numMedia = parseInt(body.NumMedia || '0', 10);
    const mediaUrls: string[] = [];

    for (let i = 0; i < numMedia; i++) {
      const url = body[`MediaUrl${i}`];
      if (url) mediaUrls.push(url);
    }

    return {
      messageSid: body.MessageSid,
      from: body.From,
      to: body.To,
      body: body.Body,
      numMedia,
      mediaUrls,
    };
  }

  /**
   * Generate TwiML response for incoming calls
   */
  generateTwiMLResponse(options: {
    say?: string;
    play?: string;
    gather?: {
      action: string;
      numDigits?: number;
      timeout?: number;
      prompt?: string;
    };
    redirect?: string;
    hangup?: boolean;
  }): string {
    let twiml = '<?xml version="1.0" encoding="UTF-8"?><Response>';

    if (options.say) {
      twiml += `<Say>${options.say}</Say>`;
    }

    if (options.play) {
      twiml += `<Play>${options.play}</Play>`;
    }

    if (options.gather) {
      twiml += `<Gather action="${options.gather.action}"`;
      if (options.gather.numDigits) {
        twiml += ` numDigits="${options.gather.numDigits}"`;
      }
      if (options.gather.timeout) {
        twiml += ` timeout="${options.gather.timeout}"`;
      }
      twiml += '>';
      if (options.gather.prompt) {
        twiml += `<Say>${options.gather.prompt}</Say>`;
      }
      twiml += '</Gather>';
    }

    if (options.redirect) {
      twiml += `<Redirect>${options.redirect}</Redirect>`;
    }

    if (options.hangup) {
      twiml += '<Hangup/>';
    }

    twiml += '</Response>';
    return twiml;
  }
}

export const twilioService = TwilioService.getInstance();
