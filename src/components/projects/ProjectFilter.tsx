import { useState } from "react";
import { useFetchCustomFields } from "@/hooks/usecustomfields";
import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Flex } from "@/components/ui/flex";
import { Filter } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ProjectFilterProps {
  onFilterChange: (filters: Record<string, any>) => void;
}

export const ProjectFilter = ({ onFilterChange }: ProjectFilterProps) => {
  const { data: customFieldsData } = useFetchCustomFields("project");
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (fieldId: string, value: any) => {
    const newFilters = { ...activeFilters };
    if (value === "" || value === null || value === undefined) {
      delete newFilters[fieldId];
    } else {
      newFilters[fieldId] = value;
    }
    setActiveFilters(newFilters);
  };

  const applyFilters = () => {
    onFilterChange(activeFilters);
    setIsOpen(false);
  };

  const clearFilters = () => {
    setActiveFilters({});
    onFilterChange({});
    setIsOpen(false);
  };

  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`flex items-center gap-2 ${hasActiveFilters ? "bg-blue-50 border-blue-200 text-blue-700" : ""}`}
        >
          <Filter className="w-4 h-4" />
          Custom Filters
          {hasActiveFilters && (
            <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">
              {Object.keys(activeFilters).length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-4" align="start">
        <Box className="space-y-4">
          <Flex className="justify-between items-center mb-2">
            <h4 className="font-medium">Filter Projects</h4>
            {hasActiveFilters && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="h-auto p-0 text-xs text-red-500 hover:text-red-700 hover:bg-transparent"
              >
                Clear all
              </Button>
            )}
          </Flex>

          <Box className="max-h-[300px] overflow-y-auto space-y-3 pr-1">
            {customFieldsData?.data.map((field) => (
              <Box key={field.id} className="space-y-1.5">
                <Label className="text-xs">{field.name}</Label>
                {field.type === "select" ? (
                  <Select
                    value={activeFilters[field.id] || ""}
                    onValueChange={(val) => handleFilterChange(field.id, val)}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL_VALUES_RESET">All</SelectItem>
                      {field.options?.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : field.type === "boolean" ? (
                   <Select
                    value={activeFilters[field.id] || ""}
                    onValueChange={(val) => handleFilterChange(field.id, val)}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL_VALUES_RESET">All</SelectItem>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={activeFilters[field.id] || ""}
                    onChange={(e) => handleFilterChange(field.id, e.target.value)}
                    placeholder={`Filter by ${field.name.toLowerCase()}...`}
                    className="h-8"
                  />
                )}
              </Box>
            ))}
            
            {(!customFieldsData?.data || customFieldsData.data.length === 0) && (
              <div className="text-xs text-gray-500 text-center py-4">
                No custom fields available to filter.
              </div>
            )}
          </Box>

          <Button onClick={applyFilters} className="w-full bg-black text-white hover:bg-black/90">
            Apply Filters
          </Button>
        </Box>
      </PopoverContent>
    </Popover>
  );
};
