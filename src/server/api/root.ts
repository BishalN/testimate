import { projectRouter } from "@/server/api/routers/projects";
import { collectionFormsRouter } from "@/server/api/routers/collection-forms";
import { testimonialsRouter } from "@/server/api/routers/testimonials";
import { tagRouter } from "@/server/api/routers/tags";
import { widgetRouter } from "@/server/api/routers/widget";
import { fileUploadRouter } from "@/server/api/routers/file-upload";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  project: projectRouter,
  collectionForms: collectionFormsRouter,
  testimonials: testimonialsRouter,
  tags: tagRouter,
  widget: widgetRouter,
  fileUpload: fileUploadRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
