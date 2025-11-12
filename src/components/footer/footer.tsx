import { Box } from "../ui/box";
import { Center } from "../ui/center";
import { Flex } from "../ui/flex";
import Logo from "/logo/5000x5000-3.svg";
import { FiGlobe } from "react-icons/fi";
import { Link } from "react-router";

const FooterLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => (
  <a
    href={href}
    className="text-gray-400 hover:text-white transition-colors duration-300"
  >
    {children}
  </a>
);

export const Footer = () => {
  return (
    <>
      <Box className="bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
        <Flex className="container mx-auto max-w-5xl justify-between items-start flex-wrap gap-8">
          {/* Column 1: Logo, text, and language */}
          <Center className="w-full md:w-1/4  items-start flex-col">
            <img src={Logo} alt="Flowlio" className="h-18 w-auto mb-4" />
            <p className="text-gray-400 mb-6 text-sm">
              Streamline your project management with Flowlio's powerful tools
              for task management, calendar integration, and team collaboration.
            </p>
            <Flex className="items-center text-gray-400 cursor-pointer hover:text-white transition-colors duration-300">
              <FiGlobe className="mr-2" />
              <span>English</span>
            </Flex>
          </Center>

          {/* Column 2: Quick Links */}
          <Center className="w-full sm:w-1/2 md:w-auto max-sm:items-center flex-col">
            <h3 className="font-semibold text-cyan-400 mb-4">Quick Links</h3>
            <Flex className="flex-col space-y-2">
              <FooterLink href="#">Features</FooterLink>
              <FooterLink href="#">How It Works</FooterLink>
              <FooterLink href="#">Use Cases</FooterLink>
              <FooterLink href="#">Integrations</FooterLink>
              <FooterLink href="#">Pricing</FooterLink>
            </Flex>
          </Center>

          {/* Column 3: Support */}
          <Center className="w-full sm:w-1/2 md:w-auto max-sm:items-center flex-col">
            <h3 className="font-semibold text-cyan-400 mb-4">Support</h3>
            <Flex className="flex-col space-y-2">
              <FooterLink href="#">HelpCenter</FooterLink>
              <FooterLink href="#">Community</FooterLink>
              <FooterLink href="#">Blog</FooterLink>
            </Flex>
          </Center>

          {/* Column 4: Stay in Touch */}
          <Center className="w-full sm:w-1/2 md:w-auto items-start flex-col max-sm:items-center">
            <h3 className="font-semibold text-cyan-400 mb-4">Stay in Touch</h3>
            <Flex className="flex-col space-y-2 text-gray-400 items-start max-sm:items-center">
              <span>support@flowlio.com</span>
              <span>Available 24/7 through our platform</span>
            </Flex>
          </Center>
        </Flex>
      </Box>
      <Box className="bg-[#3F3F3F] text-white py-4 px-4 sm:px-6 lg:px-8">
        <Flex className="container mx-auto max-w-5xl justify-between items-start flex-wrap gap-8">
          <span>© 2025 Flowlio. All rights reserved.</span>
          <Flex className="text-white space-x-4 items-center">
            <Link
              to="/privacy-policy"
              className="text-gray-400 hover:text-white transition-colors duration-300"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms-of-service"
              className="text-gray-400 hover:text-white transition-colors duration-300"
            >
              Terms of Service
            </Link>
            <span className="text-gray-400">Cookie Settings</span>
          </Flex>
        </Flex>
      </Box>
    </>
  );
};
