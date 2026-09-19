import { z } from "zod";

export const createShirtSchema = z.object({
  displayName: z.string().trim().max(80).optional().or(z.literal("")),
  department: z.string().trim().max(100).optional().or(z.literal("")),
});

export const updateShirtSchema = createShirtSchema;

export const createMemorySchema = z.object({
  shirtId: z.string().trim().min(1).max(32),
  visitorName: z.string().trim().min(1, "Your name / nickname is required").max(80),
  visitorDepartment: z.string().trim().max(100).optional().or(z.literal("")),
  memory: z.string().trim().min(1, "Your memory is required").max(5000),
  website: z.string().max(0).optional().or(z.literal("")),
});
