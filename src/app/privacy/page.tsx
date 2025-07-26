'use client';

import { Container, Typography, Box, Paper, Divider } from '@mui/material';
import Link from 'next/link';
import { MarketingLayout } from '@/components/layout/MarketingLayout';

export default function PrivacyPolicyPage(): React.JSX.Element {
  return (
    <MarketingLayout>
      <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Privacy Policy
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
          1. Introduction
        </Typography>
        <Typography variant="body1" paragraph>
          Your privacy matters to us. This policy explains what information we collect when you use Cultivate HQ, why we collect it, and how we protect it. We believe in being transparent about our data practices, so here's everything you need to know.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          2. Information We Collect
        </Typography>
        <Typography variant="body1" paragraph>
          We collect information in a few different ways: information you give us directly, data from services you connect to us, and some basic information about how you use our platform.
        </Typography>
        
        <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
          2.1 Personal Information
        </Typography>
        <Typography variant="body1" paragraph>
          This includes your account details (name, email), the contacts you add to your network, records of your interactions and communications, and any voice memos you record.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
          2.2 Third-Party Data
        </Typography>
        <Typography variant="body1" paragraph>
          When you connect external services like email, calendar, or social media accounts, we collect relevant data from those platforms to help build your relationship intelligence.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
          2.3 Usage Information
        </Typography>
        <Typography variant="body1" paragraph>
          We collect basic technical information like your device type and browser, how you use our features, and system logs to help us improve the service and fix any issues.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          3. How We Use Your Information
        </Typography>
        <Typography variant="body1" paragraph>
          We use your information to make Cultivate HQ work for you. This means providing relationship insights, analyzing your data with AI to generate helpful suggestions, managing your account and payments, providing customer support, and continuously improving our service. Everything we do with your data is focused on making the platform more useful for managing your relationships.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          4. Legal Basis for Processing
        </Typography>
        <Typography variant="body1" paragraph>
          We process your personal data based on several legal grounds:
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Contract:</strong> We need to process your data to provide the Service you've subscribed to.
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Legitimate Interests:</strong> We process data to improve our Service, ensure security, and prevent fraud.
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Consent:</strong> For certain processing activities, like marketing communications, we'll ask for your explicit consent.
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Legal Obligations:</strong> Sometimes we need to process data to comply with laws or legal orders.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          5. AI Processing and Machine Learning
        </Typography>
        <Typography variant="body1" paragraph>
          Our AI analyzes your communications and interactions to provide helpful insights about your relationships. This includes understanding the content of your messages and notes, recognizing patterns in how you interact with people, automatically organizing your contacts and activities, and suggesting when you might want to reach out to someone.
        </Typography>
        <Typography variant="body1" paragraph>
          We work with trusted AI service providers who are required to protect your data and only use it to provide services to us - never for their own purposes.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          6. Automated Decision Making
        </Typography>
        <Typography variant="body1" paragraph>
          Our AI makes automated suggestions about your relationships, but <strong>you're always in control</strong>. We don't make any fully automated decisions that would significantly affect you without human involvement. All AI suggestions are just that - suggestions for you to review and act on as you see fit.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          7. Information Sharing and Disclosure
        </Typography>
        <Typography variant="body1" paragraph>
          We don't sell your personal information. Period. We only share your data in very specific circumstances to provide our service or comply with the law:
        </Typography>
        
        <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
          5.1 Service Providers
        </Typography>
        <Typography variant="body1" paragraph>
          We work with trusted companies that help us run Cultivate HQ, like our AI providers, cloud hosting services, payment processors, and security services. These partners are required to protect your data and can only use it to help us provide our service to you.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
          5.2 Legal Requirements
        </Typography>
        <Typography variant="body1" paragraph>
          If we're legally required to share your information (like by court order) or if we need to protect the safety of our users, we may disclose your data. We'll only do this when absolutely necessary.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          8. Third-Party Integrations
        </Typography>
        <Typography variant="body1" paragraph>
          When you connect external services like Gmail or LinkedIn to Cultivate HQ, you're giving us permission to access relevant data from those services to provide our relationship intelligence features. Remember that these external services have their own privacy policies that also apply to your data.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          9. Data Security
        </Typography>
        <Typography variant="body1" paragraph>
          We take protecting your data seriously. We encrypt your information when it's stored and when it's being transmitted, use strong access controls to limit who can see your data, regularly monitor our systems for security issues, and follow industry best practices for data protection.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          10. Data Retention
        </Typography>
        <Typography variant="body1" paragraph>
          We keep your data according to these timeframes:
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Active account data:</strong> As long as you have an active subscription plus 30 days.
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>After cancellation:</strong> We retain your data for 90 days in case you want to reactivate.
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Legal and tax records:</strong> Up to 7 years as required by law.
        </Typography>
        <Typography variant="body1" paragraph>
          You can request immediate deletion of your data anytime, except for information we must keep for legal reasons.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          11. Your Rights and Choices
        </Typography>
        <Typography variant="body1" paragraph>
          You have control over your personal information. You can access and review what data we have about you, correct any mistakes, delete your account and data, export your information to take elsewhere, and object to certain ways we process your data. Just contact us if you want to exercise any of these rights.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          12. International Data Transfers
        </Typography>
        <Typography variant="body1" paragraph>
          Your data might be processed in different countries as we use global cloud services. We ensure appropriate protection through:
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Standard Contractual Clauses:</strong> We use EU-approved contracts when transferring data outside the European Economic Area.
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Data Privacy Framework:</strong> We work with providers that participate in approved data transfer frameworks.
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Technical Safeguards:</strong> All data is encrypted in transit and at rest, regardless of location.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          13. Cookies and Tracking Technologies
        </Typography>
        <Typography variant="body1" paragraph>
          We use different types of cookies and similar technologies:
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Essential Cookies:</strong> These are necessary for the Service to work properly, like keeping you logged in.
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Analytics Cookies:</strong> These help us understand how you use Cultivate HQ so we can improve it.
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Preference Cookies:</strong> These remember your settings and preferences.
        </Typography>
        <Typography variant="body1" paragraph>
          You can control cookies through your browser settings, but disabling essential cookies might prevent you from using certain features. We respect "Do Not Track" signals from your browser.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          14. Children&apos;s Privacy
        </Typography>
        <Typography variant="body1" paragraph>
          Cultivate HQ is designed for adults and we don't knowingly collect information from children under 13. If you think we've accidentally collected a child's information, please let us know right away so we can delete it.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          15. Changes to This Privacy Policy
        </Typography>
        <Typography variant="body1" paragraph>
          We may update this privacy policy occasionally. When we make significant changes, we'll let you know by updating this page and changing the "last updated" date at the top. For major changes, we'll give you additional notice.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          16. Marketing Communications
        </Typography>
        <Typography variant="body1" paragraph>
          We'll only send you marketing emails if you opt in. You can unsubscribe anytime by clicking the link in our emails or contacting us. Even if you opt out of marketing, we'll still send you important service updates about your account.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          17. Data Breach Notification
        </Typography>
        <Typography variant="body1" paragraph>
          If a data breach occurs that's likely to result in a risk to your rights and freedoms, we'll notify you without undue delay. We'll tell you what happened, what data was affected, and what steps we're taking to address it.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          18. Jurisdiction-Specific Rights
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>California Residents:</strong> You have additional rights under the California Consumer Privacy Act (CCPA), including the right to know what personal information we collect, the right to delete your information, and the right to opt-out of any "sales" of personal information (though we don't sell your data).
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>European Users:</strong> Under GDPR, you have the right to data portability, the right to restrict processing, and the right to lodge a complaint with your local data protection authority.
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Other Jurisdictions:</strong> You may have additional rights under your local laws. Contact us to learn more about exercising your rights.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          19. Data Minimization
        </Typography>
        <Typography variant="body1" paragraph>
          We believe in collecting only what we need. We don't collect personal information that isn't necessary for providing our Service, and we regularly review our data collection practices to ensure we're not keeping more than we need.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          20. Third-Party Service Providers
        </Typography>
        <Typography variant="body1" paragraph>
          Here are the main types of service providers we work with:
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Infrastructure:</strong> Cloud hosting providers (AWS, Google Cloud) for secure data storage and processing.
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>AI Services:</strong> Anthropic and other AI providers for natural language processing and insights generation.
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Authentication:</strong> Auth0 or similar services for secure login.
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Payment Processing:</strong> Stripe or similar PCI-compliant payment processors.
        </Typography>
        <Typography variant="body1" paragraph>
          All our service providers are contractually required to protect your data and use it only as we direct them.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          21. Contact Information
        </Typography>
        <Typography variant="body1" paragraph>
          Have questions about this privacy policy or how we handle your data? We're here to help! You can reach us at:
        </Typography>
        <Typography variant="body1" paragraph>
          Email: privacy@cultivatehq.com
        </Typography>
        <Typography variant="body1" paragraph>
          For data protection inquiries, you can also contact our Data Protection Officer at: dpo@cultivatehq.com
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