import { CustomCalendarHeader } from "@/components/custom calender/customecalenderheader";
import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";

const CalenderPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isPopup, setIsPopup] = useState(false);

  useEffect(() => {
    // Check if this page was opened in a popup with google_auth parameter
    const googleAuth = searchParams.get("google_auth");

    // Check if this is a popup window (has opener and is not the main window)
    const isPopupWindow = window.opener !== null && window.opener !== window;

    // If success and popup, automatically close immediately
    // DON'T delete the parameter - keep it for detection
    if (googleAuth === "success" && isPopupWindow) {
      // Send message to parent window FIRST (before any redirect)
      try {
        window.opener?.postMessage(
          { type: "google-calendar-auth", status: "success" },
          window.location.origin
        );
      } catch {
        // Ignore errors
      }

      // Immediately redirect to blank page (more reliable than window.close)
      // This works better with browser security restrictions
      try {
        window.location.replace("about:blank");
      } catch {
        // If replace fails, try href
        try {
          window.location.href = "about:blank";
        } catch {
          // Last resort: try to close
          try {
            window.close();
          } catch {
            // If all fail, at least try to close after a delay
            setTimeout(() => {
              try {
                window.close();
              } catch {
                // Ignore
              }
            }, 100);
          }
        }
      }

      // Also try window.close as backup (in case redirect doesn't work)
      setTimeout(() => {
        try {
          if (!window.closed) {
            window.close();
          }
        } catch {
          // Ignore
        }
      }, 50);

      return; // Exit early, don't continue with rest of logic - DON'T delete parameter
    }

    // Only process if not already handled in the success+popup case above
    if (
      (googleAuth === "success" || googleAuth === "error") &&
      !(googleAuth === "success" && isPopupWindow)
    ) {
      setIsPopup(true);

      // Hide sidebar and navbar when popup is shown
      const hideUIElements = () => {
        // Hide sidebar
        const sidebar =
          document.querySelector("[data-sidebar]") ||
          document.querySelector(".sidebar") ||
          document.querySelector('[class*="sidebar"]') ||
          document.querySelector("aside") ||
          document.querySelector('[role="complementary"]');
        if (sidebar) {
          (sidebar as HTMLElement).style.display = "none";
        }

        // Hide horizontal navbar - The HorizontalNavbar is a Box with specific classes
        // It has: pt-5, items-center, grid classes and contains UserProfile, NotificationsDropdown
        const allDivs = document.querySelectorAll("div");
        for (const div of allDivs) {
          const element = div as HTMLElement;
          const classes = element.className || "";

          // Check if it matches HorizontalNavbar pattern
          const hasPt5 = classes.includes("pt-5");
          const hasItemsCenter = classes.includes("items-center");
          const hasGrid =
            classes.includes("grid") ||
            getComputedStyle(element).display === "grid";

          // Check if it contains typical HorizontalNavbar children
          const hasUserProfile =
            element.querySelector('[class*="user"]') ||
            element.querySelector('img[alt*="user"]') ||
            element.querySelector('[class*="avatar"]');
          const hasNotifications =
            element.querySelector('[class*="notification"]') ||
            element.querySelector('[class*="bell"]');
          const hasSidebarTrigger =
            element.querySelector("[data-sidebar-trigger]") ||
            element.querySelector('button[aria-label*="sidebar"]');

          // If it matches the pattern, hide it
          if (
            (hasPt5 && hasItemsCenter && hasGrid) ||
            (hasGrid &&
              hasUserProfile &&
              (hasNotifications || hasSidebarTrigger))
          ) {
            element.style.display = "none";
            break;
          }
        }

        // Also try direct selectors
        const directSelectors = [
          document.querySelector("div.pt-5.items-center.grid"),
          document.querySelector(
            'div[class*="pt-5"][class*="items-center"][class*="grid"]'
          ),
        ];
        directSelectors.forEach((selector) => {
          if (selector) {
            (selector as HTMLElement).style.display = "none";
          }
        });

        // Also hide any navbar/header elements
        const navbar =
          document.querySelector("nav") ||
          document.querySelector('[class*="navbar"]') ||
          document.querySelector('[class*="navigation"]') ||
          document.querySelector("header") ||
          document.querySelector('[class*="header"]');
        if (navbar) {
          (navbar as HTMLElement).style.display = "none";
        }
      };

      // Hide immediately
      hideUIElements();

      // Keep hiding on DOM changes
      const observer = new MutationObserver(hideUIElements);
      observer.observe(document.body, { childList: true, subtree: true });

      // If opened in a popup, immediately close it
      if (isPopupWindow) {
        // Send message to parent window to close popup
        try {
          window.opener?.postMessage(
            { type: "google-calendar-auth", status: googleAuth },
            window.location.origin
          );
        } catch {
          // Could not send message to opener
        }

        // Close this popup window immediately
        setTimeout(() => {
          window.close();
        }, 100); // Small delay to ensure message is sent

        // DON'T delete the parameter in popup - keep it for detection
        // The window will close anyway, so no need to clean URL
      } else {
        // If not a popup, just clean up URL parameter
        searchParams.delete("google_auth");
        setSearchParams(searchParams, { replace: true });
      }

      // Cleanup observer on unmount
      return () => {
        observer.disconnect();
      };
    }
  }, [searchParams, setSearchParams]);

  // Don't render calendar content if it's a popup with auth parameter
  if (isPopup) {
    window.close();
    return (
      <Box className="flex items-center justify-center h-screen">
        <Box className="text-center">
          <Box className="text-lg font-semibold mb-2">
            Google Calendar connected successfully!
          </Box>
          <Button
            className="mt-4 hover:bg-primary/90 bg-primary text-white cursor-pointer"
            onClick={() => window.close()}
          >
            Back to Website
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box className="px-2">
      <CustomCalendarHeader />
    </Box>
  );
};

export default CalenderPage;
