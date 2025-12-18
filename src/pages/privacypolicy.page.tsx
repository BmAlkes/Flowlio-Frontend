import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Stack } from "@/components/ui/stack";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Navbar } from "@/components/user section/navbar/navbar";
import { useEffect } from "react";
import { Footer } from "@/components/footer/footer";

const PrivacyPolicyPage = () => {
  useEffect(() => {
    scrollTo(0, 0);
    document.title = "Privacy Policy - Flowlio";
  }, []);
  return (
    <>
      <Box className="min-h-screen bg-gradient-to-l from-indigo-50 via-slate-50 to-indigo-50">
        <Navbar />
        <Box className="max-w-4xl mx-auto py-8 px-4">
          <Card className="p-8 shadow-lg">
            <Stack className="space-y-6">
              {/* Header */}
              <Flex className="flex-col items-center text-center mb-8">
                <h1 className="text-3xl font-bold text-indigo-900 mb-2">
                  Privacy Policy
                </h1>
                <p className="text-gray-600">
                  Last updated: {new Date().toLocaleDateString()}
                </p>
              </Flex>

              <Separator />

              {/* Introduction */}
              <Box>
                <h2 className="text-xl font-semibold text-indigo-800 mb-4">
                  1. Introduction
                </h2>
                <Box className="text-gray-700 leading-relaxed">
                  Welcome to Flowlio ("we," "our," or "us"). This Privacy Policy
                  explains how we collect, use, disclose, and safeguard your
                  information when you use our project management and calendar
                  integration platform. Please read this privacy policy
                  carefully. If you do not agree with the terms of this privacy
                  policy, please do not access the site.
                </Box>
              </Box>

              {/* Information We Collect */}
              <Box>
                <h2 className="text-xl font-semibold text-indigo-800 mb-4">
                  2. Information We Collect
                </h2>

                <Box className="mb-4">
                  <h3 className="text-lg font-medium text-indigo-700 mb-2">
                    2.1 Personal Information
                  </h3>
                  <Box className="text-gray-700 leading-relaxed mb-2">
                    We may collect personal information that you provide
                    directly to us, including:
                  </Box>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li>Name and email address</li>
                    <li>Company and organization information</li>
                    <li>Profile information and preferences</li>
                    <li>Payment and billing information</li>
                    <li>Communication preferences</li>
                  </ul>
                </Box>

                <Box className="mb-4">
                  <h3 className="text-lg font-medium text-indigo-700 mb-2">
                    2.2 Google Calendar Integration
                  </h3>
                  <Box className="text-gray-700 leading-relaxed mb-2">
                    When you connect your Google Calendar, we collect:
                  </Box>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li>Calendar events and metadata</li>
                    <li>Calendar access permissions</li>
                    <li>Event creation, modification, and deletion data</li>
                    <li>Calendar synchronization data</li>
                  </ul>
                </Box>

                <Box className="mb-4">
                  <h3 className="text-lg font-medium text-indigo-700 mb-2">
                    2.3 Usage Information
                  </h3>
                  <Box className="text-gray-700 leading-relaxed">
                    We automatically collect certain information about your use
                    of our platform, including device information, IP address,
                    browser type, pages visited, and time spent on our platform.
                  </Box>
                </Box>
              </Box>

              {/* How We Use Information */}
              <Box>
                <h2 className="text-xl font-semibold text-indigo-800 mb-4">
                  3. How We Use Your Information
                </h2>
                <Box className="text-gray-700 leading-relaxed mb-2">
                  We use the information we collect to:
                </Box>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Provide and maintain our services</li>
                  <li>Process transactions and manage subscriptions</li>
                  <li>Sync calendar events between platforms</li>
                  <li>Send important updates and notifications</li>
                  <li>Improve our platform and user experience</li>
                  <li>Comply with legal obligations</li>
                  <li>Prevent fraud and ensure security</li>
                </ul>
              </Box>

              {/* Google Calendar Integration */}
              <Box>
                <h2 className="text-xl font-semibold text-indigo-800 mb-4">
                  4. Google Calendar Integration
                </h2>
                <Box className="text-gray-700 leading-relaxed mb-4">
                  Our platform integrates with Google Calendar to provide
                  seamless calendar management. This integration requires
                  specific permissions:
                </Box>

                <Box className="bg-blue-50 p-4 rounded-lg mb-4">
                  <Box className="text-blue-800 font-medium mb-2">
                    Required Google Calendar Permissions:
                  </Box>
                  <ul className="list-disc list-inside text-blue-700 space-y-1 ml-4">
                    <li>Read, create, update, and delete calendar events</li>
                    <li>Access calendar metadata and settings</li>
                    <li>Synchronize events between platforms</li>
                  </ul>
                </Box>

                <Box className="text-gray-700 leading-relaxed">
                  We only access the minimum permissions necessary to provide
                  our services. You can revoke these permissions at any time
                  through your Google Account settings.
                </Box>
              </Box>

              {/* Data Sharing */}
              <Box>
                <h2 className="text-xl font-semibold text-indigo-800 mb-4">
                  5. Information Sharing and Disclosure
                </h2>
                <Box className="text-gray-700 leading-relaxed mb-2">
                  We do not sell, trade, or otherwise transfer your personal
                  information to third parties, except in the following
                  circumstances:
                </Box>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>With your explicit consent</li>
                  <li>To comply with legal obligations</li>
                  <li>To protect our rights and prevent fraud</li>
                  <li>
                    With trusted service providers who assist in our operations
                  </li>
                  <li>In connection with a business transfer or acquisition</li>
                </ul>
              </Box>

              {/* Data Security */}
              <Box>
                <h2 className="text-xl font-semibold text-indigo-800 mb-4">
                  6. Data Security
                </h2>
                <Box className="text-gray-700 leading-relaxed">
                  We implement appropriate technical and organizational security
                  measures to protect your personal information against
                  unauthorized access, alteration, disclosure, or destruction.
                  This includes encryption, secure data transmission, and
                  regular security assessments.
                </Box>
              </Box>

              {/* Data Retention */}
              <Box>
                <h2 className="text-xl font-semibold text-indigo-800 mb-4">
                  7. Data Retention
                </h2>
                <Box className="text-gray-700 leading-relaxed">
                  We retain your personal information only for as long as
                  necessary to fulfill the purposes outlined in this Privacy
                  Policy, unless a longer retention period is required or
                  permitted by law.
                </Box>
              </Box>

              {/* Your Rights */}
              <Box>
                <h2 className="text-xl font-semibold text-indigo-800 mb-4">
                  8. Your Rights
                </h2>
                <Box className="text-gray-700 leading-relaxed mb-2">
                  You have the right to:
                </Box>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Access and update your personal information</li>
                  <li>Request deletion of your personal information</li>
                  <li>Opt-out of certain data processing activities</li>
                  <li>Request data portability</li>
                  <li>Withdraw consent for Google Calendar integration</li>
                  <li>File a complaint with relevant authorities</li>
                </ul>
              </Box>

              {/* Cookies */}
              <Box>
                <h2 className="text-xl font-semibold text-indigo-800 mb-4">
                  9. Cookies and Tracking Technologies
                </h2>
                <Box className="text-gray-700 leading-relaxed">
                  We use cookies and similar tracking technologies to enhance
                  your experience, analyze usage patterns, and provide
                  personalized content. You can control cookie preferences
                  through your browser settings.
                </Box>
              </Box>

              {/* Third-Party Services */}
              <Box>
                <h2 className="text-xl font-semibold text-indigo-800 mb-4">
                  10. Third-Party Services
                </h2>
                <Box className="text-gray-700 leading-relaxed">
                  Our platform integrates with third-party services including
                  Google Calendar, payment processors, and analytics providers.
                  These services have their own privacy policies, and we
                  encourage you to review them.
                </Box>
              </Box>

              {/* International Transfers */}
              <Box>
                <h2 className="text-xl font-semibold text-indigo-800 mb-4">
                  11. International Data Transfers
                </h2>
                <Box className="text-gray-700 leading-relaxed">
                  Your information may be transferred to and processed in
                  countries other than your country of residence. We ensure
                  appropriate safeguards are in place for such transfers.
                </Box>
              </Box>

              {/* Children's Privacy */}
              <Box>
                <h2 className="text-xl font-semibold text-indigo-800 mb-4">
                  12. Children's Privacy
                </h2>
                <Box className="text-gray-700 leading-relaxed">
                  Our services are not intended for children under 13 years of
                  age. We do not knowingly collect personal information from
                  children under 13.
                </Box>
              </Box>

              {/* Changes to Privacy Policy */}
              <Box>
                <h2 className="text-xl font-semibold text-indigo-800 mb-4">
                  13. Changes to This Privacy Policy
                </h2>
                <Box className="text-gray-700 leading-relaxed">
                  We may update this Privacy Policy from time to time. We will
                  notify you of any material changes by posting the new Privacy
                  Policy on this page and updating the "Last updated" date.
                </Box>
              </Box>

              {/* Contact Information */}
              <Box>
                <h2 className="text-xl font-semibold text-indigo-800 mb-4">
                  14. Contact Us
                </h2>
                <Box className="text-gray-700 leading-relaxed mb-2">
                  If you have any questions about this Privacy Policy or our
                  data practices, please contact us:
                </Box>
                <Box className="bg-gray-50 p-4 rounded-lg">
                  <Box className="text-gray-700">
                    <strong>Email:</strong> info@dotvizion.com
                    <br />
                    <strong>Address:</strong> Flowlio Privacy Team
                    <br />
                    <strong>Support:</strong> Available through our platform's
                    support system
                  </Box>
                </Box>
              </Box>

              <Separator />

              {/* Footer */}
              <Flex className="justify-center pt-4">
                <Box className="text-gray-500 text-sm">
                  © {new Date().getFullYear()} Flowlio. All rights reserved.
                </Box>
              </Flex>
            </Stack>
          </Card>
        </Box>
        <Footer />
      </Box>
    </>
  );
};

export default PrivacyPolicyPage;
