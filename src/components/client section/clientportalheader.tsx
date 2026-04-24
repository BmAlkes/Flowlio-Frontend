import React from "react";
import { Box } from "../ui/box";
import { Flex } from "../ui/flex";
import { Stack } from "../ui/stack";

interface ClientPortalHeaderProps {
  title: string;
  description?: string;
}

export const ClientPortalHeader: React.FC<ClientPortalHeaderProps> = ({
  title,
  description,
}) => {
  return (
    <Box className="p-4 bg-card border-b border-border mb-6 rounded-lg shadow-sm">
      <Flex className="justify-between items-center">
        <Stack className="gap-1">
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </Stack>
      </Flex>
    </Box>
  );
};
