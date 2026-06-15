import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

const demoUser = {
  email: "demo@prontera.local",
  password: "DemoPass123!",
  name: "Demo Merchant",
};

async function upsertFoundationData() {
  await prisma.currency.upsert({
    where: { code: "USD" },
    update: { name: "United States Dollar", symbol: "$", isActive: true },
    create: {
      code: "USD",
      numericCode: "840",
      name: "United States Dollar",
      symbol: "$",
    },
  });

  await prisma.language.upsert({
    where: { code: "en" },
    update: { name: "English", nativeName: "English", isActive: true },
    create: { code: "en", name: "English", nativeName: "English" },
  });

  await prisma.locale.upsert({
    where: { code: "en-US" },
    update: {
      languageCode: "en",
      regionCode: "US",
      name: "English (United States)",
      nativeName: "English (United States)",
      isDefault: true,
    },
    create: {
      code: "en-US",
      languageCode: "en",
      regionCode: "US",
      name: "English (United States)",
      nativeName: "English (United States)",
      isDefault: true,
    },
  });

  await prisma.country.upsert({
    where: { code: "US" },
    update: {
      name: "United States",
      defaultCurrencyCode: "USD",
      defaultLocaleCode: "en-US",
      defaultTimeZone: "America/New_York",
      isActive: true,
    },
    create: {
      code: "US",
      name: "United States",
      defaultCurrencyCode: "USD",
      defaultLocaleCode: "en-US",
      defaultTimeZone: "America/New_York",
    },
  });
}

async function upsertDemoUser() {
  const passwordHash = await argon2.hash(demoUser.password, {
    type: argon2.argon2id,
    memoryCost: 65_536,
    timeCost: 3,
    parallelism: 1,
  });

  const role =
    (await prisma.role.findFirst({
      where: { code: "merchant", deletedAt: null },
    })) ??
    (await prisma.role.create({
      data: { code: "merchant", name: "Merchant" },
    }));

  const existing = await prisma.user.findFirst({
    where: { email: demoUser.email, deletedAt: null },
  });

  const user = existing
    ? await prisma.user.update({
        where: { id: existing.id },
        data: {
          name: demoUser.name,
          passwordHash,
          status: "ACTIVE",
          countryCode: "US",
          localeCode: "en-US",
          preferredLocale: "en-US",
          preferredCurrency: "USD",
          timeZone: "America/New_York",
        },
      })
    : await prisma.user.create({
        data: {
          email: demoUser.email,
          name: demoUser.name,
          passwordHash,
          status: "ACTIVE",
          countryCode: "US",
          localeCode: "en-US",
          preferredLocale: "en-US",
          preferredCurrency: "USD",
          timeZone: "America/New_York",
        },
      });

  const userRole = await prisma.userRole.findFirst({
    where: { userId: user.id, roleId: role.id, deletedAt: null },
  });

  if (!userRole) {
    await prisma.userRole.create({
      data: { userId: user.id, roleId: role.id },
    });
  }

  return user;
}

async function upsertDemoShop(userId) {
  const existing = await prisma.shop.findFirst({
    where: { slug: "demo-general-store", deletedAt: null },
  });

  const shop = existing
    ? await prisma.shop.update({
        where: { id: existing.id },
        data: {
          ownerId: userId,
          name: "Demo General Store",
          description: "A local demo shop for testing Prontera Merchant OS.",
          status: "ACTIVE",
          isPublic: true,
          countryCode: "US",
          localeCode: "en-US",
          currencyCode: "USD",
          preferredLocale: "en-US",
          preferredCurrency: "USD",
          timeZone: "America/New_York",
        },
      })
    : await prisma.shop.create({
        data: {
          ownerId: userId,
          name: "Demo General Store",
          slug: "demo-general-store",
          description: "A local demo shop for testing Prontera Merchant OS.",
          status: "ACTIVE",
          isPublic: true,
          countryCode: "US",
          localeCode: "en-US",
          currencyCode: "USD",
          preferredLocale: "en-US",
          preferredCurrency: "USD",
          timeZone: "America/New_York",
        },
      });

  const ownerStaff = await prisma.shopStaff.findFirst({
    where: { shopId: shop.id, userId, role: "OWNER", deletedAt: null },
  });

  if (!ownerStaff) {
    await prisma.shopStaff.create({
      data: {
        shopId: shop.id,
        userId,
        status: "ACTIVE",
        role: "OWNER",
        title: "Owner",
      },
    });
  }

  return shop;
}

