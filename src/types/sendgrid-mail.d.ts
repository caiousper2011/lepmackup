declare module "@sendgrid/mail" {
  export interface SendGridMessage {
    to: string | string[];
    from: string;
    subject: string;
    text?: string;
    html?: string;
    [key: string]: unknown;
  }

  const sgMail: {
    setApiKey(apiKey: string): void;
    send(message: SendGridMessage): Promise<unknown>;
  };

  export default sgMail;
}
