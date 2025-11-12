import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "../../ui/dropdown-menu";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { FaQuestion } from "react-icons/fa6";
import { Button } from "../../ui/button";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "What is the pricing structure?",
    answer:
      "Our pricing is based on the number of users and the features you need. We offer a range of plans to fit your business needs. You can check our pricing page for more details.",
  },
  {
    question: "How do I get started?",
    answer:
      "Getting started is easy! Simply sign up for an account on our website and follow the onboarding instructions. If you have any questions, our support team is available to help you get started.",
  },
  {
    question: "What kind of support do you offer?",
    answer:
      "We offer a variety of support options, including email, live chat, and phone support. Our team of experts is available to help you with any questions or issues you may have. We also have a comprehensive knowledge base with articles and tutorials to help you get the most out of our product.",
  },
  {
    question: "Do you offer any integrations?",
    answer:
      "Yes, we offer a wide range of integrations with popular third-party tools and services. You can connect our product with your existing workflows and systems to streamline your operations. Our integration documentation provides detailed instructions on how to set up and configure the integrations.",
  },
  {
    question: "How do I cancel my subscription?",
    answer:
      "To cancel your subscription, simply log into your account and navigate to the billing section. From there, you can easily cancel your subscription. If you have any issues or need assistance, our support team is available to help you.",
  },
];

export const FaqDropdown: React.FC<{ className?: string }> = ({
  className,
}) => {
  return (
    <DropdownMenu>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                className={cn(
                  "p-5 bg-white text-black hover:bg-white border border-gray-300 rounded-full cursor-pointer",
                  className
                )}
              >
                <FaQuestion />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent className="mt-2">
            <p>FAQ</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DropdownMenuContent align="end" className="w-lg px-4 py-2 max-sm:w-sm">
        <Accordion
          type="multiple"
          className="w-full"
          defaultValue={[faqs[0].question]}
        >
          {faqs.map(({ question, answer }, key) => (
            <AccordionItem className="my-2" value={question} key={key}>
              <AccordionTrigger className="bg-gray-200 px-2 hover:no-underline">
                {question}
              </AccordionTrigger>
              <AccordionContent>{answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