async function upsertCatalog(shopId) {
  const category =
    (await prisma.category.findFirst({
      where: { shopId, slug: "demo-goods", deletedAt: null },
    })) ??
    (await prisma.category.create({
      data: {
        shopId,
        name: "Demo Goods",
        slug: "demo-goods",
        description: "Sample category for onboarding.",
        status: "ACTIVE",
      },
    }));

  const categoryTranslation = await prisma.categoryTranslation.findFirst({
    where: { categoryId: category.id, localeCode: "en-US", deletedAt: null },
  });

  if (!categoryTranslation) {
    await prisma.categoryTranslation.create({
      data: {
        categoryId: category.id,
        localeCode: "en-US",
        name: "Demo Goods",
        description: "Sample category for onboarding.",
      },
    });
  }

  const product =
    (await prisma.product.findFirst({
      where: { shopId, sku: "DEMO-POTION", deletedAt: null },
    })) ??
    (await prisma.product.create({
      data: {
        shopId,
        categoryId: category.id,
        sku: "DEMO-POTION",
        name: "Demo Potion",
        slug: "demo-potion",
        description: "A sample product for dashboard testing.",
        status: "ACTIVE",
      },
    }));

  await prisma.product.update({
    where: { id: product.id },
    data: {
      categoryId: category.id,
      name: "Demo Potion",
      slug: "demo-potion",
      description: "A sample product for dashboard testing.",
      status: "ACTIVE",
    },
  });

  const productTranslation = await prisma.productTranslation.findFirst({
    where: { productId: product.id, localeCode: "en-US", deletedAt: null },
  });

  if (!productTranslation) {
    await prisma.productTranslation.create({
      data: {
        productId: product.id,
        localeCode: "en-US",
        name: "Demo Potion",
        slug: "demo-potion",
        shortDescription: "Sample item",
        description: "A sample product for dashboard testing.",
      },
    });
  }

  const variant =
    (await prisma.productVariant.findFirst({
      where: { productId: product.id, sku: "DEMO-POTION-STD", deletedAt: null },
    })) ??
    (await prisma.productVariant.create({
      data: {
        productId: product.id,
        sku: "DEMO-POTION-STD",
        name: "Standard",
        priceCents: 1299,
        compareAtPriceCents: 1599,
        currency: "USD",
        status: "ACTIVE",
        inventoryCount: 25,
        isDefault: true,
      },
    }));

  await prisma.productVariant.update({
    where: { id: variant.id },
    data: {
      name: "Standard",
      priceCents: 1299,
      compareAtPriceCents: 1599,
      currency: "USD",
      status: "ACTIVE",
      inventoryCount: 25,
      isDefault: true,
    },
  });

  return { product, variant };
}

async function upsertInventory(shopId, variantId, userId) {
  const warehouse =
    (await prisma.warehouse.findFirst({
      where: { shopId, code: "MAIN", deletedAt: null },
    })) ??
    (await prisma.warehouse.create({
      data: {
        shopId,
        name: "Main Warehouse",
        code: "MAIN",
        address: "Local demo warehouse",
        countryCode: "US",
        timeZone: "America/New_York",
        status: "ACTIVE",
      },
    }));

  const inventoryItem =
    (await prisma.inventoryItem.findFirst({
      where: {
        warehouseId: warehouse.id,
        productVariantId: variantId,
        deletedAt: null,
      },
    })) ??
    (await prisma.inventoryItem.create({
      data: {
        warehouseId: warehouse.id,
        productVariantId: variantId,
        sku: "DEMO-POTION-STD",
        quantityOnHand: 25,
        quantityReserved: 2,
        reorderPoint: 10,
        reorderQuantity: 20,
        status: "ACTIVE",
      },
    }));

  await prisma.inventoryItem.update({
    where: { id: inventoryItem.id },
    data: {
      quantityOnHand: 25,
      quantityReserved: 2,
      reorderPoint: 10,
      reorderQuantity: 20,
      status: "ACTIVE",
    },
  });

  const movement = await prisma.inventoryMovement.findFirst({
    where: {
      inventoryItemId: inventoryItem.id,
      referenceNumber: "DEMO-SEED-INBOUND",
    },
  });

  if (!movement) {
    await prisma.inventoryMovement.create({
      data: {
        inventoryItemId: inventoryItem.id,
        movementType: "INBOUND",
        quantity: 25,
        referenceNumber: "DEMO-SEED-INBOUND",
        notes: "Demo seed opening stock.",
        performedBy: userId,
      },
    });
  }

  const alert = await prisma.inventoryAlert.findFirst({
    where: {
      inventoryItemId: inventoryItem.id,
      alertType: "LOW_STOCK",
      deletedAt: null,
    },
  });

  if (!alert) {
    await prisma.inventoryAlert.create({
      data: {
        inventoryItemId: inventoryItem.id,
        alertType: "LOW_STOCK",
        threshold: 10,
        currentQuantity: 23,
        status: "OPEN",
      },
    });
  }

  return inventoryItem;
}

async function upsertDemoOrder(shopId, userId, productId, variantId) {
  const existing = await prisma.order.findFirst({
    where: { shopId, orderNumber: "DEMO-ORDER-0001", deletedAt: null },
  });

  if (existing) {
    return existing;
  }

  return prisma.order.create({
    data: {
      shopId,
      customerId: userId,
      orderNumber: "DEMO-ORDER-0001",
      status: "PENDING",
      subtotal: 1299,
      discount: 0,
      tax: 0,
      total: 1299,
      currency: "USD",
      notes: "Demo order placeholder for dashboard testing.",
      items: {
        create: {
          productId,
          productVariantId: variantId,
          quantity: 1,
          unitPrice: 1299,
          totalPrice: 1299,
          productName: "Demo Potion",
          productVariantName: "Standard",
          sku: "DEMO-POTION-STD",
        },
      },
      paymentRecords: {
        create: {
          amount: 1299,
          currency: "USD",
          method: "MANUAL",
          status: "PENDING",
          referenceNumber: "DEMO-PAYMENT-0001",
        },
      },
    },
  });
}

async function main() {
  await upsertFoundationData();
  const user = await upsertDemoUser();
  const shop = await upsertDemoShop(user.id);
  const { product, variant } = await upsertCatalog(shop.id);
  await upsertInventory(shop.id, variant.id, user.id);
  await upsertDemoOrder(shop.id, user.id, product.id, variant.id);

  console.log("Demo seed complete.");
  console.log(`Email: ${demoUser.email}`);
  console.log(`Password: ${demoUser.password}`);
}

main()
  .catch((error) => {
    console.error("Demo seed failed.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
