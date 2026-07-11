import { ProjectHeader } from "@/components/projects/projectHeader";
import { ProjectRiskAlertsPanel } from "@/components/projects/ProjectRiskAlertsPanel";
import { Box } from "@/components/ui/box";

const ProjectsPage = () => {
  return (
    <Box className="px-2 pt-5">
      <ProjectRiskAlertsPanel />
      <ProjectHeader />
    </Box>
  );
};

export default ProjectsPage;
