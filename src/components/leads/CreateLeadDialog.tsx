import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";
import { useCreateLead } from "@/hooks/useLeads";
import { useCheckDuplicate } from "@/hooks/useLeadExtras";
import { useState } from "react";
import { useLeadFields } from "@/hooks/useLeadFields";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Must be a valid email"),
  phone: z.string().optional(),
  businessIndustry: z.string().optional(),
  leadValue: z.string().optional(),
  customFields: z.record(z.any()).optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
}

export const CreateLeadDialog = ({ open, onClose }: Props) => {
  const { mutate: createLead, isPending } = useCreateLead();
  const { data: fields = [] } = useLeadFields();
  const checkDuplicate = useCheckDuplicate();
  const [dupWarning, setDupWarning] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      businessIndustry: "",
      leadValue: "",
      customFields: {},
    },
  });

  const onSubmit = (values: FormValues) => {
    const data = {
      name: values.name,
      email: values.email,
      phone: values.phone || undefined,
      businessIndustry: values.businessIndustry || undefined,
      leadValue: values.leadValue ? parseFloat(values.leadValue) : undefined,
      customFields: values.customFields || {},
    };

    createLead(data, {
      onSuccess: () => {
        form.reset();
        onClose();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">New Lead</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input className="rounded-full" placeholder="John Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input
                        className="rounded-full"
                        type="email"
                        placeholder="john@example.com"
                        {...field}
                        onBlur={(e) => {
                          field.onBlur();
                          const email = e.target.value.trim();
                          if (email && email.includes("@")) {
                            checkDuplicate.mutate({ email }, {
                              onSuccess: (res) => {
                                setDupWarning(res.isDuplicate
                                  ? `A lead with this email already exists: ${res.existingLead?.name}`
                                  : null);
                              },
                            });
                          } else {
                            setDupWarning(null);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                    {dupWarning && (
                      <div className="flex items-center gap-1.5 mt-1 text-xs text-amber-600">
                        <AlertTriangle className="h-3 w-3 shrink-0" />
                        {dupWarning}
                      </div>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input className="rounded-full" placeholder="+1 234 567 890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="businessIndustry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry</FormLabel>
                    <FormControl>
                      <Input className="rounded-full" placeholder="e.g. Marketing" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="leadValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lead Value ($)</FormLabel>
                    <FormControl>
                      <Input className="rounded-full" type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Custom fields */}
            {fields.length > 0 && (
              <div className="border-t border-border pt-4 space-y-4">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Custom Fields
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {fields.map((field) => (
                    <FormField
                      key={field.id}
                      control={form.control}
                      name={`customFields.${field.id}`}
                      render={({ field: formField }) => (
                        <FormItem className={field.type === "boolean" ? "flex items-center gap-2" : ""}>
                          {field.type !== "boolean" && <FormLabel>{field.name}</FormLabel>}
                          <FormControl>
                            {field.type === "select" || field.type === "multiselect" ? (
                              <Select value={formField.value ?? ""} onValueChange={formField.onChange}>
                                <SelectTrigger className="rounded-full">
                                  <SelectValue placeholder={`Select ${field.name}`} />
                                </SelectTrigger>
                                <SelectContent>
                                  {(field.options ?? []).map((opt) => (
                                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : field.type === "boolean" ? (
                              <>
                                <Checkbox
                                  checked={formField.value === true || formField.value === "true"}
                                  onCheckedChange={formField.onChange}
                                />
                                <FormLabel className="!mt-0">{field.name}</FormLabel>
                              </>
                            ) : (
                              <Input
                                className="rounded-full"
                                type={field.type === "number" ? "number" : field.type === "url" ? "url" : "text"}
                                placeholder={field.name}
                                value={formField.value ?? ""}
                                onChange={formField.onChange}
                              />
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="rounded-full px-6">
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} className="rounded-full px-6">
                {isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating...</> : "Create Lead"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
