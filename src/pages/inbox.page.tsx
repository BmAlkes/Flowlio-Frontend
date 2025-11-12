import { NotificationMessage } from "@/components/admin/dashboard/inbox/notificationmessage";
import { RenderNotification } from "@/components/admin/dashboard/inbox/rendernotification";
import { InboxControls } from "@/components/admin/dashboard/inbox/inboxcontrols";
import { useGlobalNotifications } from "@/providers/notifications.provider";
import { InboxTabs } from "@/components/admin/dashboard/inbox/inboxtabs";
import { ComponentWrapper } from "@/components/common/componentwrapper";
import { Stack } from "@/components/ui/stack";

const InboxPage = () => {
  const { notifications } = useGlobalNotifications();

  return (
    <>
      <InboxControls />
      <ComponentWrapper className="mt-2 p-5 shadow-none">
        <InboxTabs notifications={notifications}>
          {(step) => (
            <Stack className="mt-2">
              <RenderNotification
                notifications={notifications}
                filterType={step}
              >
                {(n, key) => <NotificationMessage key={key} {...n} />}
              </RenderNotification>
            </Stack>
          )}
        </InboxTabs>
      </ComponentWrapper>
    </>
  );
};

export default InboxPage;
