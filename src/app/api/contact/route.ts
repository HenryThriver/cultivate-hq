import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { logger } from '@/lib/utils/logger';

// Initialize Resend only when API key is available
const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable is not set');
  }
  return new Resend(apiKey);
};

// Initialize DOMPurify for server-side sanitization
const window = new JSDOM('').window;
const purify = DOMPurify(window as unknown as Window & typeof globalThis);

// Input validation constants
const INPUT_LIMITS = {
  name: 100,
  email: 254, // RFC 5321 email length limit
  subject: 200,
  message: 5000,
  company: 200,
  jobTitle: 100,
  industry: 100,
  currentSolution: 500,
  challenges: 2000,
} as const;

// Sanitize and validate input
const sanitizeInput = (input: string, maxLength: number): string => {
  if (!input) return '';
  
  // Trim whitespace and truncate to max length
  const trimmed = input.trim().substring(0, maxLength);
  
  // Sanitize HTML to prevent XSS
  return purify.sanitize(trimmed);
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
      name: rawName, 
      email: rawEmail, 
      subject: rawSubject, 
      message: rawMessage, 
      formType = 'contact',
      company: rawCompany,
      jobTitle: rawJobTitle,
      companySize,
      industry: rawIndustry,
      currentSolution: rawCurrentSolution,
      challenges: rawChallenges,
      timeline,
      budget
    } = body;

    // Sanitize and validate all inputs
    const name = sanitizeInput(rawName, INPUT_LIMITS.name);
    const email = sanitizeInput(rawEmail, INPUT_LIMITS.email);
    const subject = sanitizeInput(rawSubject, INPUT_LIMITS.subject);
    const message = sanitizeInput(rawMessage, INPUT_LIMITS.message);
    const company = sanitizeInput(rawCompany || '', INPUT_LIMITS.company);
    const jobTitle = sanitizeInput(rawJobTitle || '', INPUT_LIMITS.jobTitle);
    const industry = sanitizeInput(rawIndustry || '', INPUT_LIMITS.industry);
    const currentSolution = sanitizeInput(rawCurrentSolution || '', INPUT_LIMITS.currentSolution);
    const challenges = sanitizeInput(rawChallenges || '', INPUT_LIMITS.challenges);

    // Basic validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }

    // Validate input lengths
    if (rawName?.length > INPUT_LIMITS.name || 
        rawEmail?.length > INPUT_LIMITS.email ||
        rawSubject?.length > INPUT_LIMITS.subject ||
        rawMessage?.length > INPUT_LIMITS.message) {
      return NextResponse.json(
        { error: 'Input exceeds maximum length limits' }, 
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
      replyTo: email,
    });

    if (error) {
      // Log error securely without exposing details to client
      logger.error('Email sending failed', error as Error, 'CONTACT_FORM', {
        formType,
        timestamp: new Date().toISOString()
      });
      return NextResponse.json(
        { error: 'Failed to send email. Please try again later.' }, 
        { status: 500 }
      );
    }

    // Log success securely
    logger.info('Email sent successfully', 'CONTACT_FORM', {
      formType,
      emailId: data?.id,
      timestamp: new Date().toISOString()
    });

    // Return success response
    return NextResponse.json({ 
      success: true,
      message: 'Email sent successfully'
    });

  } catch (error) {
    // Secure error logging
    logger.error('Contact form error', error as Error, 'CONTACT_FORM', {
      timestamp: new Date().toISOString()
    });
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' }, 
      { status: 500 }
    );
  }
}