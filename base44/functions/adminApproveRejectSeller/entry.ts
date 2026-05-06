import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { application_id, action, admin_notes, rejection_reason } = await req.json();

    if (!application_id || !action) {
      return Response.json({ error: 'application_id and action are required' }, { status: 400 });
    }

    const validActions = ['approve', 'reject', 'needs_more_info'];
    if (!validActions.includes(action)) {
      return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Fetch the application
    const app = await base44.asServiceRole.entities.SellerApplication.get(application_id);
    if (!app) {
      return Response.json({ error: 'Application not found' }, { status: 404 });
    }

    const statusMap = { approve: 'approved', reject: 'rejected', needs_more_info: 'needs_more_info' };
    const newStatus = statusMap[action];

    // Update the application
    const updateData = {
      application_status: newStatus,
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.email,
    };
    if (admin_notes) updateData.admin_notes = admin_notes;
    if (rejection_reason) updateData.rejection_reason = rejection_reason;

    await base44.asServiceRole.entities.SellerApplication.update(application_id, updateData);

    // If approved, update user role to seller
    if (action === 'approve') {
      const users = await base44.asServiceRole.entities.User.filter({ email: app.user_email });
      if (users.length > 0) {
        try {
          await base44.asServiceRole.entities.User.update(users[0].id, { role: 'seller' });
        } catch (_) {
          // ignore role update errors for app owner
        }
      }

      // Create seller profile if it doesn't exist
      const profiles = await base44.asServiceRole.entities.SellerProfile.filter({ user_email: app.user_email });
      if (profiles.length === 0) {
        await base44.asServiceRole.entities.SellerProfile.create({
          user_email: app.user_email,
          display_name: app.business_name || app.full_name,
          legal_name: app.full_name,
          phone: app.phone || '',
          website: app.business_website || '',
          bio: app.message || '',
          seller_type: app.seller_type,
          verified: true,
        });
      }
    }

    // Send email notification
    const recipientEmail = app.email || app.user_email;
    const recipientName = app.full_name || 'Applicant';

    let emailSubject = '';
    let emailBody = '';

    if (action === 'approve') {
      emailSubject = 'Your Seller Application Has Been Approved — Everything Valuable';
      emailBody = `<p>Hi ${recipientName},</p>
<p>Great news! Your seller application has been <strong>approved</strong>. You now have full seller access on Everything Valuable.</p>
<p>You can log in and access your Seller Dashboard to start listing items, manage your inventory, and receive payments.</p>
${admin_notes ? `<p><strong>Note from our team:</strong> ${admin_notes}</p>` : ''}
<p>Thank you for joining us. We look forward to seeing your listings!</p>
<p>— The Everything Valuable Team</p>`;
    } else if (action === 'reject') {
      emailSubject = 'Update on Your Seller Application — Everything Valuable';
      emailBody = `<p>Hi ${recipientName},</p>
<p>Thank you for applying to sell on Everything Valuable. After reviewing your application, we are unable to approve it at this time.</p>
${rejection_reason ? `<p><strong>Reason:</strong> ${rejection_reason}</p>` : ''}
<p>If you believe this is an error or would like to discuss further, please reach out to our support team.</p>
<p>— The Everything Valuable Team</p>`;
    } else if (action === 'needs_more_info') {
      emailSubject = 'Additional Information Needed — Everything Valuable Seller Application';
      emailBody = `<p>Hi ${recipientName},</p>
<p>Thank you for applying to sell on Everything Valuable. We're reviewing your application but need a bit more information before we can proceed.</p>
${admin_notes ? `<p><strong>Our team notes:</strong> ${admin_notes}</p>` : '<p>An admin will be in touch with you shortly with specific questions.</p>'}
<p>Please reply to this email or contact our support team to provide the requested information.</p>
<p>— The Everything Valuable Team</p>`;
    }

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: recipientEmail,
      subject: emailSubject,
      body: emailBody,
    });

    // Log the action
    await base44.asServiceRole.entities.AdminLog.create({
      admin_email: user.email,
      action_type: action === 'approve' ? 'seller_approved' : action === 'reject' ? 'seller_rejected' : 'note_added',
      affected_user_email: app.user_email,
      new_value: newStatus,
      reason: rejection_reason || admin_notes || '',
    });

    return Response.json({ success: true, new_status: newStatus });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});