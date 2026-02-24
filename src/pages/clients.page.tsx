import { useEffect } from "react";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const ClientDashboardPage = () => {
  useEffect(() => {
    document.title = "Client Portal - Flowlio";
  }, []);

  return (
    <Box className="flex min-h-[50vh] items-center justify-center">
      <Card className="max-w-md border-amber-200 bg-amber-50/50">
        <CardContent className="pt-6">
          <Flex className="items-center gap-3 text-amber-800">
            <AlertCircle className="h-10 w-10 shrink-0" />
            <Box>
              <p className="font-medium">Client Portal Removed</p>
              <p className="text-sm text-amber-700">
                The client portal features have been removed. Please contact your administrator for access to organization features.
              </p>
            </Box>
          </Flex>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ClientDashboardPage;
