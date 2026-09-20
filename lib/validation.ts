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

export const claimShirtSchema = z.object({
  shirtId: z.string().trim().min(1).max(32),
  displayName: z.string().trim().min(2, "Please enter your name").max(80),
  department: z.string().trim().max(100).optional().or(z.literal("")),
  email: z.string().trim().email("Enter a valid email address").max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  password: z.string().min(6, "Use at least 6 characters").max(128),
});

export const ownerLoginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});
