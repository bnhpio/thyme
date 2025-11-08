import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';

interface SupportEmailProps {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
}

export const SupportEmail = ({
  firstName,
  lastName,
  email,
  phone,
  message,
}: SupportEmailProps) => {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container className="bg-white mx-auto py-12 px-0 max-w-[600px]">
            <Section className="text-center mb-8">
              <div className="mb-5">
                <div className="inline-flex w-[60px] h-[60px] bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full items-center justify-center text-2xl font-bold">
                  💬
                </div>
              </div>
              <Heading className="text-gray-900 m-0 text-3xl font-bold">
                New Support Request
              </Heading>
            </Section>

            <Section className="px-5">
              <Text className="text-gray-600 leading-relaxed mb-6 text-base">
                You have received a new support request from the Thyme platform.
              </Text>

              <div className="bg-gray-50 border border-gray-200 p-5 rounded-lg mb-6">
                <Heading className="text-gray-900 mt-0 mb-4 text-lg font-bold">
                  Contact Information
                </Heading>
                <Text className="text-gray-600 leading-relaxed my-2 text-base">
                  <strong>Name:</strong> {firstName} {lastName}
                </Text>
                <Text className="text-gray-600 leading-relaxed my-2 text-base">
                  <strong>Email:</strong> {email}
                </Text>
                <Text className="text-gray-600 leading-relaxed my-2 text-base">
                  <strong>Phone:</strong> {phone}
                </Text>
              </div>

              <div className="bg-white border border-gray-200 p-5 rounded-lg mb-6">
                <Heading className="text-gray-900 mt-0 mb-4 text-lg font-bold">
                  Message
                </Heading>
                <Text className="text-gray-900 leading-relaxed m-0 text-base whitespace-pre-wrap">
                  {message}
                </Text>
              </div>
            </Section>

            <Hr className="border-gray-200 my-5" />

            <Section className="text-center pt-4">
              <Text className="text-gray-400 text-xs m-0">
                This email was sent from the Thyme support form.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default SupportEmail;
