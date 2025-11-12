interface Organization {
  id: string;
  name: string;
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
  createdAt: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  createdAt: string;
}

interface ChartDataPoint {
  month: string;
  companies: number;
  projectsCreated: number;
  invoicesCreated: number;
}

export const processChartData = (
  organizations: Organization[],
  projects: Project[],
  invoices: Invoice[],
  year: number
): ChartDataPoint[] => {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Initialize chart data for all 12 months
  const chartData: ChartDataPoint[] = monthNames.map((month) => ({
    month,
    companies: 0,
    projectsCreated: 0,
    invoicesCreated: 0,
  }));

  // Process organizations
  organizations.forEach((org) => {
    const createdAt = new Date(org.createdAt);
    if (createdAt.getFullYear() === year) {
      const monthIndex = createdAt.getMonth(); // 0-11
      chartData[monthIndex].companies += 1;
    }
  });

  // Process projects
  projects.forEach((project) => {
    const createdAt = new Date(project.createdAt);
    if (createdAt.getFullYear() === year) {
      const monthIndex = createdAt.getMonth(); // 0-11
      chartData[monthIndex].projectsCreated += 1;
    }
  });

  // Process invoices
  invoices.forEach((invoice) => {
    const createdAt = new Date(invoice.createdAt);
    if (createdAt.getFullYear() === year) {
      const monthIndex = createdAt.getMonth(); // 0-11
      chartData[monthIndex].invoicesCreated += 1;
    }
  });

  return chartData;
};

export const getTotalCounts = (
  organizations: Organization[],
  projects: Project[],
  invoices: Invoice[] = []
) => {
  return {
    totalCompanies: organizations.length,
    totalProjects: projects.length,
    totalInvoices: invoices.length,
  };
};
