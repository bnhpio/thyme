import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Section,
  Text,
} from '@react-email/components';
import React from 'react';

interface WelcomeEmailProps {
  organizationName: string;
  userName: string;
  role: string;
}

export const WelcomeEmail = ({
  organizationName,
  userName,
  role,
}: WelcomeEmailProps) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <div style={logoContainer}>
              <div style={logo}>✅</div>
            </div>
            <Heading style={title}>Welcome to {organizationName}!</Heading>
          </Section>

          <Section style={content}>
            <div style={successCard}>
              <Text style={successText}>
                🎉 You've successfully joined {organizationName} as a {role}!
              </Text>
            </div>

            <Text style={welcomeText}>
              Hi {userName},<br />
              <br />
              Welcome to the team! You now have access to all the organization's
              resources and can start collaborating with your new teammates.
            </Text>

            <div style={nextStepsCard}>
              <Heading style={nextStepsTitle}>What's next?</Heading>
              <ul style={nextStepsList}>
                <li style={listItem}>Explore the organization dashboard</li>
                <li style={listItem}>Connect with your team members</li>
                <li style={listItem}>
                  Check out available projects and resources
                </li>
              </ul>
            </div>
          </Section>

          <Hr style={divider} />

          <Section style={footer}>
            <Text style={footerText}>Welcome to {organizationName}!</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  textAlign: 'center' as const,
  marginBottom: '30px',
};

const logoContainer = {
  marginBottom: '20px',
};

const logo = {
  display: 'inline-flex',
  width: '60px',
  height: '60px',
  background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
  borderRadius: '50%',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '24px',
  fontWeight: 'bold',
};

const title = {
  color: '#333',
  margin: '0',
  fontSize: '28px',
  fontWeight: 'bold',
};

const content = {
  padding: '0 20px',
};

const successCard = {
  background: '#d4edda',
  border: '1px solid #c3e6cb',
  padding: '20px',
  borderRadius: '8px',
  marginBottom: '25px',
};

const successText = {
  color: '#155724',
  margin: '0',
  fontWeight: 'bold',
  fontSize: '16px',
};

const welcomeText = {
  color: '#666',
  lineHeight: '1.6',
  marginBottom: '25px',
  fontSize: '16px',
};

const nextStepsCard = {
  background: '#f8f9fa',
  padding: '20px',
  borderRadius: '8px',
  margin: '25px 0',
};

const nextStepsTitle = {
  color: '#333',
  marginTop: '0',
  marginBottom: '15px',
  fontSize: '18px',
  fontWeight: 'bold',
};

const nextStepsList = {
  color: '#666',
  lineHeight: '1.6',
  margin: '0',
  paddingLeft: '20px',
};

const listItem = {
  marginBottom: '8px',
  fontSize: '16px',
};

const divider = {
  borderColor: '#eee',
  margin: '20px 0',
};

const footer = {
  textAlign: 'center' as const,
  paddingTop: '15px',
};

const footerText = {
  color: '#999',
  fontSize: '12px',
  margin: '0',
};

export default WelcomeEmail;
