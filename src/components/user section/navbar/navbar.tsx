import { Box } from "@/components/ui/box";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { AlignJustify, ArrowRight } from "lucide-react";
import { Flex } from "@/components/ui/flex";
import { Center } from "@/components/ui/center";
import { Link, useNavigate, useLocation } from "react-router";
import { cn } from "@/lib/utils";
import { FC, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { toast } from "sonner";

interface NavbarProps {
  isWorkflow?: boolean;
  isInsights?: boolean;
  isHome?: boolean;
  isPricing?: boolean;
  selectedPlan?: number | null;
}

export const Navbar: FC<NavbarProps> = ({
  isHome = false,
  isWorkflow = false,
  isInsights = false,
  isPricing = false,
  selectedPlan,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const navbarRef = useRef<HTMLDivElement>(null);

  const isHomePage = isHome || location.pathname === "/";
  const isWorkflowPage = isWorkflow || location.pathname === "/workflow";
  const isInsightsPage = isInsights || location.pathname === "/insights";
  const isPricingPage = isPricing || location.pathname === "/pricing";

  useEffect(() => {
    if (navbarRef.current && typeof gsap !== "undefined") {
      try {
        // Initial animation
        gsap.fromTo(
          navbarRef.current,
          {
            y: -100,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
          }
        );

        // Text animation for navigation items
        const navItems = navbarRef.current.querySelectorAll("a, button");
        if (navItems && navItems.length > 0) {
          gsap.fromTo(
            navItems,
            {
              y: 20,
              opacity: 0,
            },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              stagger: 0.1,
              ease: "back.out(1.7)",
              delay: 0.3,
            }
          );
        }

        // Logo animation
        const logo = navbarRef.current.querySelector("img");
        if (logo) {
          gsap.fromTo(
            logo,
            {
              scale: 0.8,
              rotation: -5,
              opacity: 0,
            },
            {
              scale: 1,
              rotation: 0,
              opacity: 1,
              duration: 1.2,
              ease: "elastic.out(1, 0.3)",
              delay: 0.1,
            }
          );
        }
      } catch (error) {
        // Silently fail if gsap animations fail - don't crash the component
        console.warn("Navbar animation error:", error);
      }
    }
  }, []);

  return (
    <Box
      ref={navbarRef}
      className={cn(
        "relative w-full z-40",
        isWorkflowPage && "bg-[#161616]",
        isInsightsPage && "bg-[#161616]"
      )}
    >
      {(isWorkflowPage || isInsightsPage) === true && (
        <Box className="w-full h-full bg-[url(/workflow/workflow-bg.svg)] bg-cover bg-center absolute top-0 left-0 -z-20 opacity-50"></Box>
      )}

      <Box className="absolute -z-10 top-0 -left-12 w-100 h-100 bg-[#2B2BA0]/30 blur-3xl opacity-20 " />
      <Box className="absolute max-sm:hidden -z-10 top-30 right-8 w-60 h-90 bg-[#2B2BA0]/40 blur-3xl opacity-20 " />

      <header className="flex h-20 w-full shrink-0 items-center px-5 md:px-32 md:py-12">
        <Flex className="justify-between w-full">
          <Flex>
            {(isWorkflowPage || isInsightsPage) === true ? (
              <Link to="/">
                <img
                  src="/logo/logowithtextwhitebg.svg"
                  alt="Logo"
                  className="h-56 w-38 cursor-pointer"
                />
              </Link>
            ) : (
              <Link to="/">
                <img
                  src="/logo/logowithtext.svg"
                  alt="Logo"
                  className="h-56 w-38 cursor-pointer"
                />
              </Link>
            )}
            <Link
              to="/workflow"
              className={cn(
                "group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-[16px] font-medium transition-colors hover:bg-gray-100 focus:bg-gray-100 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-none data-[state=open]:bg-none dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus:bg-gray-800 dark:focus:text-gray-50 dark:data-[active]:bg-gray-800/50 dark:data-[state=open]:bg-none max-lg:hidden hover:text-[#F98618]",
                isHomePage === true && "text-gray-500",
                isInsightsPage === true && "text-white",
                isWorkflowPage && "text-[#F98618]"
              )}
            >
              Work Flow
            </Link>
            <Link
              to="/insights"
              className={cn(
                "group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-[16px] font-medium transition-colors hover:bg-gray-100 hover:text-[#F98618] focus:bg-gray-100 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-none data-[state=open]:bg-none dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus:bg-gray-800 dark:focus:text-gray-50 dark:data-[active]:bg-gray-800/50 dark:data-[state=open]:bg-none max-lg:hidden",
                isHomePage === true && "text-gray-500",
                isWorkflowPage && "text-white",
                isInsightsPage === true && "text-[#F98618]"
              )}
            >
              Insights
            </Link>
          </Flex>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden">
                <AlignJustify className="h-16 w-16" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="px-6">
              <Flex className="items-start justify-between px-12">
                <Link to="/" className="mt-6 -ml-12">
                  <img
                    src="/logo/logowithtext.svg"
                    alt="Logo"
                    className="h-12 w-34"
                  />
                </Link>

                <div className="grid gap-2 py-6">
                  <Link
                    to="/"
                    className={cn(
                      "flex w-full items-center py-2 text-lg font-semibold",
                      isHomePage && "text-[#F98618]"
                    )}
                  >
                    Home
                  </Link>
                  <Link
                    to="/workflow"
                    className={cn(
                      "flex w-full items-center py-2 text-lg font-semibold",
                      isWorkflowPage && "text-[#F98618]"
                    )}
                  >
                    Work Flow
                  </Link>
                  <Link
                    to="/insights"
                    className={cn(
                      "flex w-full items-center py-2 text-lg font-semibold",
                      isInsightsPage && "text-[#F98618]"
                    )}
                  >
                    Insights
                  </Link>
                  <Link
                    to="/pricing"
                    className={cn(
                      "flex w-full items-center py-2 text-lg font-semibold",
                      isPricingPage && "text-[#F98618]"
                    )}
                  >
                    Price
                  </Link>
                  <Link
                    to="/auth/signin"
                    className="flex w-full items-center py-2 text-lg font-semibold"
                  >
                    Login
                  </Link>
                </div>
              </Flex>
            </SheetContent>
          </Sheet>
        </Flex>

        <Center className="ml-auto hidden lg:flex gap-3">
          <Link
            to="/pricing"
            onClick={() => navigate("/pricing")}
            className={cn(
              "group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-[16px] font-medium transition-colors hover:bg-gray-100 focus:bg-gray-100 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-none data-[state=open]:bg-none dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus:bg-gray-800 dark:focus:text-gray-50 dark:data-[active]:bg-gray-800/50 dark:data-[state=open]:bg-none max-lg:hidden hover:text-[#F98618]",
              isHomePage === true && "text-gray-500",
              isInsightsPage === true && "text-white",

              isWorkflowPage && "text-white"
            )}
          >
            Pricing
          </Link>
          <Box
            onClick={() => navigate("/auth/signin")}
            className={cn(
              "group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-[16px] font-medium transition-colors hover:bg-gray-100 focus:bg-gray-100 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-none data-[state=open]:bg-none dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus:bg-gray-800 dark:focus:text-gray-50 dark:data-[active]:bg-gray-800/50 dark:data-[state=open]:bg-none max-lg:hidden hover:text-[#F98618] cursor-pointer",
              isHomePage === true && "text-gray-500",
              isWorkflowPage && "text-white",
              isInsightsPage === true && "text-white"
            )}
          >
            Login
          </Box>

          <Button
            onClick={() => {
              if (isPricingPage) {
                if (selectedPlan == null) {
                  // On pricing page but no plan selected - show warning
                  toast.warning(
                    "Please select a plan first, then click 'Get Started' on the plan card."
                  );
                  // Stay on pricing page - user needs to select a plan
                  return;
                } else {
                  // Plan is selected on pricing page
                  // The pricing page's handleGetStarted will handle navigation
                  // This button should not be used when plan is selected
                  toast.info(
                    "Please click 'Get Started' on the selected plan card."
                  );
                  return;
                }
              } else {
                // For home page and other pages, always go to pricing first
                // User must select a plan before signing up
                navigate("/pricing");
              }
            }}
            className={cn(
              "p-2 h-11 w-34 rounded-3xl bg-[#1797B9] cursor-pointer hover:bg-[#1797B9]/80"
            )}
          >
            Get Started
            <ArrowRight />
          </Button>
        </Center>
      </header>
    </Box>
  );
};
