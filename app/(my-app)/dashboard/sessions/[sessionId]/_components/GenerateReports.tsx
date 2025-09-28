"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from "@/components/ui/dialog";
import { CloudUpload, Newspaper } from "lucide-react";
import React, { useState } from "react"; // Import useState
import { Branch, Setting as SettingsType } from "@/payload-types"; // Adjust based on your types
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField } from "@/components/ui/form";
import axios from "axios";
import Setting from "../../../settings/_components/Setting";
import { Loader2 } from "lucide-react"; // Import a spinner icon from lucide-react

// Define schema for report generation settings
const reportSchema = z.object({
  mergeAllBranches: z.boolean(),
  branch: z.string().optional(),
});

type ReportFormType = z.infer<typeof reportSchema>;

function GenerateReports({
  trigger,
  branches,
  sessionId,
}: {
  trigger: React.ReactNode;
  sessionId: string;
  branches: Branch[];
}) {
  const [loading, setLoading] = useState(false); // Add loading state
  const form = useForm<ReportFormType>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      mergeAllBranches: false,
      branch: branches[0]?.id || "",
    },
  });

  const formData = form.watch();

  const downloadPDF = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    document.body.removeChild(link); // Fix: Ensure link is added to DOM before removal
    window.URL.revokeObjectURL(url);
  };

  const handleGenerateReport = async () => {
    setLoading(true); // Start loading
    try {
      const data = form.getValues();
      const response = await axios.post(`/localapi/sessions/generate/${sessionId}`, data, {
        responseType: "blob",
      });

      // Create filename with current timestamp
      const filename = `example`;

      // Download the PDF
      downloadPDF(response.data, filename);
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <Dialog>
      <DialogTrigger>{trigger}</DialogTrigger>
      <DialogContent className="p-0 gap-0">
        <DialogHeader className="border-b p-4 flex items-center flex-row gap-3">
          <div className="p-3 bg-sidebar border-dashed border-2 rounded-full">
            <Newspaper className="size-5 text-black/50" />
          </div>
          <div>
            <div className="font-medium">Generate Report</div>
            <div className="text-sm text-muted-foreground">Configure and generate a new report</div>
          </div>
        </DialogHeader>
        <div className="p-8 pt-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="mt-4 text-sm text-muted-foreground animate-pulse">
                Generating report... This may take up to 1.5 minutes.
              </p>
            </div>
          ) : (
            <Form {...form}>
              <form className="">
                <FormField
                  control={form.control}
                  name="mergeAllBranches"
                  render={({ field }) => (
                    <Setting
                      title="Merge All Branches"
                      description="Enable to include all branches in the report; disable to select a specific branch"
                    >
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            const updatedData = { ...form.getValues(), mergeAllBranches: checked };
                            if (!checked && !updatedData.branch) {
                              updatedData.branch = branches[0]?.id || "";
                            }
                            if (checked) {
                              updatedData.branch = undefined;
                            }
                            form.setValue("branch", updatedData.branch);
                          }}
                        />
                      </FormControl>
                    </Setting>
                  )}
                />
                {!formData.mergeAllBranches && (
                  <FormField
                    control={form.control}
                    name="branch"
                    render={({ field }) => (
                      <Setting
                        title="Select Branch"
                        description="Choose the branch to generate the report for"
                      >
                        <FormControl>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                            }}
                            value={field.value}
                          >
                            <SelectTrigger className="min-w-[160px]">
                              <SelectValue placeholder="Select branch" />
                            </SelectTrigger>
                            <SelectContent>
                              {branches.map((branch) => (
                                <SelectItem key={branch.id} value={branch.id}>
                                  {branch.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </Setting>
                    )}
                  />
                )}
              </form>
            </Form>
          )}
        </div>
        <div className="flex justify-end m-4 mt-6">
          <Button
            onClick={handleGenerateReport}
            className="gap-2"
            disabled={loading} // Disable button during loading
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <CloudUpload className="size-4" />
                Generate Report
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default GenerateReports;
