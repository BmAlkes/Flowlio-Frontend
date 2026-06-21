import React from "react";
import FinancialOverview from "@/components/admin/reports/FinancialOverview";
import TeamProductivity from "@/components/admin/reports/TeamProductivity";
import ClientActivityReport from "@/components/admin/reports/ClientActivityReport";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Users, BarChart2, Lock, Loader2 } from "lucide-react";
import { useHasFeatureAccess } from "@/hooks/usePlanAccess";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";

const ReportsPage: React.FC = () => {
  const { t } = useTranslation();
  const { data: featureAccess, isLoading } = useHasFeatureAccess("analyticsAccess");
  const navigate = useNavigate();
  const hasAccess = featureAccess?.data?.hasAccess ?? true;

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8">
        <div className="p-4 rounded-full bg-red-100">
          <Lock className="w-12 h-12 text-red-600" />
        </div>
        <div className="text-center max-w-md space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">Reports & Analytics Not Available</h2>
          <p className="text-muted-foreground">
            {featureAccess?.data?.reason || "Reports & Analytics is not included in your current plan. Upgrade to access this feature."}
          </p>
          <Button onClick={() => navigate("/dashboard/subscription")} className="mt-4">
            View Plans & Upgrade
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{t('appSidebar.reports')}</h2>
        <p className="text-muted-foreground">
          Detailed financial and performance metrics for your organization.
        </p>
      </div>

      <Tabs defaultValue="financial" className="space-y-4">
        <TabsList className="bg-background border border-border shadow-sm p-1 h-auto">
          <TabsTrigger value="financial" className="flex items-center gap-2 py-2">
            <DollarSign className="w-4 h-4" />
            Financial Overview
          </TabsTrigger>
          <TabsTrigger value="productivity" className="flex items-center gap-2 py-2">
            <Users className="w-4 h-4" />
            Team Productivity
          </TabsTrigger>
          <TabsTrigger value="client-activity" className="flex items-center gap-2 py-2">
            <BarChart2 className="w-4 h-4" />
            Client Activity
          </TabsTrigger>
        </TabsList>
        <TabsContent value="financial" className="space-y-4">
          <FinancialOverview />
        </TabsContent>
        <TabsContent value="productivity" className="space-y-4">
          <TeamProductivity />
        </TabsContent>
        <TabsContent value="client-activity" className="space-y-4">
          <ClientActivityReport />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;
