import { z } from "zod";

const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Please enter a valid email address."));

export const signUpSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name."),
  email: emailField,
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Please enter your password."),
});

export type SignInInput = z.infer<typeof signInSchema>;
