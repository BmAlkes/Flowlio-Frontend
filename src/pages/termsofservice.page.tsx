import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Stack } from "@/components/ui/stack";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useEffect } from "react";
import { Navbar } from "@/components/user section/navbar/navbar";

const TermsOfServicePage = () => {
  useEffect(() => {
    scrollTo(0, 0);
    document.title = "Terms of Service - Flowlio";
  }, []);
  return (
    <Box className="min-h-screen bg-gradient-to-l from-indigo-50 via-slate-50 to-indigo-50">
      <Navbar />
      <Box className="max-w-4xl mx-auto py-8 px-4">
        <Card className="p-8 shadow-lg">
          <Stack className="space-y-6">
            {/* Header */}
            <Flex className="flex-col items-center text-center mb-8">
              <h1 className="text-3xl font-bold text-indigo-900 mb-2">
                Terms of Service
              </h1>
              <p className="text-gray-600">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </Flex>

            <Separator />

            {/* Introduction */}
            <Box>
              <h2 className="text-xl font-semibold text-indigo-800 mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Welcome to Flowlio. These Terms of Service ("Terms") govern your
                use of our project management and calendar integration platform
                ("Service") operated by Flowlio ("us," "we," or "our"). By
                accessing or using our Service, you agree to be bound by these
                Terms.
              </p>
            </Box>

            {/* Service Description */}
            <Box>
              <h2 className="text-xl font-semibold text-indigo-800 mb-4">
                2. Service Description
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Flowlio is a comprehensive project management platform that
                provides:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Project and task management tools</li>
                <li>Calendar integration with Google Calendar</li>
                <li>Client management and invoicing</li>
                <li>Team collaboration features</li>
                <li>Time tracking and reporting</li>
                <li>Payment processing and subscription management</li>
              </ul>
            </Box>

            {/* User Accounts */}
            <Box>
              <h2 className="text-xl font-semibold text-indigo-800 mb-4">
                3. User Accounts
              </h2>

              <Box className="mb-4">
                <h2 className="text-lg font-semibold text-indigo-700 mb-2">
                  3.1 Account Creation
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  To use our Service, you must create an account. You are
                  responsible for maintaining the confidentiality of your
                  account credentials and for all activities that occur under
                  your account.
                </p>
              </Box>

              <Box className="mb-4">
                <h2 className="text-lg font-semibold text-indigo-700 mb-2">
                  3.2 Account Responsibilities
                </h2>
                <p className="text-gray-700 leading-relaxed mb-2">
                  You agree to:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Provide accurate and complete information</li>
                  <li>Update your information when necessary</li>
                  <li>Notify us immediately of any unauthorized use</li>
                  <li>Use the Service in compliance with applicable laws</li>
                </ul>
              </Box>
            </Box>

            {/* Google Calendar Integration */}
            <Box>
              <h2 className="text-xl font-semibold text-indigo-800 mb-4">
                4. Google Calendar Integration
              </h2>

              <Box className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="text-blue-800 font-medium mb-2">
                  Integration Terms:
                </p>
                <ul className="list-disc list-inside text-blue-700 space-y-1 ml-4">
                  <li>
                    You grant us permission to access your Google Calendar
                  </li>
                  <li>
                    We will sync events between our platform and Google Calendar
                  </li>
                  <li>
                    You can revoke access at any time through Google settings
                  </li>
                  <li>
                    We respect Google's Terms of Service and Privacy Policy
                  </li>
                </ul>
              </Box>

              <p className="text-gray-700 leading-relaxed">
                By connecting your Google Calendar, you acknowledge that you
                have read and agree to Google's Terms of Service and Privacy
                Policy. We are not responsible for any changes to Google's
                services that may affect our integration.
              </p>
            </Box>

            {/* Acceptable Use */}
            <Box>
              <h2 className="text-xl font-semibold text-indigo-800 mb-4">
                5. Acceptable Use Policy
              </h2>

              <Box className="mb-4">
                <h2 className="text-lg font-semibold text-indigo-700 mb-2">
                  5.1 Permitted Uses
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  You may use our Service for lawful business purposes,
                  including project management, team collaboration, and calendar
                  synchronization.
                </p>
              </Box>

              <Box className="mb-4">
                <h2 className="text-lg font-semibold text-indigo-700 mb-2">
                  5.2 Prohibited Uses
                </h2>
                <p className="text-gray-700 leading-relaxed mb-2">
                  You may not:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Use the Service for illegal or unauthorized purposes</li>
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe on intellectual property rights</li>
                  <li>Transmit harmful or malicious code</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Interfere with the Service's operation</li>
                  <li>Use the Service to spam or harass others</li>
                </ul>
              </Box>
            </Box>

            {/* Subscription and Payment */}
            <Box>
              <h2 className="text-xl font-semibold text-indigo-800 mb-4">
                6. Subscription and Payment Terms
              </h2>

              <Box className="mb-4">
                <h2 className="text-lg font-semibold text-indigo-700 mb-2">
                  6.1 Subscription Plans
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We offer various subscription plans with different features
                  and limitations. Subscription fees are billed in advance on a
                  monthly or annual basis.
                </p>
              </Box>

              <Box className="mb-4">
                <h2 className="text-lg font-semibold text-indigo-700 mb-2">
                  6.2 Payment Terms
                </h2>
                <p className="text-gray-700 leading-relaxed mb-2">
                  Payment terms include:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>All fees are non-refundable unless otherwise stated</li>
                  <li>Prices may change with 30 days' notice</li>
                  <li>Failed payments may result in service suspension</li>
                  <li>You are responsible for all applicable taxes</li>
                </ul>
              </Box>

              <Box className="mb-4">
                <h2 className="text-lg font-semibold text-indigo-700 mb-2">
                  6.3 Cancellation
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  You may cancel your subscription at any time. Cancellation
                  takes effect at the end of your current billing period. No
                  refunds are provided for partial periods.
                </p>
              </Box>
            </Box>

            {/* Intellectual Property */}
            <Box>
              <h2 className="text-xl font-semibold text-indigo-800 mb-4">
                7. Intellectual Property Rights
              </h2>

              <Box className="mb-4">
                <h2 className="text-lg font-semibold text-indigo-700 mb-2">
                  7.1 Our Content
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  The Service and its original content, features, and
                  functionality are owned by Flowlio and are protected by
                  international copyright, trademark, and other intellectual
                  property laws.
                </p>
              </Box>

              <Box className="mb-4">
                <h2 className="text-lg font-semibold text-indigo-700 mb-2">
                  7.2 Your Content
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  You retain ownership of your content. By using our Service,
                  you grant us a limited license to use, store, and process your
                  content to provide the Service.
                </p>
              </Box>
            </Box>

            {/* Privacy and Data */}
            <Box>
              <h2 className="text-xl font-semibold text-indigo-800 mb-4">
                8. Privacy and Data Protection
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Your privacy is important to us. Our collection and use of
                personal information is governed by our Privacy Policy, which is
                incorporated into these Terms by reference.
              </p>
            </Box>

            {/* Service Availability */}
            <Box>
              <h2 className="text-xl font-semibold text-indigo-800 mb-4">
                9. Service Availability
              </h2>
              <p className="text-gray-700 leading-relaxed">
                While we strive to maintain high service availability, we do not
                guarantee uninterrupted access. We may perform maintenance,
                updates, or modifications that temporarily affect service
                availability.
              </p>
            </Box>

            {/* Limitation of Liability */}
            <Box>
              <h2 className="text-xl font-semibold text-indigo-800 mb-4">
                10. Limitation of Liability
              </h2>
              <p className="text-gray-700 leading-relaxed">
                To the maximum extent permitted by law, Flowlio shall not be
                liable for any indirect, incidental, special, consequential, or
                punitive damages, including without limitation, loss of profits,
                data, use, goodwill, or other intangible losses resulting from
                your use of the Service.
              </p>
            </Box>

            {/* Indemnification */}
            <Box>
              <h2 className="text-xl font-semibold text-indigo-800 mb-4">
                11. Indemnification
              </h2>
              <p className="text-gray-700 leading-relaxed">
                You agree to defend, indemnify, and hold harmless Flowlio from
                and against any claims, damages, obligations, losses,
                liabilities, costs, or debt arising from your use of the Service
                or violation of these Terms.
              </p>
            </Box>

            {/* Termination */}
            <Box>
              <h2 className="text-xl font-semibold text-indigo-800 mb-4">
                12. Termination
              </h2>
              <p className="text-gray-700 leading-relaxed mb-2">
                We may terminate or suspend your account immediately, without
                prior notice, for any reason, including if you breach these
                Terms. Upon termination:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Your right to use the Service ceases immediately</li>
                <li>We may delete your account and data</li>
                <li>You remain liable for all amounts due</li>
              </ul>
            </Box>

            {/* Changes to Terms */}
            <Box>
              <h2 className="text-xl font-semibold text-indigo-800 mb-4">
                13. Changes to Terms
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify these Terms at any time. We will
                notify users of material changes via email or through the
                Service. Continued use of the Service after changes constitutes
                acceptance of the new Terms.
              </p>
            </Box>

            {/* Governing Law */}
            <Box>
              <h2 className="text-xl font-semibold text-indigo-800 mb-4">
                14. Governing Law
              </h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms shall be governed by and construed in accordance
                with applicable laws, without regard to conflict of law
                principles. Any disputes shall be resolved through binding
                arbitration.
              </p>
            </Box>

            {/* Contact Information */}
            <Box>
              <h2 className="text-xl font-semibold text-indigo-800 mb-4">
                15. Contact Information
              </h2>
              <p className="text-gray-700 leading-relaxed mb-2">
                If you have any questions about these Terms of Service, please
                contact us:
              </p>
              <Box className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> info@dotvizion.com
                  <br />
                  <strong>Address:</strong> Flowlio Legal Team
                  <br />
                  <strong>Support:</strong> Available through our platform's
                  support system
                </p>
              </Box>
            </Box>

            <Separator />

            {/* Footer */}
            <Flex className="justify-center pt-4">
              <p className="text-gray-500 text-sm">
                © {new Date().getFullYear()} Flowlio. All rights reserved.
              </p>
            </Flex>
          </Stack>
        </Card>
      </Box>
    </Box>
  );
};

export default TermsOfServicePage;
