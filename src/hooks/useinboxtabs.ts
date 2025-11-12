import { useEffect, useRef } from "react";
import { useStepper } from "./usestepper";

export type Tabs = "all" | "unread" | "tasks" | "issues" | "message";

export const useInboxTabs = () => {
  const tabs: Tabs[] = ["all", "unread", "tasks", "issues", "message"];
  const stepperProps = useStepper(tabs);
  const tabRefs = useRef<Record<Tabs, HTMLButtonElement | null>>({
    all: null,
    tasks: null,
    unread: null,
    issues: null,
    message: null,
  });

  useEffect(() => {
    const activeTabRef = tabRefs.current[stepperProps.step];
    if (activeTabRef) {
      activeTabRef.scrollIntoView({ behavior: "smooth", inline: "center" });
    }
  }, [stepperProps.step]);

  useEffect(() => {
    if (stepperProps.isStepActive(stepperProps.step)) {
      scrollTo();
    }
  }, [scrollTo, stepperProps.step]);

  return { tabRefs, scrollTo, tabs, stepperProps };
};
