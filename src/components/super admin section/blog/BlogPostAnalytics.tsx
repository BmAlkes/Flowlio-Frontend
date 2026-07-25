import { useState } from "react";
import { useNavigate } from "react-router";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { ArrowLeft, Eye } from "lucide-react";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useBlogAdminPost, useBlogPostAnalytics } from "@/hooks/useBlogAdmin";

const TOOLTIP_STYLE = {
  backgroundColor: "hsl(var(--card))",
  borderRadius: "8px",
  border: "1px solid hsl(var(--border))",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  color: "hsl(var(--foreground))",
};

const PERIODS = [7, 30, 90];

interface BlogPostAnalyticsProps {
  postId: string;
}

export const BlogPostAnalytics = ({ postId }: BlogPostAnalyticsProps) => {
  const navigate = useNavigate();
  const [days, setDays] = useState(30);
  const { data: postData } = useBlogAdminPost(postId);
  const { data, isLoading } = useBlogPostAnalytics(postId, days);

  const post = postData?.data;
  const analytics = data?.data;

  return (
    <Box className="px-2 pb-10">
      <Box className="px-4 py-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/superadmin/blog")} className="mb-3 -ms-2">
          <ArrowLeft className="h-4 w-4 me-1.5" />
          Back to posts
        </Button>
        <h1 className="text-3xl max-sm:text-xl font-medium text-foreground">
          {post?.title || "Post analytics"}
        </h1>
      </Box>

      <Box className="px-4 space-y-6">
        <Flex className="items-center gap-2">
          {PERIODS.map((p) => (
            <Button
              key={p}
              variant={days === p ? "default" : "outline"}
              size="sm"
              onClick={() => setDays(p)}
            >
              {p} days
            </Button>
          ))}
        </Flex>

        {isLoading ? (
          <Skeleton className="h-[380px] w-full rounded-xl" />
        ) : !analytics ? (
          <p className="text-sm text-muted-foreground">No analytics data available.</p>
        ) : (
          <>
            <Card className="w-fit">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-indigo-100 text-indigo-600">
                  <Eye className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{analytics.totalViews.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Views in the last {days} days</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Views per day</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.viewsByDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(d) => format(new Date(d), "MMM d")}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={TOOLTIP_STYLE}
                      labelFormatter={(d) => format(new Date(d), "MMM d, yyyy")}
                    />
                    <Line type="monotone" dataKey="views" stroke="#4f46e5" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top referrers</CardTitle>
              </CardHeader>
              <CardContent>
                {!analytics.topReferrers || analytics.topReferrers.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">No referrer data yet.</p>
                ) : (
                  <div className="divide-y divide-border">
                    {analytics.topReferrers.map((ref) => (
                      <Flex key={ref.referrer} className="justify-between py-2.5">
                        <span className="text-sm text-foreground truncate max-w-[70%]">
                          {ref.referrer || "Direct / unknown"}
                        </span>
                        <span className="text-sm font-semibold text-muted-foreground">{ref.count.toLocaleString()}</span>
                      </Flex>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </Box>
    </Box>
  );
};
