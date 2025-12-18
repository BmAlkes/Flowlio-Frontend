import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { Flex } from "@/components/ui/flex";
import { Stack } from "@/components/ui/stack";
import { Link } from "react-router";
import {
  Calendar,
  Clock,
  Users,
  CheckSquare,
  BarChart3,
  RefreshCw,
} from "lucide-react";

export const PurposeAndHowItWorks = () => {
  return (
    <Box
      className="w-full bg-gradient-to-b from-gray-100 to-white py-16 px-4"
      style={{
        listStyle: "none",
      }}
    >
      <Center className="max-w-6xl mx-auto">
        <Stack className="space-y-16">
          {/* Purpose Section */}
          <Box className="w-full">
            <Center className="text-center mb-8 flex-col">
              <Box className="max-sm:text-3xl text-gray-900 mb-3 text-5xl font-[100]">
                Purpose of{" "}
                <span className="text-[#F98618] font-semibold ">
                  Flowlio Application
                </span>
              </Box>
              <Box className="text-lg text-gray-600 max-w-3xl">
                Understanding what Flowlio does and why we need your data
              </Box>
            </Center>

            <Box className="bg-white rounded-xl shadow-lg p-8 max-sm:p-6 border border-gray-200">
              <Stack className="space-y-6">
                <Box className="text-base text-gray-700 leading-relaxed">
                  <strong className="text-gray-900">Flowlio</strong> is a
                  comprehensive work management and productivity platform
                  designed to help individuals, teams, and organizations
                  streamline their workflow processes. The primary purpose of
                  our application is to:
                </Box>

                <Box className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <Flex className="items-start gap-3 p-4 bg-blue-50 rounded-lg">
                    <CheckSquare className="text-[#1797B9] size-6 flex-shrink-0 mt-1" />
                    <Box>
                      <Box className="font-semibold text-gray-900 mb-1">
                        Task & Project Management
                      </Box>
                      <Box className="text-sm text-gray-700">
                        Enable users to create, manage, and track tasks and
                        projects in one centralized platform
                      </Box>
                    </Box>
                  </Flex>

                  <Flex className="items-start gap-3 p-4 bg-green-50 rounded-lg">
                    <Clock className="text-[#1797B9] size-6 flex-shrink-0 mt-1" />
                    <Box>
                      <Box className="font-semibold text-gray-900 mb-1">
                        Time Tracking
                      </Box>
                      <Box className="text-sm text-gray-700">
                        Provide time tracking capabilities to monitor work hours
                        and improve productivity
                      </Box>
                    </Box>
                  </Flex>

                  <Flex className="items-start gap-3 p-4 bg-purple-50 rounded-lg">
                    <RefreshCw className="text-[#1797B9] size-6 flex-shrink-0 mt-1" />
                    <Box>
                      <Box className="font-semibold text-gray-900 mb-1">
                        Calendar Synchronization
                      </Box>
                      <Box className="text-sm text-gray-700">
                        Offer bidirectional synchronization with Google Calendar
                        to keep events synchronized
                      </Box>
                    </Box>
                  </Flex>

                  <Flex className="items-start gap-3 p-4 bg-orange-50 rounded-lg">
                    <Users className="text-[#1797B9] size-6 flex-shrink-0 mt-1" />
                    <Box>
                      <Box className="font-semibold text-gray-900 mb-1">
                        Team Collaboration
                      </Box>
                      <Box className="text-sm text-gray-700">
                        Facilitate team collaboration through project
                        management, task assignment, and deadline tracking
                      </Box>
                    </Box>
                  </Flex>

                  <Flex className="items-start gap-3 p-4 bg-indigo-50 rounded-lg md:col-span-2">
                    <BarChart3 className="text-[#1797B9] size-6 flex-shrink-0 mt-1" />
                    <Box>
                      <Box className="font-semibold text-gray-900 mb-1">
                        AI-Enhanced Insights
                      </Box>
                      <Box className="text-sm text-gray-700">
                        Deliver AI-enhanced insights and recommendations to
                        optimize workflow efficiency
                      </Box>
                    </Box>
                  </Flex>
                </Box>

                <Box className="mt-6 p-5 bg-blue-50 rounded-lg border-l-4 border-[#1797B9]">
                  <Box className="text-sm text-gray-800 leading-relaxed">
                    <strong className="text-gray-900">
                      Google Calendar Integration Purpose:
                    </strong>{" "}
                    Flowlio requests access to your Google Calendar data
                    (events, dates, times, calendar metadata) exclusively to
                    provide bidirectional calendar synchronization. This
                    integration allows you to create calendar events in Flowlio
                    that automatically sync to your Google Calendar, and vice
                    versa, ensuring your schedule stays synchronized across both
                    platforms. We do not share, sell, or use your calendar data
                    for any purpose other than providing this synchronization
                    service.
                  </Box>
                </Box>

                <Box className="text-xs text-gray-500 mt-4 pt-4 border-t border-gray-200 text-center">
                  For detailed information about how we handle your data, please
                  review our{" "}
                  <Link
                    to="/privacy-policy"
                    className="text-[#1797B9] hover:underline font-medium"
                  >
                    Privacy Policy
                  </Link>
                  .
                </Box>
              </Stack>
            </Box>
          </Box>

          {/* How It Works Section */}
          <Box className="w-full">
            <Center className="flex-col text-center mb-8">
              <Box className="max-sm:text-3xl text-gray-900 mb-3 text-5xl font-[100] leading-tight">
                How{" "}
                <span className="text-[#F98618] font-semibold "> Flowlio</span>{" "}
                Works
              </Box>
              <Box className="text-lg text-gray-600 max-w-3xl">
                Simple steps to get started and maximize your productivity
              </Box>
            </Center>

            <Box className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Step 1 */}
              <Box className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                <Center className="mb-4">
                  <Box className="w-16 h-16 rounded-full bg-[#1797B9] text-white flex items-center justify-center text-2xl font-bold">
                    1
                  </Box>
                </Center>
                <Box className="text-center">
                  <Box className="text-xl font-semibold text-gray-900 mb-2">
                    Sign Up & Connect
                  </Box>
                  <Box className="text-sm text-gray-600 leading-relaxed">
                    Create your Flowlio account and connect your Google Calendar
                    for seamless synchronization. No credit card required to get
                    started.
                  </Box>
                </Box>
              </Box>

              {/* Step 2 */}
              <Box className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                <Center className="mb-4">
                  <Box className="w-16 h-16 rounded-full bg-[#1797B9] text-white flex items-center justify-center text-2xl font-bold">
                    2
                  </Box>
                </Center>
                <Box className="text-center">
                  <Box className="text-xl font-semibold text-gray-900 mb-2">
                    Create & Manage
                  </Box>
                  <Box className="text-sm text-gray-600 leading-relaxed">
                    Create tasks, projects, and calendar events. Flowlio
                    automatically syncs your events with Google Calendar in
                    real-time, keeping everything up to date.
                  </Box>
                </Box>
              </Box>

              {/* Step 3 */}
              <Box className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                <Center className="mb-4">
                  <Box className="w-16 h-16 rounded-full bg-[#1797B9] text-white flex items-center justify-center text-2xl font-bold">
                    3
                  </Box>
                </Center>
                <Box className="text-center">
                  <Box className="text-xl font-semibold text-gray-900 mb-2">
                    Track & Optimize
                  </Box>
                  <Box className="text-sm text-gray-600 leading-relaxed">
                    Track your time, monitor productivity, and get AI-powered
                    insights to optimize your workflow and achieve better
                    results.
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Additional Features */}
            <Box className="mt-12 bg-gradient-to-r from-[#1797B9] to-[#392AE2] rounded-xl p-8 text-white">
              <Center className="text-center mb-6">
                <Box className="text-2xl font-bold mb-2">
                  Key Features That Make Flowlio Powerful
                </Box>
              </Center>
              <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Box className="text-center">
                  <Calendar className="size-8 mx-auto mb-2" />
                  <Box className="font-semibold mb-1">Bidirectional Sync</Box>
                  <Box className="text-sm text-blue-100">
                    Events sync both ways between Flowlio and Google Calendar
                  </Box>
                </Box>
                <Box className="text-center">
                  <CheckSquare className="size-8 mx-auto mb-2" />
                  <Box className="font-semibold mb-1">Task Management</Box>
                  <Box className="text-sm text-blue-100">
                    Organize tasks with projects, deadlines, and priorities
                  </Box>
                </Box>
                <Box className="text-center">
                  <Clock className="size-8 mx-auto mb-2" />
                  <Box className="font-semibold mb-1">Time Tracking</Box>
                  <Box className="text-sm text-blue-100">
                    Monitor work hours and analyze productivity patterns
                  </Box>
                </Box>
                <Box className="text-center">
                  <BarChart3 className="size-8 mx-auto mb-2" />
                  <Box className="font-semibold mb-1">AI Insights</Box>
                  <Box className="text-sm text-blue-100">
                    Get smart recommendations to improve your workflow
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Stack>
      </Center>
    </Box>
  );
};
