import { USER_ROLE_ARRAY } from "@/schemas/user";
import { relations, sql } from "drizzle-orm";
import {
  pgTableCreator,
  primaryKey,
  text,
  varchar,
  pgEnum,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
// export const createTable = pgTableCreator((name) => `sol-pos_${name}`);
export const createTable = pgTableCreator((name) => `${name}`);


export const userRoleEnum = pgEnum('userRoleEnum', USER_ROLE_ARRAY);

export const userTable = createTable(
  "user", 
  {
    id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
    username: varchar("username", { length: 255 }).notNull().unique(),
    password: text("password").notNull(),
    name: varchar("name", { length: 255 }),
    role: userRoleEnum('role').default('CASHIER').notNull(),

    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }
);

export const userRelations = relations(userTable, ({ many }) => ({
  stores: many(userToStoreTable)
}));

export const userToStoreTable = createTable(
  "user-to-store",
  {
    userId: varchar("userId", { length: 255 }).notNull().references(() => userTable.id),
    storeId: varchar("storeId", { length: 255 }).notNull().references(() => storeTable.id),

    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (uts) => ({
    compoundKey: primaryKey({ columns: [uts.userId, uts.storeId] }),
  })
);

export const userToStoreRelations = relations(userToStoreTable, ({ one }) => ({
  user: one(userTable, {
    fields: [userToStoreTable.userId],
    references: [userTable.id],
  }),
  store: one(storeTable, {
    fields: [userToStoreTable.storeId],
    references: [storeTable.id],
  }),
}));

export const storeTable = createTable(
  "store",
  {
    id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 255 }).notNull(),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
);

export const storeRelations = relations(storeTable, ({ many }) => ({
  pos: many(posTable),
  users: many(userToStoreTable),
  products: many(productToStoreTable),
  orders: many(orderTable)
}));

export const posTable = createTable(
  "pos",
  {
    id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 255 }).notNull(),
    storeId: varchar("storeId", { length: 255 }).notNull().references(() => storeTable.id),

    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    deletedAt: timestamp("deleted_at"),
  },
);

export const posRelations = relations(posTable, ({ one, many }) => ({
  store: one(storeTable, {
    fields: [posTable.storeId],
    references: [storeTable.id],
  }),
  orders: many(orderTable)
}));

export const ORDER_STATUS_ARRAY = ["CART", "PAID", "CANCELLED"] as const;
export const orderStatusEnum = pgEnum('orderStatusEnum', ORDER_STATUS_ARRAY);

export const orderTable = createTable(
  "order",
  {
    id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
    storeId: varchar("storeId", { length: 255 }).notNull().references(() => storeTable.id),
    posId: varchar("posId", { length: 255 }).notNull().references(() => posTable.id),
    status: orderStatusEnum('status').default('CART').notNull(),

    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
);

export const orderRelations = relations(orderTable, ({ one, many }) => ({
  store: one(storeTable, {
    fields: [orderTable.storeId],
    references: [storeTable.id],
  }),
  pos: one(posTable, {
    fields: [orderTable.posId],
    references: [posTable.id],
  }),
  items: many(orderItemTable),
  transaction: one(transactionTable, {
    fields: [orderTable.id],
    references: [transactionTable.orderId],
  })
}));

export const orderItemTable = createTable(
  "order_item",
  {
    id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
    orderId: varchar("orderId", { length: 255 }).notNull().references(() => orderTable.id),
    productId: varchar("productId", { length: 255 }).notNull().references(() => productTable.id),
    quantity: varchar("quantity", { length: 255 }).notNull(),
    price: integer("price").notNull(), // in cents

    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
);

export const orderItemRelations = relations(orderItemTable, ({ one }) => ({
  product: one(productTable, {
    fields: [orderItemTable.productId],
    references: [productTable.id],
  }),
  order: one(orderTable, {
    fields: [orderItemTable.orderId],
    references: [orderTable.id],
  }),
}));


export const TRANSACTION_STATUS_ARRAY = ["SUCCESS", "FAILURE", "FINALIZED"] as const;
export const transactionStatusEnum = pgEnum('transactionStatusEnum', TRANSACTION_STATUS_ARRAY);

export const transactionTable = createTable(
  "transaction",
  {
    id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
    orderId: varchar("orderId", { length: 255 }).notNull().references(() => orderTable.id),

    signature: text("signature"),
    // block: text("block"),
    // timestamp: timestamp("timestamp"),
    // status: transactionStatusEnum('status'),
    // signer: text("signer"),
    // fee: integer("fee"),
    // mainActions: jsonb('mainActions').$type<{}[]>(),
    // // txMap: text("txMap"),
    // yourNotes: text("yourNotes"),

    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
);

export const transactionRelations = relations(transactionTable, ({ one }) => ({
  order: one(orderTable, {
    fields: [transactionTable.orderId],
    references: [orderTable.id],
  }),
}));

export const productTable = createTable(
  "product",
  {
    id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 255 }).notNull(),
    price: integer("price").notNull(), // in cents

    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    deletedAt: timestamp("deleted_at"),
  },
);

export const productRelations = relations(productTable, ({ many }) => ({
  orderItem: many(orderItemTable),
  stores: many(productToStoreTable)
}));

export const productToStoreTable = createTable(
  "product-to-store",
  {
    productId: varchar("productId", { length: 255 }).notNull().references(() => productTable.id),
    storeId: varchar("storeId", { length: 255 }).notNull().references(() => storeTable.id),
    quantity: integer("quantity").notNull(),

    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt")
    .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (pts) => ({
    compoundKey: primaryKey({ columns: [pts.productId, pts.storeId] }),
  })
);

export const productToStoresRelations = relations(productToStoreTable, ({ one }) => ({
  product: one(productTable, {
    fields: [productToStoreTable.productId],
    references: [productTable.id],
  }),
  store: one(storeTable, {
    fields: [productToStoreTable.storeId],
    references: [storeTable.id],
  }),
}));