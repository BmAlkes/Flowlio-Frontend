import { useNavigate } from "react-router";
import { Plus } from "lucide-react";
import { Center } from "@/components/ui/center";
import { Stack } from "@/components/ui/stack";
import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BlogStatsCards } from "./blogstatscards";
import { BlogPostsTable } from "./blogpoststable";

export const BlogAdminHeader = () => {
  const navigate = useNavigate();

  return (
    <Box className="px-2">
      <Center className="justify-between px-4 py-6 max-sm:flex-col max-sm:items-start gap-2">
        <Stack className="gap-1">
          <h1 className="text-foreground text-3xl max-sm:text-xl font-medium">Blog</h1>
          <h1 className="max-sm:text-sm max-w-[600px] text-muted-foreground">
            Manage published content, SEO and performance for the Flowlio blog.
          </h1>
        </Stack>

        <Button
          className="bg-black text-white border border-border rounded-full px-6 py-5 flex items-center gap-2 cursor-pointer hover:bg-muted/50"
          onClick={() => navigate("/superadmin/blog/new")}
        >
          <Plus className="w-4 h-4" />
          New Post
        </Button>
      </Center>

      <Box className="px-4 pb-6">
        <Tabs defaultValue="posts" className="space-y-6">
          <TabsList className="bg-background border border-border shadow-sm p-1 h-auto">
            <TabsTrigger value="posts" className="py-1.5 px-3">Posts</TabsTrigger>
            <TabsTrigger value="stats" className="py-1.5 px-3">Stats</TabsTrigger>
          </TabsList>
          <TabsContent value="posts">
            <BlogPostsTable />
          </TabsContent>
          <TabsContent value="stats">
            <BlogStatsCards />
          </TabsContent>
        </Tabs>
      </Box>
    </Box>
  );
};
