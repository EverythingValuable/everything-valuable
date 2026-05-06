import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { full_name, email, phone, business_name, seller_type, business_website, address, specialty, message } = body;

    if (!full_name || !seller_type) {
      return Response.json({ error: 'Full name and seller type are required.' }, { status: 400 });
    }

    // Check for existing pending/approved application
    const existing = await base44.asServiceRole.entities.SellerApplication.filter({ user_email: user.email });
    const active = existing.find(a => ['pending', 'approved', 'needs_more_info'].includes(a.application_status));
    if (active) {
      return Response.json({ error: 'You already have an active application.' }, { status: 400 });
    }

    // Create the application
    const application = await base44.asServiceRole.entities.SellerApplication.create({
      user_id: user.id,
      user_email: user.email,
      full_name: full_name || user.full_name,
      email: email || user.email,
      phone: phone || '',
      business_name: business_name || '',
      seller_type,
      business_website: business_website || '',
      address: address || '',
      specialty: specialty || '',
      message: message || '',
      application_status: 'pending',
      submitted_at: new Date().toISOString(),
    });

    // Update the user's role to pending_seller (may fail for app owner, that's ok)
    try {
      await base44.asServiceRole.entities.User.update(user.id, { role: 'pending_seller' });
    } catch (_) {
      // ignore role update errors (e.g. app owner)
    }

    // Send confirmation email
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: email || user.email,
      subject: 'Your Seller Application Has Been Received — Everything Valuable',
      body: `<p>Hi ${full_name || user.full_name},</p>
<p>Thank you for applying to sell on Everything Valuable! We've received your application and our team will review it within <strong>1–3 business days</strong>.</p>
<p>We'll send you an email as soon as there's an update on your application status.</p>
<p>— The Everything Valuable Team</p>`,
    });

    return Response.json({ success: true, application_id: application.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});