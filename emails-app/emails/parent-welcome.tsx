import {
  Body,
  Button,
  Column,
  Container,
  Font,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from 'react-email';

// Brand tokens (Magnolia Education Design System / tokens/colors.css)
const navy = '#3D4466';
const navyDeep = '#2A2D40';
const coral = '#E8836A';
const coralPale = '#FDF0EC';
const cream = '#FBF8F2';
const ink = '#2A2A2A';
const inkSoft = '#5A5A6A';
const inkFaint = '#8C8C99';

// Web-safe stacks per spec: Cormorant Garamond -> Georgia, DM Sans -> system-ui.
// The <Font> web fonts below upgrade Apple Mail; Gmail and Outlook use the fallbacks.
const serif = "'Cormorant Garamond', Georgia, 'Times New Roman', serif";
const sans = "'DM Sans', system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif";

/** Use as the email subject when sending via Resend. */
export const parentWelcomeSubject = 'Welcome to Magnolia Education!';

export interface ParentWelcomeEmailProps {
  /** {{parent_name}} */
  parentName: string;
  /** {{student_name}} */
  studentName: string;
  /** {{first_session_date}} */
  firstSessionDate: string;
  /** {{first_session_time}} */
  firstSessionTime: string;
  /** {{tutor_name}} */
  tutorName: string;
  /** {{bitpaper_video_link}} — shown verbatim as the link text, per the design */
  bitpaperVideoLink: string;
  /** {{policies_link}} — shown verbatim as the link text, per the design */
  policiesLink: string;
  /** {{calendly_link}} — the "Book a call" CTA */
  calendlyLink: string;
  /** {{unsubscribe_link}} */
  unsubscribeLink: string;
  /** Absolute base URL for images when sending via Resend; '' serves /static in the dev preview */
  assetsBaseUrl?: string;
}

export const ParentWelcomeEmail = ({
  parentName = 'Sarah',
  studentName = 'Dylan',
  firstSessionDate = 'Tuesday, June 16',
  firstSessionTime = '4:30 PM EST',
  tutorName = 'Rachit',
  bitpaperVideoLink = 'https://youtu.be/bitpaper-intro',
  policiesLink = 'https://magnolia-education.com/policies',
  calendlyLink = 'https://calendly.com/hello-magnolia-education/30min',
  unsubscribeLink = '#',
  assetsBaseUrl = '',
}: ParentWelcomeEmailProps) => (
  <Html lang="en">
    <Head>
      <Font
        fontFamily="Cormorant Garamond"
        fallbackFontFamily="Georgia"
        webFont={{
          url: 'https://fonts.gstatic.com/s/cormorantgaramond/v21/co3umX5slCNuHLi8bLeY9MK7whWMhyjypVO7abI26QOD_s06KnTOig.woff2',
          format: 'woff2',
        }}
        fontWeight={500}
        fontStyle="normal"
      />
      <Font
        fontFamily="Cormorant Garamond"
        fallbackFontFamily="Georgia"
        webFont={{
          url: 'https://fonts.gstatic.com/s/cormorantgaramond/v21/co3smX5slCNuHLi8bLeY9MK7whWMhyjYrGFEsdtdc62E6zd5wDD-iNM8.woff2',
          format: 'woff2',
        }}
        fontWeight={500}
        fontStyle="italic"
      />
      <Font
        fontFamily="DM Sans"
        fallbackFontFamily="Helvetica"
        webFont={{
          url: 'https://fonts.gstatic.com/s/dmsans/v17/rP2Yp2ywxg089UriI5-g4vlH9VoD8Cmcqbu0-K4.woff2',
          format: 'woff2',
        }}
        fontWeight={400}
        fontStyle="normal"
      />
    </Head>
    <Preview>
      We&apos;re thrilled to be part of {studentName}&apos;s math journey.
    </Preview>
    <Body style={page}>
      <Container style={{ maxWidth: '600px' }}>
        {/* Email container */}
        <Section style={card}>
          {/* Logo */}
          <Section style={{ padding: '44px 48px 8px' }}>
            <Img
              src={`${assetsBaseUrl}/static/magnolia-flower.png`}
              width="48"
              height="48"
              alt="Magnolia Education"
              style={{ display: 'block', margin: '0 auto' }}
            />
          </Section>
          <Text style={wordmark}>Magnolia Education</Text>

          {/* Main heading */}
          <Heading as="h1" style={mainHeading}>
            Welcome to the{' '}
            <em style={coralItalic}>Magnolia family!</em>
          </Heading>

          {/* Intro */}
          <Section style={bodyBlock}>
            <Text style={paragraph}>Hi {parentName},</Text>
            <Text style={paragraph}>
              We&apos;re thrilled to be part of {studentName}&apos;s math
              journey.
            </Text>
            <Text style={paragraph}>
              My goal with every student is to build the skills of an
              independent learner: how to prepare, how to use a resource
              effectively, and how to turn confusion and anxiety into a
              confident &ldquo;I don&apos;t know&rdquo; or a curious question.
              Beyond improving grades, these skills build confidence and
              resilience, with the hope that over time, our support becomes
              less needed.
            </Text>
          </Section>

          {/* Section: Your first session */}
          <Heading as="h2" style={sectionHeading}>
            Your first session
          </Heading>
          <Section style={sectionBody}>
            <Text style={paragraph}>
              {studentName}&apos;s first session is scheduled for{' '}
              <strong style={emphasis}>{firstSessionDate}</strong> at{' '}
              <strong style={emphasis}>{firstSessionTime}</strong> with{' '}
              <strong style={emphasis}>{tutorName}</strong>. The first session
              is an introduction to the humans and the tools, with minimal
              math.
            </Text>
          </Section>

          {/* Section: Getting set up */}
          <Heading as="h2" style={sectionHeading}>
            Getting set up{' '}
            <em style={coralItalic}>(parents often help with this part!)</em>
          </Heading>
          <Section style={sectionBody}>
            <Text style={{ ...paragraph, margin: '0 0 8px' }}>
              {studentName} will also receive these instructions directly, but
              here&apos;s what needs to happen before the first session:
            </Text>
          </Section>
          <Section style={{ padding: '6px 48px 0' }}>
            <Row>
              <Column style={listNumberCell}>
                <Text style={listNumber}>1.</Text>
              </Column>
              <Column style={listTextCell}>
                <Text style={listText}>
                  Make sure Zoom loads on the computer. Download the app
                  beforehand if needed.
                </Text>
              </Column>
            </Row>
            <Row>
              <Column style={listNumberCell}>
                <Text style={listNumber}>2.</Text>
              </Column>
              <Column style={listTextCell}>
                <Text style={listText}>
                  Make sure Bitpaper loads on the iPad or tablet. It&apos;s
                  just a web link that opens in Safari or Chrome. Here&apos;s a
                  quick intro video:{' '}
                  <Link href={bitpaperVideoLink} style={inlineLink}>
                    {bitpaperVideoLink}
                  </Link>
                </Text>
              </Column>
            </Row>
            <Row>
              <Column style={listNumberCell}>
                <Text style={listNumber}>3.</Text>
              </Column>
              <Column style={listTextCell}>
                <Text style={listText}>
                  Send over any homework {studentName} has been working on, or
                  anything they&apos;d like to work on. If they just finished a
                  unit, let us know what&apos;s coming next in the course if
                  the teacher shared an outline. No worries if not!
                </Text>
              </Column>
            </Row>
          </Section>

          {/* Section: How billing works */}
          <Heading as="h2" style={sectionHeading}>
            How billing works
          </Heading>
          <Section style={sectionBody}>
            <Text style={paragraph}>
              Invoices are sent in advance at the start of each month, based on
              the number of sessions scheduled that month. Payment can be made
              by e-transfer to{' '}
              <Link href="mailto:hello@magnolia-education.com" style={inlineLink}>
                hello@magnolia-education.com
              </Link>{' '}
              or by credit card (a processing fee applies to credit card
              payments). Any schedule changes are automatically adjusted on the
              following month&apos;s invoice.
            </Text>
          </Section>

          {/* Section: Our policies at a glance (coral-pale block) */}
          <Section style={{ padding: '14px 36px 0' }}>
            <Section style={policiesBlock}>
              <Text style={policiesEyebrow}>Our policies at a glance</Text>
              <Text style={policiesText}>
                Every session is a trial: you can cancel anytime and receive a
                refund for prepaid sessions. To keep your slot, we ask for a
                weekly commitment during the school year. Makeup sessions
                require 24 hours notice and expire at the end of the semester.
                Full policy details:{' '}
                <Link href={policiesLink} style={inlineLink}>
                  {policiesLink}
                </Link>
              </Text>
            </Section>
          </Section>

          {/* Section: Student Hub */}
          <Heading as="h2" style={{ ...sectionHeading, padding: '26px 48px 0' }}>
            Student Hub
          </Heading>
          <Section style={sectionBody}>
            <Text style={paragraph}>
              {studentName} will receive separate login details for the
              Magnolia Student Hub, where they can see their schedule, access
              their boards, and submit homework.
            </Text>
            <Text style={{ ...paragraph, margin: '0 0 6px' }}>
              Questions? Reply to this email anytime, or book a call with me
              directly:
            </Text>
          </Section>

          {/* CTA */}
          <Section style={{ padding: '12px 48px 6px' }}>
            <Button href={calendlyLink} style={ctaButton}>
              Book a call
            </Button>
          </Section>

          {/* Sign-off */}
          <Section style={{ padding: '22px 48px 44px' }}>
            <Text style={{ ...paragraph, margin: '0 0 14px' }}>
              Looking forward to getting started!
            </Text>
            <Text style={signature}>Rachit</Text>
            <Text style={pronunciation}>(Rutch like Dutch + it)</Text>
            <Text style={signCompany}>Magnolia Education</Text>
          </Section>
        </Section>

        {/* Footer */}
        <Section style={footer}>
          <Text style={footPrimary}>Magnolia Education &middot; Toronto, ON</Text>
          <Text style={footSecondary}>
            You&apos;re receiving this because {studentName} is starting with
            us.
            <br />
            <Link href={unsubscribeLink} style={footLink}>
              Unsubscribe
            </Link>
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

ParentWelcomeEmail.PreviewProps = {
  parentName: 'Sarah',
  studentName: 'Dylan',
  firstSessionDate: 'Tuesday, June 16',
  firstSessionTime: '4:30 PM EST',
  tutorName: 'Rachit',
  bitpaperVideoLink: 'https://youtu.be/bitpaper-intro',
  policiesLink: 'https://magnolia-education.com/policies',
  calendlyLink: 'https://calendly.com/hello-magnolia-education/30min',
  unsubscribeLink: '#',
} satisfies ParentWelcomeEmailProps;

export default ParentWelcomeEmail;

const page = {
  backgroundColor: cream,
  fontFamily: sans,
  margin: 0,
  padding: '40px 16px 56px',
};

const card = {
  backgroundColor: '#FFFFFF',
  borderRadius: '12px',
};

const wordmark = {
  color: navy,
  fontFamily: serif,
  fontSize: '19px',
  fontWeight: 500,
  letterSpacing: '0.4px',
  margin: 0,
  padding: '0 48px 28px',
  textAlign: 'center' as const,
};

const mainHeading = {
  color: navy,
  fontFamily: serif,
  fontSize: '32px',
  fontWeight: 500,
  lineHeight: '1.2',
  margin: 0,
  padding: '0 48px 24px',
  textAlign: 'center' as const,
};

const coralItalic = {
  color: coral,
  fontStyle: 'italic' as const,
};

const bodyBlock = {
  padding: '0 48px',
};

const paragraph = {
  color: ink,
  fontSize: '16px',
  lineHeight: '1.7',
  margin: '0 0 18px',
};

const sectionHeading = {
  color: navy,
  fontFamily: serif,
  fontSize: '22px',
  fontWeight: 500,
  lineHeight: '1.25',
  margin: 0,
  padding: '18px 48px 0',
};

const sectionBody = {
  padding: '12px 48px 0',
};

const emphasis = {
  color: navy,
  fontWeight: 600,
};

const inlineLink = {
  color: coral,
  fontWeight: 500,
  textDecoration: 'underline',
};

const listNumberCell = {
  verticalAlign: 'top' as const,
  width: '30px',
};

const listNumber = {
  color: coral,
  fontFamily: serif,
  fontSize: '20px',
  fontWeight: 600,
  lineHeight: '1.3',
  margin: 0,
  padding: '6px 0 0',
};

const listTextCell = {
  verticalAlign: 'top' as const,
};

const listText = {
  color: ink,
  fontSize: '16px',
  lineHeight: '1.7',
  margin: 0,
  padding: '6px 0 10px',
};

const policiesBlock = {
  backgroundColor: coralPale,
  borderRadius: '12px',
};

const policiesEyebrow = {
  color: coral,
  fontSize: '12px',
  fontWeight: 600,
  letterSpacing: '1.9px',
  margin: 0,
  padding: '24px 28px 4px',
  textTransform: 'uppercase' as const,
};

const policiesText = {
  color: ink,
  fontSize: '16px',
  lineHeight: '1.7',
  margin: 0,
  padding: '10px 28px 24px',
};

const ctaButton = {
  backgroundColor: coral,
  borderRadius: '8px',
  color: '#FFFFFF',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: 600,
  padding: '14px 30px',
  textDecoration: 'none',
};

const signature = {
  color: navy,
  fontFamily: serif,
  fontSize: '24px',
  fontStyle: 'italic' as const,
  fontWeight: 500,
  margin: 0,
};

const pronunciation = {
  color: inkFaint,
  fontSize: '13px',
  fontStyle: 'italic' as const,
  margin: '2px 0 0',
};

const signCompany = {
  color: inkSoft,
  fontSize: '14px',
  margin: '8px 0 0',
};

const footer = {
  backgroundColor: navyDeep,
  borderRadius: '12px',
  marginTop: '16px',
  padding: '26px 48px 24px',
};

const footPrimary = {
  color: 'rgba(255,255,255,0.72)',
  fontSize: '13px',
  lineHeight: '1.6',
  margin: 0,
  textAlign: 'center' as const,
};

const footSecondary = {
  color: 'rgba(255,255,255,0.45)',
  fontSize: '12px',
  lineHeight: '1.6',
  margin: '8px 0 0',
  textAlign: 'center' as const,
};

const footLink = {
  color: 'rgba(255,255,255,0.7)',
  textDecoration: 'underline',
};
