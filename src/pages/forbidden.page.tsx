import { Button } from "@/components/ui/button";
import { Box } from "@/components/ui/box";
import { Stack } from "@/components/ui/stack";
import { Shield, Home, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";

export const ForbiddenPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Box className="text-center max-w-md mx-auto p-8">
        <Stack className="items-center gap-6">
          {/* Icon */}
          <Box className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
            <Shield className="w-12 h-12 text-red-600" />
          </Box>

          {/* Title */}
          <Stack className="gap-2">
            <h1 className="text-3xl font-bold text-gray-900">Access Denied</h1>
            <p className="text-gray-600">
              You don't have permission to access this page. Please contact your
              administrator if you believe this is an error.
            </p>
          </Stack>

          {/* Actions */}
          <Stack className="gap-3 w-full">
            <Button
              onClick={() => navigate("/dashboard")}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>

            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </Stack>

          {/* Error Code */}
          <Box className="text-sm text-gray-500">Error 403 - Forbidden</Box>
        </Stack>
      </Box>
    </div>
  );
};
