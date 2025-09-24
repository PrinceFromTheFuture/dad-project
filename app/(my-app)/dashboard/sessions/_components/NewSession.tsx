"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

// Define the form schema
const formSchema = z.object({
  nickname: z
    .string()
    .min(1, "Session nickname is required")
    .max(15, "session nickname should not be too long"),
  month: z.string().min(1, "Month is required"),
  year: z.string().min(1, "Year is required"),
  files: z.array(z.instanceof(File)).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface NewSessionDialogProps {
  trigger: React.ReactNode;
}

export function NewSession({ trigger }: NewSessionDialogProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [files, setFiles] = React.useState<File[]>([]);
  const [dragging, setDragging] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false); // Added for loading state

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nickname: "",
      month: "",
      year: "",
      files: [],
    },
  });

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles.filter((f) => f.type === "text/plain")]);
    setDragging(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/plain": [".txt"] },
    multiple: true,
  });

  const handleRemoveFile = (fileToRemove: File) => {
    setFiles((prev) => prev.filter((f) => f !== fileToRemove));
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("nickname", data.nickname);
    formData.append("month", data.month);
    formData.append("year", data.year);
    files.forEach((file, index) => {
      formData.append(`files`, file, file.name);
    });
    console.log(formData.getAll("files"));

    try {
      const response = await fetch("/localapi/sessions/new", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to create session");
      }

      const res = await response.json();

      form.reset();
      setFiles([]);
      setOpen(false);
      
      router.push(`/dashboard/sessions/${res.sessionId}`);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onFormSubmit = (data: FormData) => {
    onSubmit(data);
  };

  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const years = Array.from({ length: 11 }, (_, i) => ({
    value: (2025 + i).toString(),
    label: (2025 + i).toString(),
  }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle>Create New Session</DialogTitle>
          <DialogDescription>
            Enter the session details and attach the reports from by the <span className=" text-blue-600 font-semibold">Bituach Leumi</span> main-frame.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="nickname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Session Nickname</FormLabel>
                  <FormControl>
                    <Input max={15} placeholder="Enter a nickname for the session" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="month"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Month</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Select month" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month.value} value={month.value}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year.value} value={year.value}>
                            {year.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {files.length === 0 && (
              <FormField
                control={form.control}
                name="files"
                render={() => (
                  <FormItem>
                    <FormLabel>File Attachments (TXT files)</FormLabel>
                    <FormControl>
                      <div
                        {...getRootProps()}
                        className={cn(
                          "relative border-2 border-dashed rounded-md p-4 cursor-pointer transition-colors",
                          dragging
                            ? "border-primary bg-primary/5"
                            : "border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500"
                        )}
                        onDragEnter={() => setDragging(true)}
                      >
                        <Input {...getInputProps()} />
                        <div className="flex flex-col items-center justify-center text-center">
                          <Upload className="size-6 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground mb-1">
                            {isDragActive
                              ? "Drop the files here ..."
                              : "Drag & drop TXT files here, or click to select"}
                          </p>
                          <p className="text-xs text-muted-foreground">Supports multiple TXT files</p>
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>Attach multiple text files to the session.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {files.length > 0 && (
              <div className="mt-2">
                <FormLabel className="mb-4">File Attachments (TXT files)</FormLabel>
                <div className="flex flex-col max-h-[300px] overflow-y-auto">
                  {files.map((file) => (
                    <Button
                      key={file.name}
                      type="button"
                      variant="ghost"
                      size="default"
                      onClick={() => handleRemoveFile(file)}
                      className="flex w-min items-center gap-2 text-muted-foreground cursor-pointer"
                    >
                      <div className="h-4 w-4 p-0">
                        <X className="h-3 w-3" />
                      </div>
                      {file.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting || form.formState.isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Session"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
