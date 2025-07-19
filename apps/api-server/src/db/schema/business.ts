import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// Example business entities for the API server
export const project = pgTable("project", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	description: text("description"),
	ownerId: text("owner_id").notNull(), // References user ID from auth server
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});

export const task = pgTable("task", {
	id: text("id").primaryKey(),
	title: text("title").notNull(),
	description: text("description"),
	status: text("status").notNull().default("pending"),
	priority: integer("priority").notNull().default(1),
	projectId: text("project_id")
		.notNull()
		.references(() => project.id, { onDelete: "cascade" }),
	assignedToId: text("assigned_to_id"), // References user ID from auth server
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});

export const comment = pgTable("comment", {
	id: text("id").primaryKey(),
	content: text("content").notNull(),
	taskId: text("task_id")
		.notNull()
		.references(() => task.id, { onDelete: "cascade" }),
	authorId: text("author_id").notNull(), // References user ID from auth server
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});
