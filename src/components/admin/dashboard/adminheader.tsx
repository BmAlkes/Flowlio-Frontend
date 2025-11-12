import { BarChartComponent } from "./barchart/barchart";
import { RecentActivities } from "./recentactivities";
import { Center } from "@/components/ui/center";
import { OngoingTasks } from "./ongoingtasks";

const AdminHeader = () => {
  return (
    <>
      {/* <Stats /> */}
      <Center className="justify-start items-start max-md:flex-col gap-2">
        <BarChartComponent />
        <RecentActivities />
      </Center>
      <OngoingTasks />
    </>
  );
};

export { AdminHeader };
