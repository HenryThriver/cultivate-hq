import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend only when API key is available
const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable is not set');
  }
  return new Resend(apiKey);
};

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  captcha: string;
  formType?: 'contact' | 'enterprise';
  // Enterprise-specific fields
  company?: string;
  jobTitle?: string;
  companySize?: string;
  industry?: string;
  currentSolution?: string;
  challenges?: string;
  timeline?: string;
  budget?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json();
    const { 
      name, 
      email, 
      subject, 
      message, 
      formType = 'contact',
      company,
      jobTitle,
      companySize,
      industry,
      currentSolution,
      challenges,
      timeline,
      budget
    } = body;

    // Basic validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' }, 
        { status: 400 }
      );
    }

    // Determine recipient and subject based on form type
    const isEnterprise = formType === 'enterprise';
    const recipient = isEnterprise ? 'enterprise@cultivate-hq.com' : 'hello@cultivate-hq.com';
    const emailSubject = `${isEnterprise ? '[ENTERPRISE] ' : ''}${subject}`;

    // Build email HTML content
    let emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2196F3; border-bottom: 2px solid #2196F3; padding-bottom: 10px;">
          ${isEnterprise ? 'Enterprise Inquiry' : 'Contact Form Submission'}
        </h2>
        
        <div style="margin: 20px 0;">
          <h3 style="color: #333; margin-bottom: 15px;">Contact Information</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        </div>
    `;

    // Add enterprise-specific fields if present
    if (isEnterprise) {
      emailContent += `
        <div style="margin: 20px 0;">
          <h3 style="color: #333; margin-bottom: 15px;">Company Information</h3>
          ${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
          ${jobTitle ? `<p><strong>Job Title:</strong> ${jobTitle}</p>` : ''}
          ${companySize ? `<p><strong>Company Size:</strong> ${companySize}</p>` : ''}
          ${industry ? `<p><strong>Industry:</strong> ${industry}</p>` : ''}
        </div>
        
        <div style="margin: 20px 0;">
          <h3 style="color: #333; margin-bottom: 15px;">Project Details</h3>
          ${currentSolution ? `<p><strong>Current Solution:</strong> ${currentSolution}</p>` : ''}
          ${challenges ? `<p><strong>Key Challenges:</strong><br>${challenges.replace(/\n/g, '<br>')}</p>` : ''}
          ${timeline ? `<p><strong>Timeline:</strong> ${timeline}</p>` : ''}
          ${budget ? `<p><strong>Budget Range:</strong> ${budget}</p>` : ''}
        </div>
      `;
    }

    // Add message section
    emailContent += `
        <div style="margin: 20px 0;">
          <h3 style="color: #333; margin-bottom: 15px;">Message</h3>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
            ${message.replace(/\n/g, '<br>')}
          </div>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
          <p>This email was sent from the Cultivate HQ ${isEnterprise ? 'Enterprise' : 'Contact'} form.</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
        </div>
      </div>
    `;

    // Send email using Resend
    const resend = getResendClient();
    const { data, error } = await resend.emails.send({
      from: 'Cultivate HQ Contact <contact@cultivate-hq.com>',
      to: [recipient],
      subject: emailSubject,
      html: emailContent,
      // Add reply-to so responses go directly to the user
      reply_to: email,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to send email' }, 
        { status: 500 }
      );
    }

    console.log('Email sent successfully:', data);

    // Return success response
    return NextResponse.json({ 
      success: true,
      message: 'Email sent successfully',
      id: data?.id 
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}