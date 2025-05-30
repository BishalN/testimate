import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { desc, eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createUpdateSchema, createSelectSchema } from "drizzle-zod";
import { collectionForms, projects } from "@/server/db/schema";
import {
  additionalFieldsSchema,
  customerDetailsConfigSchema,
  customLabelsSchema,
  designConfigSchema,
  responsePageConfigSchema,
  thankYouPageConfigSchema,
  welcomePageConfigSchema,
} from "@/server/db/zod-schemas";

const updateCollectionFormSchema = createUpdateSchema(collectionForms);
const baseSelectSchema = createSelectSchema(collectionForms);

export const collectionFormsRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(z.object({ projectSlug: z.string() }))
    .query(async ({ ctx, input }) => {
      // First verify the project belongs to the user
      const [project] = await ctx.db
        .select()
        .from(projects)
        .where(
          and(
            eq(projects.slug, input.projectSlug),
            eq(projects.createdBy, ctx.user.id)
          )
        );

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found or you don't have access to it",
        });
      }

      const forms = await ctx.db
        .select()
        .from(collectionForms)
        .where(eq(collectionForms.projectId, project.id))
        .orderBy(desc(collectionForms.createdAt));

      return forms;
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const [form] = await ctx.db
        .select()
        .from(collectionForms)
        .where(eq(collectionForms.id, input.id));

      if (!form) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Collection form not found",
        });
      }

      // Verify the user has access to the project
      // const [project] = await ctx.db
      //   .select()
      //   .from(projects)
      //   .where(
      //     and(
      //       eq(projects.id, form.projectId),
      //       eq(projects.createdBy, ctx.user.id)
      //     )
      //   );

      // if (!project) {
      //   throw new TRPCError({
      //     code: "FORBIDDEN",
      //     message: "You don't have access to this collection form",
      //   });
      // }

      return form;
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        projectSlug: z.string(),
        design: designConfigSchema,
        welcomePage: welcomePageConfigSchema,
        responsePage: responsePageConfigSchema,
        customerDetails: customerDetailsConfigSchema,
        thankYouPage: thankYouPageConfigSchema,
        customFields: additionalFieldsSchema,
        customLabels: customLabelsSchema,
        redirectUrl: z.string().optional(),
        active: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify the project belongs to the user
      const [project] = await ctx.db
        .select()
        .from(projects)
        .where(
          and(
            eq(projects.slug, input.projectSlug),
            eq(projects.createdBy, ctx.user.id)
          )
        );

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found or you don't have access to it",
        });
      }

      const newForm = await ctx.db
        .insert(collectionForms)
        .values({
          ...input,
          projectId: project.id,
        })
        .returning();

      return newForm[0];
    }),

  update: protectedProcedure
    .input(
      updateCollectionFormSchema
        .pick({
          id: true,
          title: true,
          description: true,
          design: true,
          welcomePage: true,
          responsePage: true,
          customerDetails: true,
          thankYouPage: true,
          customFields: true,
          customLabels: true,
          redirectUrl: true,
          active: true,
        })
        .extend({ id: z.number({ required_error: "Id is required" }) })
    )
    .mutation(async ({ ctx, input }) => {
      const [form] = await ctx.db
        .select()
        .from(collectionForms)
        .where(eq(collectionForms.id, input.id));

      if (!form) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Collection form not found",
        });
      }

      // Verify the user has access to the project
      const [project] = await ctx.db
        .select()
        .from(projects)
        .where(
          and(
            eq(projects.id, form.projectId),
            eq(projects.createdBy, ctx.user.id)
          )
        );

      if (!project) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this collection form",
        });
      }

      const updatedForm = await ctx.db
        .update(collectionForms)
        .set({
          title: input.title,
          description: input.description,
          design: input.design,
          welcomePage: input.welcomePage,
          responsePage: input.responsePage,
          customerDetails: input.customerDetails,
          thankYouPage: input.thankYouPage,
          customFields: input.customFields,
          customLabels: input.customLabels,
          redirectUrl: input.redirectUrl,
          active: input.active,
        })
        .where(eq(collectionForms.id, input.id))
        .returning();

      return updatedForm[0];
    }),

  delete: protectedProcedure
    .input(baseSelectSchema.pick({ id: true }))
    .mutation(async ({ ctx, input }) => {
      const [form] = await ctx.db
        .select()
        .from(collectionForms)
        .where(eq(collectionForms.id, input.id));

      if (!form) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Collection form not found",
        });
      }

      // Verify the user has access to the project
      const [project] = await ctx.db
        .select()
        .from(projects)
        .where(
          and(
            eq(projects.id, form.projectId),
            eq(projects.createdBy, ctx.user.id)
          )
        );

      if (!project) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this collection form",
        });
      }

      await ctx.db
        .delete(collectionForms)
        .where(eq(collectionForms.id, input.id));

      return { id: input.id };
    }),

  duplicate: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const [form] = await ctx.db
        .select()
        .from(collectionForms)
        .where(eq(collectionForms.id, input.id));

      if (!form) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Collection form not found",
        });
      }

      // Verify the user has access to the project
      const [project] = await ctx.db
        .select()
        .from(projects)
        .where(
          and(
            eq(projects.id, form.projectId),
            eq(projects.createdBy, ctx.user.id)
          )
        );

      if (!project) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this collection form",
        });
      }

      // Create a new form with the same data but a new ID
      const newForm = await ctx.db
        .insert(collectionForms)
        .values({
          ...form,
          id: undefined, // Let the database generate a new ID
          title: `${form.title} (Copy)`,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return newForm[0];
    }),
});
