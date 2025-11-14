import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router";
import { Center } from "@/components/ui/center";
import { Box } from "@/components/ui/box";
import { Stack } from "@/components/ui/stack";
import { useUnsubscribeNewsletter } from "@/hooks/useunsubscribenewsletter";
import { CheckCircle2, XCircle, Loader2, Info } from "lucide-react";

const UnsubscribePage = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const [isUnsubscribed, setIsUnsubscribed] = useState(false);
  const [isAlreadyUnsubscribed, setIsAlreadyUnsubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const unsubscribeMutation = useUnsubscribeNewsletter();
  const hasUnsubscribed = useRef(false);

  useEffect(() => {
    const unsubscribe = async () => {
      if (email && !hasUnsubscribed.current) {
        hasUnsubscribed.current = true;
        try {
          const response = await unsubscribeMutation.mutateAsync({ email });
          // Check if the message indicates already unsubscribed
          if (
            response?.message?.toLowerCase().includes("already unsubscribed")
          ) {
            setIsAlreadyUnsubscribed(true);
          } else {
            setIsUnsubscribed(true);
          }
          setError(null);
        } catch (err: any) {
          const errorMessage =
            err.response?.data?.message ||
            err.message ||
            "Failed to unsubscribe. Please try again.";
          setError(errorMessage);
        }
      } else if (!email) {
        setError("Email parameter is missing from the URL");
      }
    };

    unsubscribe();
  }, [email]);

  const handleUnsubscribe = async () => {
    if (!email) {
      setError("Email is required");
      return;
    }

    try {
      await unsubscribeMutation.mutateAsync({ email });
      setIsUnsubscribed(true);
      setError(null);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to unsubscribe. Please try again.";
      setError(errorMessage);
    }
  };

  return (
    <Center className="min-h-screen bg-gray-50 p-4">
      <Box className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <Stack className="gap-6 items-center text-center">
          {unsubscribeMutation.isPending ? (
            <>
              <Loader2 className="h-16 w-16 text-[#1797B9] animate-spin" />
              <Box>
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                  Unsubscribing...
                </h1>
                <p className="text-gray-600">
                  Please wait while we process your request.
                </p>
              </Box>
            </>
          ) : error ? (
            <>
              <XCircle className="h-16 w-16 text-red-500" />
              <Box>
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                  Unsubscribe Failed
                </h1>
                <p className="text-gray-600 mb-4">{error}</p>
                {email && (
                  <button
                    onClick={handleUnsubscribe}
                    className="bg-[#1797B9] text-white px-6 py-2 rounded-full hover:bg-[#1797B9]/80 transition-colors"
                  >
                    Try Again
                  </button>
                )}
              </Box>
            </>
          ) : isAlreadyUnsubscribed ? (
            <>
              <div className="bg-blue-100 rounded-full p-4 mb-4">
                <Info className="h-20 w-20 text-blue-600" />
              </div>
              <Box className="w-full">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Already Unsubscribed
                </h1>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-lg font-medium text-blue-800 mb-2">
                    You are already unsubscribed from our newsletter.
                  </p>
                  <p className="text-base text-blue-700">
                    This email address is not receiving newsletter emails from
                    Flowlio.
                  </p>
                </div>
                {email && (
                  <div className="bg-gray-50 rounded-lg p-3 mt-4">
                    <p className="text-sm font-medium text-gray-700">
                      Email address:
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{email}</p>
                  </div>
                )}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    If you'd like to receive our newsletter again, you can
                    subscribe from our website.
                  </p>
                </div>
              </Box>
            </>
          ) : isUnsubscribed ? (
            <>
              <div className="bg-green-100 rounded-full p-4 mb-4">
                <CheckCircle2 className="h-20 w-20 text-green-600" />
              </div>
              <Box className="w-full">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  ✓ Successfully Unsubscribed!
                </h1>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-lg font-medium text-green-800 mb-2">
                    You have been unsubscribed from our newsletter.
                  </p>
                  <p className="text-base text-green-700">
                    You will no longer receive newsletter emails from Flowlio.
                  </p>
                </div>
                {email && (
                  <div className="bg-gray-50 rounded-lg p-3 mt-4">
                    <p className="text-sm font-medium text-gray-700">
                      Unsubscribed email:
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{email}</p>
                  </div>
                )}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    If you change your mind, you can subscribe again anytime
                    from our website.
                  </p>
                </div>
              </Box>
            </>
          ) : (
            <>
              <Loader2 className="h-16 w-16 text-[#1797B9] animate-spin" />
              <Box>
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                  Processing...
                </h1>
                <p className="text-gray-600">
                  Please wait while we process your unsubscribe request.
                </p>
              </Box>
            </>
          )}
        </Stack>
      </Box>
    </Center>
  );
};

export default UnsubscribePage;
