import { Loader2, PlayCircle, Zap } from "lucide-react";
import { Box } from "@/components/ui/box";
import { Stack } from "@/components/ui/stack";
import { Flex } from "@/components/ui/flex";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AUTOMATIONS, useRunAutomation } from "@/hooks/useAutomations";

const SuperAdminAutomationsPage = () => {
  const runAutomation = useRunAutomation();

  return (
    <Box className="px-2">
      <Stack className="gap-1 mb-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Zap className="h-6 w-6" />
          Automations
        </h1>
        <p className="text-muted-foreground">
          Background jobs that notify users automatically. Use "Run now" to
          trigger a job manually for QA without waiting for its schedule.
        </p>
      </Stack>

      <Stack className="gap-4">
        {AUTOMATIONS.map((automation) => (
          <Card key={automation.key}>
            <CardHeader>
              <Flex className="items-center justify-between gap-4">
                <CardTitle className="text-lg">{automation.title}</CardTitle>
                <Badge variant="secondary">{automation.schedule}</Badge>
              </Flex>
            </CardHeader>
            <CardContent>
              <Flex className="items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground max-w-2xl">
                  {automation.description}
                </p>
                <Button
                  variant="outline"
                  onClick={() => runAutomation.mutate(automation.key)}
                  disabled={
                    runAutomation.isPending &&
                    runAutomation.variables === automation.key
                  }
                  className="shrink-0"
                >
                  {runAutomation.isPending &&
                  runAutomation.variables === automation.key ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Run now
                    </>
                  )}
                </Button>
              </Flex>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
};

export default SuperAdminAutomationsPage;
