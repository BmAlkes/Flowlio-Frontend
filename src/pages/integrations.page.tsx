import { useState, useEffect } from "react";
import { CheckCircle2, Loader2, PlugZap, Send, Trash2 } from "lucide-react";
import { Box } from "@/components/ui/box";
import { Stack } from "@/components/ui/stack";
import { Flex } from "@/components/ui/flex";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/providers/user.provider";
import {
  useSlackIntegration,
  useUpdateSlackIntegration,
  useTestSlackIntegration,
} from "@/hooks/useSlackIntegration";

const IntegrationsPage = () => {
  const { data: userData } = useUser();
  const organizationId = userData?.user?.organizationId;

  const { data: settingsData } = useSlackIntegration(organizationId);
  const updateSlack = useUpdateSlackIntegration();
  const testSlack = useTestSlackIntegration();

  const [webhookUrl, setWebhookUrl] = useState("");

  const connected = !!settingsData?.data?.slackWebhookUrl;

  useEffect(() => {
    setWebhookUrl(settingsData?.data?.slackWebhookUrl ?? "");
  }, [settingsData?.data?.slackWebhookUrl]);

  const handleConnect = () => {
    if (!organizationId || !webhookUrl.trim()) return;
    updateSlack.mutate({ organizationId, webhookUrl: webhookUrl.trim() });
  };

  const handleDisconnect = () => {
    if (!organizationId) return;
    updateSlack.mutate({ organizationId, webhookUrl: null });
    setWebhookUrl("");
  };

  return (
    <Box className="px-2">
      <Stack className="gap-1 mb-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <PlugZap className="h-6 w-6" />
          Integrations
        </h1>
        <p className="text-muted-foreground">
          Connect Flowlio to other tools your team already uses.
        </p>
      </Stack>

      <Card>
        <CardHeader>
          <Flex className="items-center justify-between gap-4">
            <CardTitle className="text-lg flex items-center gap-2">
              Slack
              {connected && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Connected
                </span>
              )}
            </CardTitle>
          </Flex>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground max-w-2xl mb-4">
            Post automation alerts and comment mentions to a Slack channel using an{" "}
            <a
              href="https://api.slack.com/messaging/webhooks"
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 dark:text-blue-400 underline"
            >
              Incoming Webhook
            </a>
            . In Slack: Apps → Incoming Webhooks → Add to Slack → pick a channel → copy the Webhook URL below.
            No Slack app approval needed.
          </p>

          <Flex className="items-center gap-2 max-w-xl">
            <Input
              type="url"
              placeholder="https://hooks.slack.com/services/..."
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleConnect}
              disabled={!webhookUrl.trim() || updateSlack.isPending}
            >
              {updateSlack.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : connected ? "Update" : "Connect"}
            </Button>
          </Flex>

          {connected && (
            <Flex className="items-center gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => organizationId && testSlack.mutate(organizationId)}
                disabled={testSlack.isPending}
              >
                {testSlack.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 me-2 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5 me-2" />
                )}
                Send test message
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-rose-600 hover:text-rose-700"
                onClick={handleDisconnect}
                disabled={updateSlack.isPending}
              >
                <Trash2 className="h-3.5 w-3.5 me-2" />
                Disconnect
              </Button>
            </Flex>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default IntegrationsPage;
