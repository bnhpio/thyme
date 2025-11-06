import React from 'react';
import {
    Html,
    Head,
    Body,
    Container,
    Section,
    Text,
    Row,
    Column,
    Hr,
    Button,
    Heading,
} from '@react-email/components';

interface InvitationEmailProps {
    organizationName: string;
    inviterName: string;
    inviteUrl: string;
    role: string;
}

export const InvitationEmail = ({
    organizationName,
    inviterName,
    inviteUrl,
    role,
}: InvitationEmailProps) => {
    return (
        <Html>
            <Head />
            <Body style={main}>
                <Container style={container}>
                    <Section style={header}>
                        <div style={logoContainer}>
                            <div style={logo}>
                                👥
                            </div>
                        </div>
                        <Heading style={title}>You're Invited!</Heading>
                    </Section>

                    <Section style={content}>
                        <div style={inviteCard}>
                            <Heading style={orgTitle}>Join {organizationName}</Heading>
                            <Text style={inviteText}>
                                <strong>{inviterName}</strong> has invited you to join their organization as a <strong>{role}</strong>.
                            </Text>
                        </div>

                        <div style={buttonContainer}>
                            <Button style={button} href={inviteUrl}>
                                Join Organization
                            </Button>
                        </div>

                        <div style={warningBox}>
                            <Text style={warningText}>
                                <strong>⏰ This invitation expires in 7 days.</strong> If you don't want to join, you can safely ignore this email.
                            </Text>
                        </div>

                        <Hr style={divider} />

                        <div style={fallbackSection}>
                            <Text style={fallbackText}>
                                If the button doesn't work, copy and paste this link into your browser:
                            </Text>
                            <Text style={linkText}>
                                <a href={inviteUrl} style={link}>
                                    {inviteUrl}
                                </a>
                            </Text>
                        </div>
                    </Section>

                    <Section style={footer}>
                        <Text style={footerText}>
                            This invitation was sent by {inviterName} from {organizationName}.
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

// Styles
const main = {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
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
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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

const inviteCard = {
    background: '#f8f9fa',
    padding: '25px',
    borderRadius: '8px',
    marginBottom: '25px',
};

const orgTitle = {
    color: '#333',
    marginTop: '0',
    marginBottom: '15px',
    fontSize: '20px',
    fontWeight: 'bold',
};

const inviteText = {
    color: '#666',
    margin: '0',
    lineHeight: '1.6',
    fontSize: '16px',
};

const buttonContainer = {
    textAlign: 'center' as const,
    margin: '30px 0',
};

const button = {
    backgroundColor: '#667eea',
    borderRadius: '6px',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '15px 30px',
    border: 'none',
    cursor: 'pointer',
};

const warningBox = {
    background: '#fff3cd',
    border: '1px solid #ffeaa7',
    padding: '15px',
    borderRadius: '6px',
    margin: '20px 0',
};

const warningText = {
    color: '#856404',
    margin: '0',
    fontSize: '14px',
};

const divider = {
    borderColor: '#eee',
    margin: '20px 0',
};

const fallbackSection = {
    marginTop: '20px',
};

const fallbackText = {
    color: '#666',
    fontSize: '14px',
    margin: '0 0 10px 0',
};

const linkText = {
    margin: '0',
};

const link = {
    color: '#667eea',
    wordBreak: 'break-all' as const,
    textDecoration: 'none',
};

const footer = {
    borderTop: '1px solid #eee',
    paddingTop: '15px',
    marginTop: '30px',
    textAlign: 'center' as const,
};

const footerText = {
    color: '#999',
    fontSize: '12px',
    margin: '0',
};

export default InvitationEmail;
