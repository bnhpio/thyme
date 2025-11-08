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
                Welcome to {organizationName}
              </Heading>
            </Section>

            <Section className="px-6">
              <div className="bg-indigo-50 border-l-4 border-indigo-600 p-5 rounded mb-6">
                <Text className="text-indigo-900 m-0 font-semibold text-base leading-relaxed">
                  You have successfully joined {organizationName} as a {role}.
                </Text>
              </div>

              <Text className="text-gray-700 leading-relaxed mb-6 text-base">
                Hi {userName},
              </Text>

              <Text className="text-gray-700 leading-relaxed mb-6 text-base">
                Welcome to the team. You now have access to all organization
                resources and can begin collaborating with your teammates.
              </Text>

              <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg my-6">
                <Heading className="text-gray-900 mt-0 mb-4 text-lg font-semibold">
                  Getting Started
                </Heading>
                <ul className="text-gray-700 leading-relaxed m-0 pl-5 space-y-2">
                  <li className="text-base">
                    Explore the organization dashboard
                  </li>
                  <li className="text-base">Connect with your team members</li>
                  <li className="text-base">
                    Review available projects and resources
                  </li>
                </ul>
              </div>
            </Section>

            <Hr className="border-gray-200 my-6" />

            <Section className="text-center pt-4 px-6">
              <Text className="text-gray-500 text-xs m-0">
                {organizationName}
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default WelcomeEmail;
