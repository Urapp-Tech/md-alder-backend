import sendgridMail from '@sendgrid/mail';
import fastifyPlugin from 'fastify-plugin';

async function fastifyMailer(fastify, opts) {
  sendgridMail.setApiKey(opts.apiKey);

  const handler = async (data) => {
    return sendgridMail.send({
      to: data.to,
      from: opts.from,
      subject: data.subject,
      text: data.text,
      html: data.html,
      attachments: data.attachments,
    });
  };
  fastify.decorateRequest('sendEmail', handler);
}

export default fastifyPlugin(fastifyMailer);
