'use client';

import { Container, Typography, Box, Paper, Divider } from '@mui/material';
import Link from 'next/link';
import { MarketingLayout } from '@/components/layout/MarketingLayout';

export default function TermsOfServicePage(): React.JSX.Element {
  return (
    <MarketingLayout>
      <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Terms of Service
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Last updated: {new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'grey.200' }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          1. Definitions
        </Typography>
        <Typography variant="body1" paragraph>
          Let&apos;s make sure we&apos;re on the same page about what certain terms mean:
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>&quot;Service&quot; or &quot;Services&quot;</strong> means Cultivate HQ, including our web application, AI processing, integrations, and any related features we provide.
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>&quot;Customer,&quot; &quot;you,&quot; or &quot;your&quot;</strong> means the person or company using our Services.
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>&quot;Customer Data&quot;</strong> means any data you input into the Service or that we collect on your behalf, including contact information, communications, and relationship data.
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>&quot;AI Services&quot;</strong> means our artificial intelligence and machine learning features that analyze your data to provide insights and suggestions.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          2. Acceptance of Terms
        </Typography>
        <Typography variant="body1" paragraph>
          Welcome to Cultivate HQ! By using our service, you&apos;re agreeing to these terms. Think of this as our agreement about how we work together. If you don&apos;t agree with these terms, please don&apos;t use our service.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          3. Description of Service
        </Typography>
        <Typography variant="body1" paragraph>
          Cultivate HQ is your relationship intelligence platform. We help you manage and nurture your professional and personal networks by providing AI-powered contact insights, integrating with your email and calendar, recording and analyzing voice memos, suggesting follow-ups, and tracking all your interactions in one place.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          4. User Accounts and Authentication
        </Typography>
        <Typography variant="body1" paragraph>
          You&apos;ll need to create an account to use Cultivate HQ, which you can do through secure third-party authentication services. You&apos;re responsible for keeping your account secure and for everything that happens with your account. Please provide accurate information when signing up and keep it updated.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          5. Your Responsibilities
        </Typography>
        <Typography variant="body1" paragraph>
          When you use Cultivate HQ, you agree to:
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Keep your account secure:</strong> Use strong passwords, enable two-factor authentication when available, and don&apos;t share your login credentials.
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Use the service legally:</strong> Only use Cultivate HQ for lawful purposes and in compliance with all applicable laws and regulations.
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Respect others&apos; rights:</strong> Don&apos;t upload or process data that infringes on others&apos; intellectual property, privacy rights, or confidentiality.
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Maintain data accuracy:</strong> Ensure that the contact and relationship data you input is accurate and you have the right to use it.
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Pay your bills:</strong> Keep your payment information current and pay your subscription fees on time.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          6. Subscription and Payment Terms
        </Typography>
        <Typography variant="body1" paragraph>
          Cultivate HQ operates on a subscription model. We use secure third-party payment processors to handle billing. When you subscribe, you&apos;re agreeing to pay the subscription fees and any applicable taxes.
        </Typography>
        <Typography variant="body1" paragraph>
          You can cancel your subscription anytime through your account settings. Subscription fees are generally non-refundable, but we&apos;ll follow applicable laws in your jurisdiction.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          7. Data Usage and Processing
        </Typography>
        <Typography variant="body1" paragraph>
          When you use Cultivate HQ, you&apos;re giving us permission to process your data to provide our services. This means we&apos;ll analyze your contact information and interactions using AI to generate insights and suggestions that help you manage your relationships better. We only use your data as described in our Privacy Policy and only to make the service work for you.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          8. Acceptable Use Policy
        </Typography>
        <Typography variant="body1" paragraph>
          Please use Cultivate HQ responsibly. Don&apos;t use our service for anything illegal or to harm others. This includes not uploading harmful content, trying to hack into our systems or other users&apos; accounts, using the service to spam or harass people, or attempting to reverse engineer our software. Basically, be respectful and follow the law.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          9. Intellectual Property Rights
        </Typography>
        <Typography variant="body1" paragraph>
          We own Cultivate HQ - the software, features, and how everything works. Your data remains yours. When our AI generates insights and suggestions from your data, those are provided as part of our service to help you, but the underlying data is still yours.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          10. Data Ownership
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Your data is yours.</strong> You retain all rights to your Customer Data. By using our Service, you grant us a limited license to process your data solely to provide the Service to you. We can&apos;t use your data for any other purpose without your permission.
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Our insights are part of the Service.</strong> While your underlying data remains yours, the AI-generated insights, suggestions, and analysis we provide are part of our Service offering.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          11. Confidentiality
        </Typography>
        <Typography variant="body1" paragraph>
          We understand that relationship data is sensitive. We&apos;ll treat your Customer Data as confidential information and won&apos;t disclose it to third parties except as necessary to provide the Service or as required by law. Similarly, if we share any confidential information with you about our Service, you agree to keep it confidential.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          12. Third-Party Integrations
        </Typography>
        <Typography variant="body1" paragraph>
          Cultivate HQ works with other services like email providers and social platforms. When you connect these services, you&apos;re also agreeing to their terms and privacy policies. We can&apos;t control how these other services work, so we&apos;re not responsible for any issues with them.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          13. Service Availability and Modifications
        </Typography>
        <Typography variant="body1" paragraph>
          We work hard to keep Cultivate HQ running smoothly, but like any online service, we can&apos;t promise it will be available 100% of the time. We may need to update, modify, or temporarily suspend the service for maintenance. If we ever need to make major changes or discontinue the service, we&apos;ll give you reasonable notice.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          14. Warranties and Disclaimers
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>We provide Cultivate HQ &quot;as-is&quot; and &quot;as available.&quot;</strong> While we work hard to make our service reliable and useful, we can&apos;t guarantee it will always work perfectly or meet all your needs.
        </Typography>
        <Typography variant="body1" paragraph>
          To the maximum extent permitted by law, we disclaim all warranties, whether express, implied, or statutory, including warranties of merchantability, fitness for a particular purpose, and non-infringement. We don&apos;t warrant that the Service will be uninterrupted, secure, or error-free.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          15. Limitation of Liability
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>We limit our liability to protect both of us.</strong> To the maximum extent permitted by law, neither Cultivate HQ nor its suppliers will be liable for any indirect, incidental, special, consequential, or punitive damages, including lost profits, data loss, or business interruption.
        </Typography>
        <Typography variant="body1" paragraph>
          Our total liability for any claims under these terms won&apos;t exceed the amount you paid us in the twelve months before the claim arose. This limitation applies regardless of the legal theory behind the claim.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          16. Indemnification
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>We&apos;ll have each other&apos;s backs.</strong> You agree to defend and indemnify us from claims arising from your use of the Service, your violation of these terms, or your infringement of others&apos; rights. Similarly, we&apos;ll defend and indemnify you from claims that our Service infringes third-party intellectual property rights.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          17. Termination
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Either of us can end this relationship.</strong> You can cancel your subscription anytime through your account settings. We may suspend or terminate your account if you violate these terms or if we need to discontinue the Service.
        </Typography>
        <Typography variant="body1" paragraph>
          Upon termination, your right to use the Service ends immediately. We&apos;ll provide you a reasonable opportunity to export your data unless we&apos;re terminating for cause.
        </Typography>
        <Divider sx={{ my: 4 }} />

        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          18. Dispute Resolution
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Let&apos;s try to work things out.</strong> If we have a dispute, we&apos;ll first try to resolve it informally. Contact us at legal@cultivatehq.com and we&apos;ll work with you to find a solution.
        </Typography>
        <Typography variant="body1" paragraph>
          If we can&apos;t resolve things informally, any disputes will be resolved through binding arbitration in accordance with the American Arbitration Association rules. The arbitration will be conducted in Delaware, and judgment on the award may be entered in any court having jurisdiction.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          19. Governing Law
        </Typography>
        <Typography variant="body1" paragraph>
          These terms are governed by Delaware law, without regard to conflict of law principles. Any legal action related to these terms must be filed in the state or federal courts located in Delaware.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          20. Export Controls
        </Typography>
        <Typography variant="body1" paragraph>
          Our Service may be subject to U.S. export control laws. You agree not to export or re-export our Service to any country, person, or entity restricted by U.S. export laws.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          21. Beta Features
        </Typography>
        <Typography variant="body1" paragraph>
          We may offer beta features that are still in development. These features are provided &quot;as-is&quot; without any warranties, and we may modify or discontinue them at any time. Your use of beta features is at your own risk.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          22. Feedback and Suggestions
        </Typography>
        <Typography variant="body1" paragraph>
          We love hearing your ideas! If you provide feedback or suggestions about our Service, you grant us the right to use them without any obligation to compensate you. This helps us improve Cultivate HQ for everyone.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          23. Entire Agreement
        </Typography>
        <Typography variant="body1" paragraph>
          These Terms, along with our Privacy Policy, constitute the entire agreement between you and Cultivate HQ. They supersede any prior agreements or understandings.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          24. Changes to Terms
        </Typography>
        <Typography variant="body1" paragraph>
          We may need to update these terms from time to time. When we make significant changes, we&apos;ll let you know by updating this page and changing the &quot;last updated&quot; date at the top. For major changes, we&apos;ll do our best to give you additional notice.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          25. Contact Information
        </Typography>
        <Typography variant="body1" paragraph>
          Have questions about these terms? We&apos;re here to help! You can reach us at: legal@cultivatehq.com
        </Typography>
      </Paper>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Link href="/dashboard" style={{ textDecoration: 'none' }}>
          <Typography variant="body2" color="primary" sx={{ cursor: 'pointer' }}>
            ← Back to Dashboard
          </Typography>
        </Link>
      </Box>
      </Container>
    </MarketingLayout>
  );
}