import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { application_id } = await req.json();
    if (!application_id) {
      return Response.json({ error: 'application_id is required' }, { status: 400 });
    }

    const app = await base44.asServiceRole.entities.SellerApplication.get(application_id);
    if (!app) {
      return Response.json({ error: 'Application not found' }, { status: 404 });
    }

    if (app.application_status !== 'rejected') {
      return Response.json({ error: 'Application is not rejected' }, { status: 400 });
    }

    const recipientEmail = app.email || app.user_email;
    const recipientName = app.full_name || 'Applicant';

    await base44.asServiceRole.integrations.Core.SendEmail({
      from_name: 'Everything Valuable',
      to: recipientEmail,
      subject: 'Update on Your Seller Application — Everything Valuable',
      body: `<p>Hi ${recipientName},</p>
<p>Thank you for applying to sell on Everything Valuable. After reviewing your application, we are unable to approve it at this time.</p>
${app.rejection_reason ? `<p><strong>Reason:</strong> ${app.rejection_reason}</p>` : ''}
<p>If you believe this is an error or would like to discuss further, please reach out to our support team.</p>
<p>— The Everything Valuable Team</p>`,
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});