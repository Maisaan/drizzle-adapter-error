import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	pgEnum,
	pgTable,
	primaryKey,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

export const users = pgTable(
	"user",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		name: text("name"),
		email: text("email").unique(),
		emailVerified: timestamp("emailVerified", { mode: "date" }),
		image: text("image"),
	},
	(table) => ({
		emailIdx: index("email_idx").on(table.email),
	}),
);

export const accounts = pgTable(
	"account",
	{
		userId: text("userId")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		type: text("type").$type<AdapterAccountType>().notNull(),
		provider: text("provider").notNull(),
		providerAccountId: text("providerAccountId").notNull(),
		refresh_token: text("refresh_token"),
		access_token: text("access_token"),
		expires_at: integer("expires_at"),
		token_type: text("token_type"),
		scope: text("scope"),
		id_token: text("id_token"),
		session_state: text("session_state"),
	},
	(account) => ({
		compoundKey: primaryKey({
			columns: [account.provider, account.providerAccountId],
		}),
		userIdIdx: index("user_id_idx").on(account.userId),
	}),
);

export const sessions = pgTable("session", {
	sessionToken: text("sessionToken").primaryKey(),
	userId: text("userId")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
	"verificationToken",
	{
		identifier: text("identifier").notNull(),
		token: text("token").notNull(),
		expires: timestamp("expires", { mode: "date" }).notNull(),
	},
	(verificationToken) => ({
		compositePk: primaryKey({
			columns: [verificationToken.identifier, verificationToken.token],
		}),
	}),
);

export const authenticators = pgTable(
	"authenticator",
	{
		credentialID: text("credentialID").notNull().unique(),
		userId: text("userId")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		providerAccountId: text("providerAccountId").notNull(),
		credentialPublicKey: text("credentialPublicKey").notNull(),
		counter: integer("counter").notNull(),
		credentialDeviceType: text("credentialDeviceType").notNull(),
		credentialBackedUp: boolean("credentialBackedUp").notNull(),
		transports: text("transports"),
	},
	(authenticator) => ({
		compositePK: primaryKey({
			columns: [authenticator.userId, authenticator.credentialID],
		}),
	}),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
	user: one(users, {
		fields: [accounts.userId],
		references: [users.id],
	}),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id],
	}),
}));

export const authenticatorsRelations = relations(authenticators, ({ one }) => ({
	user: one(users, {
		fields: [authenticators.userId],
		references: [users.id],
	}),
}));

export const companies = pgTable("company", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: text("name").notNull().unique(),
	email: text("email"),
	phone: text("phone"),
	createdAt: timestamp("createdAt", { mode: "date" })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: timestamp("updatedAt", { mode: "date" })
		.notNull()
		.$defaultFn(() => new Date()),
});

export const usersRelations = relations(users, ({ many }) => ({
	accounts: many(accounts),
	sessions: many(sessions),
	authenticators: many(authenticators),
	companyUsers: many(companyUsers),
}));

export const companyRoleEnum = pgEnum("company_role", ["owner", "member"]);

export const companyUsers = pgTable("companyUsers", {
	companyId: text("companyId")
		.references(() => companies.id, {
			onDelete: "cascade",
		})
		.notNull(),
	userId: text("userId")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	role: companyRoleEnum("role").notNull(),
	createdAt: timestamp("createdAt", { mode: "date" })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: timestamp("updatedAt", { mode: "date" })
		.notNull()
		.$defaultFn(() => new Date()),
});

export const companiesRelations = relations(companies, ({ many }) => ({
	companyUsers: many(companyUsers),
}));

export const companyUsersRelations = relations(companyUsers, ({ one }) => ({
	company: one(companies, {
		fields: [companyUsers.companyId],
		references: [companies.id],
	}),
	user: one(users, {
		fields: [companyUsers.userId],
		references: [users.id],
	}),
}));
