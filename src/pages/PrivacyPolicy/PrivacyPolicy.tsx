export default function PrivacyPolicy() {
  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-foreground text-4xl font-bold">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground text-sm">
              Last updated: {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
            <section className="space-y-4">
              <h2 className="text-foreground text-2xl font-semibold">
                1. Introduction
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Welcome to our Web3 automation platform. We are committed to
                protecting your privacy and ensuring the security of your
                personal information. This Privacy Policy explains how we
                collect, use, disclose, and safeguard your information when you
                use our service.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                By using our service, you agree to the collection and use of
                information in accordance with this policy. If you do not agree
                with our policies and practices, please do not use our service.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-foreground text-2xl font-semibold">
                2. Information We Collect
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-foreground text-xl font-semibold">
                    2.1 Authentication Information
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    When you sign in using third-party authentication providers
                    (such as GitHub), we collect the following information that
                    the provider shares with us:
                  </p>
                  <ul className="text-muted-foreground list-disc list-inside space-y-2 ml-4">
                    <li>Your name</li>
                    <li>Your email address</li>
                    <li>Your profile picture/avatar</li>
                    <li>Your unique identifier from the authentication provider</li>
                  </ul>
                  <p className="text-muted-foreground leading-relaxed mt-4">
                    We do not store your authentication provider credentials
                    (such as passwords or access tokens). Authentication is
                    handled securely through OAuth protocols.
                  </p>
                </div>

                <div>
                  <h3 className="text-foreground text-xl font-semibold">
                    2.2 Account and Profile Information
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    When you create an account or profile, we may collect:
                  </p>
                  <ul className="text-muted-foreground list-disc list-inside space-y-2 ml-4">
                    <li>Organization names and descriptions</li>
                    <li>User preferences (theme, language, notification settings)</li>
                    <li>Blockchain addresses and associated aliases</li>
                    <li>Chain/network preferences</li>
                    <li>API keys and custom tokens (encrypted)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-foreground text-xl font-semibold">
                    2.3 Usage and Technical Information
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We automatically collect certain information when you use our
                    service:
                  </p>
                  <ul className="text-muted-foreground list-disc list-inside space-y-2 ml-4">
                    <li>IP address and location data</li>
                    <li>Browser type and version</li>
                    <li>Device information</li>
                    <li>Usage patterns and interactions with our service</li>
                    <li>Log files and error reports</li>
                    <li>Task execution data and automation logs</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-foreground text-xl font-semibold">
                    2.4 Support and Communication Information
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    When you contact us for support, we collect:
                  </p>
                  <ul className="text-muted-foreground list-disc list-inside space-y-2 ml-4">
                    <li>Your name</li>
                    <li>Your email address</li>
                    <li>Your phone number (if provided)</li>
                    <li>Your message and any attachments</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-foreground text-xl font-semibold">
                    2.5 Payment and Billing Information
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    If you use paid features, our payment processor (Autumn)
                    collects billing information. We do not store your full
                    payment card details. Payment processing is handled by
                    third-party payment processors in accordance with their
                    privacy policies.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-foreground text-2xl font-semibold">
                3. How We Use Your Information
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We use the information we collect for the following purposes:
              </p>
              <ul className="text-muted-foreground list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Service Provision:</strong> To provide, maintain, and
                  improve our Web3 automation services
                </li>
                <li>
                  <strong>Authentication:</strong> To authenticate your identity
                  and manage your account access
                </li>
                <li>
                  <strong>Communication:</strong> To send you service-related
                  notifications, updates, and respond to your support requests
                </li>
                <li>
                  <strong>Organization Management:</strong> To manage
                  organizations, memberships, and invitations
                </li>
                <li>
                  <strong>Task Execution:</strong> To execute and monitor your
                  Web3 automation tasks and functions
                </li>
                <li>
                  <strong>Security:</strong> To detect, prevent, and address
                  security issues and fraudulent activity
                </li>
                <li>
                  <strong>Analytics:</strong> To analyze usage patterns and
                  improve our service
                </li>
                <li>
                  <strong>Legal Compliance:</strong> To comply with legal
                  obligations and enforce our terms of service
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-foreground text-2xl font-semibold">
                4. Information Sharing and Disclosure
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We do not sell your personal information. We may share your
                information in the following circumstances:
              </p>

              <div className="space-y-4">
                <div>
                  <h3 className="text-foreground text-xl font-semibold">
                    4.1 Service Providers
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We may share information with third-party service providers
                    who perform services on our behalf, including:
                  </p>
                  <ul className="text-muted-foreground list-disc list-inside space-y-2 ml-4">
                    <li>
                      <strong>Convex:</strong> Our backend infrastructure
                      provider for data storage and processing
                    </li>
                    <li>
                      <strong>Authentication Providers:</strong> GitHub and
                      other OAuth providers for authentication services
                    </li>
                    <li>
                      <strong>Email Services:</strong> Brevo (formerly Sendinblue)
                      for sending transactional and support emails
                    </li>
                    <li>
                      <strong>Payment Processors:</strong> Autumn for payment
                      processing and billing
                    </li>
                    <li>
                      <strong>Analytics Services:</strong> For understanding how
                      our service is used
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-foreground text-xl font-semibold">
                    4.2 Organization Members
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    When you join an organization, your name and email address
                    may be visible to other members of that organization. You
                    can control this through your organization settings.
                  </p>
                </div>

                <div>
                  <h3 className="text-foreground text-xl font-semibold">
                    4.3 Legal Requirements
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We may disclose your information if required by law, court
                    order, or government regulation, or if we believe disclosure
                    is necessary to protect our rights, your safety, or the
                    safety of others.
                  </p>
                </div>

                <div>
                  <h3 className="text-foreground text-xl font-semibold">
                    4.4 Business Transfers
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    In the event of a merger, acquisition, or sale of assets,
                    your information may be transferred to the acquiring entity.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-foreground text-2xl font-semibold">
                5. Data Security
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement appropriate technical and organizational measures to
                protect your personal information:
              </p>
              <ul className="text-muted-foreground list-disc list-inside space-y-2 ml-4">
                <li>Encryption of data in transit using TLS/SSL</li>
                <li>Encryption of sensitive data at rest</li>
                <li>Secure authentication using OAuth protocols</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication requirements</li>
                <li>Secure storage of API keys and tokens</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                However, no method of transmission over the Internet or
                electronic storage is 100% secure. While we strive to use
                commercially acceptable means to protect your information, we
                cannot guarantee absolute security.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-foreground text-2xl font-semibold">
                6. Your Rights and Choices
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Depending on your location, you may have certain rights regarding
                your personal information:
              </p>
              <ul className="text-muted-foreground list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Access:</strong> Request access to your personal
                  information
                </li>
                <li>
                  <strong>Correction:</strong> Request correction of inaccurate
                  or incomplete information
                </li>
                <li>
                  <strong>Deletion:</strong> Request deletion of your personal
                  information
                </li>
                <li>
                  <strong>Portability:</strong> Request transfer of your data to
                  another service
                </li>
                <li>
                  <strong>Objection:</strong> Object to processing of your
                  personal information
                </li>
                <li>
                  <strong>Withdrawal of Consent:</strong> Withdraw consent where
                  processing is based on consent
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                To exercise these rights, please contact us using the
                information provided in the Contact section below. We will
                respond to your request within a reasonable timeframe.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                You can also manage your information through your account
                settings, including updating your profile, managing organization
                memberships, and adjusting your preferences.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-foreground text-2xl font-semibold">
                7. Data Retention
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We retain your personal information for as long as necessary to
                provide our services and fulfill the purposes described in this
                policy, unless a longer retention period is required or
                permitted by law. When you delete your account, we will delete
                or anonymize your personal information, except where we are
                required to retain it for legal, regulatory, or legitimate
                business purposes.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-foreground text-2xl font-semibold">
                8. Cookies and Tracking Technologies
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We use cookies and similar tracking technologies to track
                activity on our service and store certain information. Cookies
                are files with a small amount of data that may include an
                anonymous unique identifier.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                You can instruct your browser to refuse all cookies or to
                indicate when a cookie is being sent. However, if you do not
                accept cookies, you may not be able to use some portions of our
                service.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-foreground text-2xl font-semibold">
                9. Third-Party Services
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Our service contains links to and integrates with third-party
                services. We are not responsible for the privacy practices of
                these third parties. We encourage you to review their privacy
                policies:
              </p>
              <ul className="text-muted-foreground list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>GitHub:</strong>{' '}
                  <a
                    href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    GitHub Privacy Statement
                  </a>
                </li>
                <li>
                  <strong>Convex:</strong>{' '}
                  <a
                    href="https://www.convex.dev/legal/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    Convex Privacy Policy
                  </a>
                </li>
                <li>
                  <strong>Autumn:</strong> Please refer to Autumn's privacy
                  policy for payment processing information
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-foreground text-2xl font-semibold">
                10. Children's Privacy
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Our service is not intended for children under the age of 13 (or
                the applicable age of consent in your jurisdiction). We do not
                knowingly collect personal information from children. If you are
                a parent or guardian and believe your child has provided us with
                personal information, please contact us immediately.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-foreground text-2xl font-semibold">
                11. International Data Transfers
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Your information may be transferred to and processed in countries
                other than your country of residence. These countries may have
                data protection laws that differ from those in your country. By
                using our service, you consent to the transfer of your
                information to these countries.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-foreground text-2xl font-semibold">
                12. Changes to This Privacy Policy
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will
                notify you of any changes by posting the new Privacy Policy on
                this page and updating the "Last updated" date. You are advised
                to review this Privacy Policy periodically for any changes.
                Changes to this Privacy Policy are effective when they are posted
                on this page.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-foreground text-2xl font-semibold">
                13. Contact Us
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about this Privacy Policy or our
                privacy practices, please contact us:
              </p>
              <ul className="text-muted-foreground list-none space-y-2 ml-4">
                <li>
                  <strong>Email:</strong>{' '}
                  <a
                    href="/support"
                    className="text-primary underline"
                  >
                    Contact Support
                  </a>
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                For users in the European Economic Area (EEA), you also have the
                right to lodge a complaint with your local data protection
                authority if you believe we have not addressed your concerns.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
