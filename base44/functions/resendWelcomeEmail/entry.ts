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

    if (app.application_status !== 'approved') {
      return Response.json({ error: 'Seller is not approved' }, { status: 400 });
    }

    const recipientEmail = app.email || app.user_email;
    const recipientName = app.full_name || 'Seller';

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: recipientEmail,
      subject: 'Welcome to Everything Valuable — Your Seller Account is Active',
      body: `<p>Hi ${recipientName},</p>
<p>We wanted to reach out and officially welcome you to <strong>Everything Valuable</strong>!</p>
<p>Your seller account is <strong>active and ready to go</strong>. Here's how to get started:</p>
<ul>
  <li><strong>Log in</strong> to your account at everythingvaluable.com</li>
  <li>Visit your <strong>Seller Dashboard</strong> to manage your inventory</li>
  <li>Use the <strong>Listing Studio</strong> to create your first listing</li>
  <li>Review your <strong>Seller Settings</strong> to add your profile, payment info, and default terms</li>
</ul>
<p>Our platform uses a unique two-phase auction model — the <strong>1stBids™</strong> preview period followed by the live <strong>PRI$OMETER™</strong> — designed to maximize exposure and final sale prices for your items.</p>
<p>If you have any questions, don't hesitate to reach out to our support team. We're here to help you succeed.</p>
<p>Welcome aboard!</p>
<p>— The Everything Valuable Team</p>`,
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});