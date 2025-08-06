import { eq } from "drizzle-orm";
import { db } from "../db";
import { comment, project, task } from "../db/schema/business";
import { protectedProcedure, publicProcedure } from "../lib/orpc";

export const appRouter = {
	healthCheck: publicProcedure.handler(() => {
		return "All systems GO!";
	}),

	// Protected endpoints with business logic
	getProjects: protectedProcedure.handler(async ({ context }) => {
		const projects = await db
			.select()
			.from(project)
			.where(eq(project.ownerId, context.auth?.user.id));

		return projects;
	}),

	createProject: protectedProcedure.handler(async ({ context, input }) => {
		const { name, description } = input as {
			name: string;
			description?: string;
		};

		const newProject = await db
			.insert(project)
			.values({
				id: crypto.randomUUID(),
				name,
				description,
				ownerId: context.auth?.user.id,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();

		return newProject[0];
	}),

	getTasks: protectedProcedure.handler(async ({ context, input }) => {
		const { projectId } = input as { projectId: string };

		const tasks = await db
			.select()
			.from(task)
			.where(eq(task.projectId, projectId));

		return tasks;
	}),

	createTask: protectedProcedure.handler(async ({ context, input }) => {
		const { title, description, projectId, priority } = input as {
			title: string;
			description?: string;
			projectId: string;
			priority?: number;
		};

		const newTask = await db
			.insert(task)
			.values({
				id: crypto.randomUUID(),
				title,
				description,
				projectId,
				priority: priority || 1,
				status: "pending",
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();

		return newTask[0];
	}),

	updateTask: protectedProcedure.handler(async ({ context, input }) => {
		const { id, title, description, status, priority, assignedToId } =
			input as {
				id: string;
				title?: string;
				description?: string;
				status?: string;
				priority?: number;
				assignedToId?: string;
			};

		const updatedTask = await db
			.update(task)
			.set({
				title,
				description,
				status,
				priority,
				assignedToId,
				updatedAt: new Date(),
			})
			.where(eq(task.id, id))
			.returning();

		return updatedTask[0];
	}),

	getComments: protectedProcedure.handler(async ({ input }) => {
		const { taskId } = input as { taskId: string };

		const comments = await db
			.select()
			.from(comment)
			.where(eq(comment.taskId, taskId));

		return comments;
	}),

	createComment: protectedProcedure.handler(async ({ context, input }) => {
		const { content, taskId } = input as { content: string; taskId: string };

		const newComment = await db
			.insert(comment)
			.values({
				id: crypto.randomUUID(),
				content,
				taskId,
				authorId: context.auth?.user.id,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();

		return newComment[0];
	}),

	// Private data endpoint (example)
	privateData: protectedProcedure.handler(({ context }) => {
		return {
			message: "This is private data from API server",
			user: context.auth?.user,
			timestamp: new Date().toISOString(),
		};
	}),
};

export type AppRouter = typeof appRouter;
