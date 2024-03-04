import { hashPassword } from "@/lib/hash";
import { db } from ".";
import { posTable, productTable, productToStoreTable, storeTable, userTable, userToStoreTable } from "./schema";

const main = async () => {
  console.log("Seed start");
  const [createdAdmin] = await db.insert(userTable).values({
    name: "Admin #1",
    username: "admin",
    password: hashPassword("admin"),
    role: "ADMIN",
  }).returning();
  const [createdCashier] =await db.insert(userTable).values({
    name: "Cashier #1",
    username: "cashier",
    password: hashPassword("cashier"),
    role: "CASHIER",
  }).returning();

  const [createdStore] = await db.insert(storeTable).values({
    name: "Store #1",
  }).returning();
  const [createdPos] = await db.insert(posTable).values({
    name: "POS #1",
    storeId: createdStore?.id ?? "",
  }).returning();
  const [createdUserToStore1] = await db.insert(userToStoreTable).values({
    userId: createdCashier?.id ?? "",
    storeId: createdStore?.id ?? "",
  }).returning();
  const [createdUser1ToStore2] = await db.insert(userToStoreTable).values({
    userId: createdAdmin?.id ?? "",
    storeId: createdStore?.id ?? "",
  }).returning();


  const [createdProduct1] = await db.insert(productTable).values({
    name: "Product #1",
    price: 1000,
  }).returning();
  const [createdProduct2] = await db.insert(productTable).values({
    name: "Product #2",
    price: 2000,
  }).returning();
  const [createdProduct3] = await db.insert(productTable).values({
    name: "Product #3",
    price: 3000,
  }).returning();
  const [createdProduct4] = await db.insert(productTable).values({
    name: "Product #4",
    price: 4000,
  }).returning();
  const [createdProduct5] = await db.insert(productTable).values({
    name: "Product #5",
    price: 5000,
  }).returning();

  await db.insert(productToStoreTable).values({
    productId: createdProduct1?.id ?? "",
    storeId: createdStore?.id ?? "",
    quantity: 10,
  });
  await db.insert(productToStoreTable).values({
    productId: createdProduct2?.id ?? "",
    storeId: createdStore?.id ?? "",
    quantity: 20,
  });
  await db.insert(productToStoreTable).values({
    productId: createdProduct3?.id ?? "",
    storeId: createdStore?.id ?? "",
    quantity: 30,
  });
  await db.insert(productToStoreTable).values({
    productId: createdProduct4?.id ?? "",
    storeId: createdStore?.id ?? "",
    quantity: 40,
  });

  console.log("Seed done");
};

main().catch((err) => console.log(err)).finally(() => process.exit(0));