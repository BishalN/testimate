"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { FormSidebar } from "@/components/forms/builder/form-sidebar";
import { FormPreview } from "@/components/forms/builder/form-preview";
import { FormProvider } from "react-hook-form";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEditFormBuilder } from "@/hooks/use-edit-form-builder";

export function EditFormBuilder() {
  const router = useRouter();
  const params = useParams();
  const {
    form,
    collectionFormConfig,
    activeSection,
    viewMode,
    handleSectionChange,
    handleViewModeChange,
  } = useEditFormBuilder();

  const utils = api.useUtils();
  const updateForm = api.collectionForms.update.useMutation({
    onSuccess: async (data) => {
      await utils.collectionForms.getAll.invalidate();
      toast.success("Form updated successfully!");
      router.push(`/dashboard/${params.projectSlug}/forms/${data?.id}/share`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    updateForm.mutate({
      id: Number(params.formId),
      title: data.name,
      design: data.design,
      welcomePage: data.welcomePage,
      responsePage: data.responsePage,
      customerDetails: data.customerDetails,
      thankYouPage: data.thankYouPage,
      customFields: data.additionalFields,
      customLabels: data.customLabels,
    });
  });

  return (
    <FormProvider {...form}>
      <div className="h-screen grid grid-cols-[40%_60%]">
        <div className="flex flex-col py-10 px-4 overflow-y-scroll">
          <div className="px-4 py-2 space-y-2">
            <Link
              href={`/dashboard/${params.projectSlug}/forms`}
              className="flex items-center text-sm text-gray-500 hover:text-gray-900"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Forms
            </Link>
            <input
              type="text"
              className="text-2xl font-semibold bg-transparent border-none focus:outline-none w-full"
              {...form.register("name")}
            />
          </div>
          <FormSidebar
            activeSection={activeSection}
            setActiveSection={handleSectionChange}
          />
          <div className="mt-auto px-4 py-6">
            <Button
              variant="default"
              className="w-full bg-black text-white hover:bg-gray-800"
              onClick={onSubmit}
              disabled={!form.formState.isValid || updateForm.isPending}
            >
              {updateForm.isPending ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </div>
        <FormPreview
          viewMode={viewMode}
          setViewMode={handleViewModeChange}
          collectionFormConfig={collectionFormConfig}
          activeSection={activeSection}
        />
      </div>
    </FormProvider>
  );
}
