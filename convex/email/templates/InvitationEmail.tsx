import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Section,
  Tailwind,
  Text,
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
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container className="bg-white mx-auto py-12 px-0 max-w-[600px]">
            <Section className="text-center mb-8">
              <div className="mb-6">
                <div className="inline-flex w-[64px] h-[64px] bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-lg items-center justify-center">
                  <div className="w-8 h-8 border-2 border-white rounded-sm" />
                </div>
              </div>
              <Heading className="text-gray-900 m-0 text-2xl font-semibold">
                Organization Invitation
              </Heading>
            </Section>

            <Section className="px-6">
              <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg mb-6">
                <Heading className="text-gray-900 mt-0 mb-4 text-xl font-semibold">
                  Join {organizationName}
                </Heading>
                <Text className="text-gray-700 leading-relaxed m-0 text-base">
                  <strong>{inviterName}</strong> has invited you to join{' '}
                  <strong>{organizationName}</strong> as a{' '}
                  <strong>{role}</strong>.
                </Text>
              </div>

              <div className="text-center my-8">
                <Button
                  className="bg-indigo-600 rounded-md text-white text-base font-semibold no-underline text-center inline-block py-3 px-8 border-none cursor-pointer"
                  href={inviteUrl}
                >
                  Accept Invitation
                </Button>
              </div>

              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded my-5">
                <Text className="text-amber-900 m-0 text-sm leading-relaxed">
                  <strong>Important:</strong> This invitation expires in 7 days.
                  If you do not wish to join, you can safely ignore this email.
                </Text>
              </div>

              <Hr className="border-gray-200 my-5" />

              <div className="mt-5">
                <Text className="text-gray-600 text-sm m-0 mb-2">
                  If the button above does not work, copy and paste this link
                  into your browser:
                </Text>
                <Text className="m-0">
                  <a
                    href={inviteUrl}
                    className="text-indigo-600 break-all no-underline"
                  >
                    {inviteUrl}
                  </a>
                </Text>
              </div>
            </Section>

            <Hr className="border-gray-200 my-6" />

            <Section className="text-center pt-4 px-6">
              <Text className="text-gray-500 text-xs m-0">
                This invitation was sent by {inviterName} from{' '}
                {organizationName}.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default InvitationEmail;
