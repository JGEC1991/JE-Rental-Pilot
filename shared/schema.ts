import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  created_at: timestamp("created_at").defaultNow()
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("user"), // admin, manager, driver
  organization_id: integer("organization_id").references(() => organizations.id),
  is_owner: boolean("is_owner").default(false),
  assigned_vehicle_id: integer("assigned_vehicle_id").references(() => vehicles.id),
  status: text("status").notNull().default("active"),
  created_at: timestamp("created_at").defaultNow()
});

export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  organization_id: integer("organization_id").references(() => organizations.id),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  plate: text("plate").notNull(),
  status: text("status").notNull().default("available"),
  photos: text("photos").array(),
  custom_fields: jsonb("custom_fields"),
  created_at: timestamp("created_at").defaultNow()
});

export const drivers = pgTable("drivers", {
  id: serial("id").primaryKey(),
  organization_id: integer("organization_id").references(() => organizations.id),
  name: text("name").notNull(),
  license_number: text("license_number").notNull(),
  phone: text("phone").notNull(),
  documents: jsonb("documents"),
  custom_fields: jsonb("custom_fields"),
  status: text("status").notNull().default("active"),
  created_at: timestamp("created_at").defaultNow()
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  organization_id: integer("organization_id").references(() => organizations.id),
  vehicle_id: integer("vehicle_id").references(() => vehicles.id),
  driver_id: integer("driver_id").references(() => drivers.id),
  type: text("type").notNull(), // payment, maintenance, incident, repair
  description: text("description").notNull(),
  amount: integer("amount"),
  date: timestamp("date").notNull(),
  recurring: boolean("recurring").default(false),
  recurring_frequency: text("recurring_frequency"), // daily, weekly, monthly
  custom_fields: jsonb("custom_fields"),
  created_at: timestamp("created_at").defaultNow()
});

export const revenues = pgTable("revenues", {
  id: serial("id").primaryKey(),
  organization_id: integer("organization_id").references(() => organizations.id),
  activity_id: integer("activity_id").references(() => activities.id),
  amount: integer("amount").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  custom_fields: jsonb("custom_fields"),
  created_at: timestamp("created_at").defaultNow()
});

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  organization_id: integer("organization_id").references(() => organizations.id),
  activity_id: integer("activity_id").references(() => activities.id),
  amount: integer("amount").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  custom_fields: jsonb("custom_fields"),
  created_at: timestamp("created_at").defaultNow()
});

// Insert schemas
export const insertOrganizationSchema = createInsertSchema(organizations).omit({ 
  id: true,
  created_at: true 
});

export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true,
  created_at: true 
}).extend({
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export const insertVehicleSchema = createInsertSchema(vehicles).omit({ 
  id: true,
  created_at: true 
});

export const insertDriverSchema = createInsertSchema(drivers).omit({ 
  id: true,
  created_at: true 
});

export const insertActivitySchema = createInsertSchema(activities).omit({ 
  id: true,
  created_at: true 
});

export const insertRevenueSchema = createInsertSchema(revenues).omit({ 
  id: true,
  created_at: true 
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({ 
  id: true,
  created_at: true 
});

// Types
export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;

export type Driver = typeof drivers.$inferSelect;
export type InsertDriver = z.infer<typeof insertDriverSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type Revenue = typeof revenues.$inferSelect;
export type InsertRevenue = z.infer<typeof insertRevenueSchema>;

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
