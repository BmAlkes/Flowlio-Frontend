import { Box } from "@/components/ui/box";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { AlignJustify, ArrowRight, Globe, ChevronDown, Check } from "lucide-react";
import { Flex } from "@/components/ui/flex";
import { Center } from "@/components/ui/center";
import { Link, useNavigate, useLocation } from "react-router";
import { cn } from "@/lib/utils";
import { FC, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  isWorkflow?: boolean;
  isInsights?: boolean;
  isHome?: boolean;
  isPricing?: boolean;
  selectedPlan?: number | null;
}

const langPages = [
  { code: "EN", lang: "English",   native: "What is Flowlio?", path: "/what-is-flowlio" },
  { code: "PT", lang: "Português", native: "O que é Flowlio?", path: "/o-que-e-flowlio" },
  { code: "HE", lang: "עברית",     native: "מה זה Flowlio?",   path: "/mah-ze-flowlio"  },
  { code: "ES", lang: "Español",   native: "¿Qué es Flowlio?", path: "/que-es-flowlio"  },
];

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

  const isHomePage     = isHome     || location.pathname === "/";
  const isWorkflowPage = isWorkflow || location.pathname === "/workflow";
  const isInsightsPage = isInsights || location.pathname === "/insights";
  const isPricingPage  = isPricing  || location.pathname === "/pricing";
  const isShowcasePage = location.pathname === "/showcase";
  const isBlogPage     = location.pathname.startsWith("/blog");
  const activeLang     = langPages.find((l) => l.path === location.pathname);

  useEffect(() => {
    if (navbarRef.current && typeof gsap !== "undefined") {
      try {
        gsap.fromTo(
          navbarRef.current,
          { y: -100, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
        );

        const navItems = navbarRef.current.querySelectorAll("a, button");
        if (navItems && navItems.length > 0) {
          gsap.fromTo(
            navItems,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "back.out(1.7)", delay: 0.3 }
          );
        }

        const logo = navbarRef.current.querySelector("img");
        if (logo) {
          gsap.fromTo(
            logo,
            { scale: 0.8, rotation: -5, opacity: 0 },
            { scale: 1, rotation: 0, opacity: 1, duration: 1.2, ease: "elastic.out(1, 0.3)", delay: 0.1 }
          );
        }
      } catch (error) {
        console.warn("Navbar animation error:", error);
      }
    }
  }, []);

  /* ── Shared lang dropdown trigger label ── */
  const langTriggerLabel = activeLang ? activeLang.code : null;

  return (
    <Box
      ref={navbarRef}
      className={cn(
        "relative w-full z-40",
        isWorkflowPage && "bg-[#161616]",
        isInsightsPage && "bg-[#161616]"
      )}
    >
      {(isWorkflowPage || isInsightsPage) && (
        <Box className="w-full h-full bg-[url(/workflow/workflow-bg.svg)] bg-cover bg-center absolute top-0 left-0 -z-20 opacity-50" />
      )}

      <Box className="absolute -z-10 top-0 -left-12 w-100 h-100 bg-[#2B2BA0]/30 blur-3xl opacity-20" />
      <Box className="absolute max-sm:hidden -z-10 top-30 right-8 w-60 h-90 bg-[#2B2BA0]/40 blur-3xl opacity-20" />

      <header className="flex h-20 w-full shrink-0 items-center px-5 md:px-32 md:py-12">
        <Flex className="justify-between w-full">

          {/* ── Left: logo + nav links ── */}
          <Flex>
            {(isWorkflowPage || isInsightsPage) ? (
              <Link to="/"><img src="/logo/logowithtextwhitebg.svg" alt="Logo" className="h-56 w-38 cursor-pointer" /></Link>
            ) : (
              <Link to="/"><img src="/logo/logowithtext.svg" alt="Logo" className="h-56 w-38 cursor-pointer" /></Link>
            )}

            <Link
              to="/workflow"
              className={cn(
                "group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-[16px] font-medium transition-colors hover:bg-muted focus:bg-muted focus:outline-none disabled:pointer-events-none max-lg:hidden hover:text-[#F98618]",
                isHomePage     && "text-muted-foreground",
                isInsightsPage && "text-white",
                isWorkflowPage && "text-[#F98618]"
              )}
            >
              Work Flow
            </Link>

            <Link
              to="/insights"
              className={cn(
                "group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-[16px] font-medium transition-colors hover:bg-muted hover:text-[#F98618] focus:bg-muted focus:outline-none disabled:pointer-events-none max-lg:hidden",
                isHomePage     && "text-muted-foreground",
                isWorkflowPage && "text-white",
                isInsightsPage && "text-[#F98618]"
              )}
            >
              Insights
            </Link>

            <Link
              to="/showcase"
              className={cn(
                "group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-[16px] font-medium transition-colors hover:bg-muted hover:text-[#F98618] focus:bg-muted focus:outline-none disabled:pointer-events-none max-lg:hidden",
                isHomePage     && "text-muted-foreground",
                isWorkflowPage && "text-white",
                isInsightsPage && "text-white",
                isShowcasePage && "text-[#F98618]"
              )}
            >
              Showcase
            </Link>

            <Link
              to="/blog"
              className={cn(
                "group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-[16px] font-medium transition-colors hover:bg-muted hover:text-[#F98618] focus:bg-muted focus:outline-none disabled:pointer-events-none max-lg:hidden",
                isHomePage     && "text-muted-foreground",
                isWorkflowPage && "text-white",
                isInsightsPage && "text-white",
                isBlogPage     && "text-[#F98618]"
              )}
            >
              Blog
            </Link>
          </Flex>

          {/* ── Mobile hamburger ── */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden">
                <AlignJustify className="h-16 w-16" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="px-6">
              <Flex className="items-start justify-between px-12">
                <Link to="/" className="mt-6 -ms-12">
                  <img src="/logo/logowithtext.svg" alt="Logo" className="h-12 w-34" />
                </Link>
                <div className="grid gap-2 py-6">
                  <Link to="/" className={cn("flex w-full items-center py-2 text-lg font-semibold", isHomePage && "text-[#F98618]")}>
                    Home
                  </Link>
                  <Link to="/workflow" className={cn("flex w-full items-center py-2 text-lg font-semibold", isWorkflowPage && "text-[#F98618]")}>
                    Work Flow
                  </Link>
                  <Link to="/insights" className={cn("flex w-full items-center py-2 text-lg font-semibold", isInsightsPage && "text-[#F98618]")}>
                    Insights
                  </Link>
                  <Link to="/showcase" className={cn("flex w-full items-center py-2 text-lg font-semibold", isShowcasePage && "text-[#F98618]")}>
                    Showcase
                  </Link>
                  <Link to="/blog" className={cn("flex w-full items-center py-2 text-lg font-semibold", isBlogPage && "text-[#F98618]")}>
                    Blog
                  </Link>

                  {/* Language links — mobile */}
                  <div className="pt-2 pb-1">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                      Flowlio in your language
                    </p>
                    <div className="flex flex-col gap-1">
                      {langPages.map(({ code, lang, native, path }) => {
                        const isActive = location.pathname === path;
                        return (
                          <Link
                            key={path}
                            to={path}
                            className={cn(
                              "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-gray-50",
                              isActive ? "text-[#F98618]" : "text-gray-600"
                            )}
                          >
                            <span className="flex items-center gap-2.5">
                              <span className={cn(
                                "inline-flex items-center justify-center w-8 h-5 rounded text-xs font-bold tracking-wide",
                                isActive ? "bg-[#F98618]/10 text-[#F98618]" : "bg-gray-100 text-gray-500"
                              )}>
                                {code}
                              </span>
                              <span>{lang}</span>
                              <span className="text-gray-400 text-xs font-normal">{native}</span>
                            </span>
                            {isActive && <Check className="size-3.5 text-[#F98618]" />}
                          </Link>
                        );
                      })}
                    </div>
                  </div>

                  <Link to="/pricing" className={cn("flex w-full items-center py-2 text-lg font-semibold", isPricingPage && "text-[#F98618]")}>
                    Price
                  </Link>
                  <Link to="/auth/signin" className="flex w-full items-center py-2 text-lg font-semibold">
                    Login
                  </Link>
                </div>
              </Flex>
            </SheetContent>
          </Sheet>
        </Flex>

        {/* ── Right: pricing + lang dropdown + login + CTA ── */}
        <Center className="ms-auto hidden lg:flex gap-3">
          <Link
            to="/pricing"
            onClick={() => navigate("/pricing")}
            className={cn(
              "group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-[16px] font-medium transition-colors hover:bg-muted hover:text-[#F98618] focus:outline-none max-lg:hidden",
              isHomePage     && "text-muted-foreground",
              isInsightsPage && "text-white",
              isWorkflowPage && "text-white"
            )}
          >
            Pricing
          </Link>

          {/* Language dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "inline-flex h-9 items-center gap-1.5 rounded-md px-3 py-2 text-[15px] font-medium transition-colors hover:bg-muted focus:outline-none",
                  isHomePage     && "text-muted-foreground",
                  isWorkflowPage && "text-white hover:bg-white/10",
                  isInsightsPage && "text-white hover:bg-white/10"
                )}
              >
                <Globe className="size-4 shrink-0" />
                {langTriggerLabel && (
                  <span className="text-[13px] font-semibold">{langTriggerLabel}</span>
                )}
                <ChevronDown className="size-3.5 opacity-90" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-1.5">
              {langPages.map(({ code, lang, native, path }) => {
                const isActive = location.pathname === path;
                return (
                  <DropdownMenuItem key={path} asChild>
                    <Link
                      to={path}
                      className={cn(
                        "flex items-center gap-3 px-2.5 py-2 rounded-md cursor-pointer",
                        isActive && "bg-gray-50"
                      )}
                    >
                      <span className={cn(
                        "inline-flex items-center justify-center w-9 h-5 rounded text-xs font-bold tracking-wide shrink-0",
                        isActive ? "bg-[#F98618]/10 text-[#F98618]" : "bg-gray-100 text-gray-500"
                      )}>
                        {code}
                      </span>
                      <span className="flex flex-col min-w-0">
                        <span className={cn("text-sm font-semibold leading-none", isActive ? "text-[#F98618]" : "text-gray-800")}>
                          {lang}
                        </span>
                        <span className="text-xs text-gray-400 leading-none mt-1 truncate">{native}</span>
                      </span>
                      {isActive && <Check className="size-3.5 text-[#F98618] ms-auto shrink-0" />}
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          <Box
            onClick={() => navigate("/auth/signin")}
            className={cn(
              "group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-[16px] font-medium transition-colors hover:bg-muted hover:text-[#F98618] focus:outline-none max-lg:hidden cursor-pointer",
              isHomePage     && "text-muted-foreground",
              isWorkflowPage && "text-white",
              isInsightsPage && "text-white"
            )}
          >
            Login
          </Box>

          <Button
            onClick={() => {
              if (isPricingPage) {
                if (selectedPlan == null) {
                  toast.warning("Please select a plan first, then click 'Get Started' on the plan card.");
                  return;
                } else {
                  toast.info("Please click 'Get Started' on the selected plan card.");
                  return;
                }
              } else {
                navigate("/pricing");
              }
            }}
            className="p-2 h-11 w-34 rounded-3xl bg-[#1797B9] cursor-pointer hover:bg-[#1797B9]/80"
          >
            Get Started
            <ArrowRight />
          </Button>
        </Center>
      </header>
    </Box>
  );
};
