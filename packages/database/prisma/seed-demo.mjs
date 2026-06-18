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

async function upsertDemoWorld(user, demoShop, demoProduct) {
  const region = await prisma.worldRegion.upsert({
    where: { slug: "central-trade-region" },
    update: {
      name: "Central Trade Region",
      description: "The first connected region of the Prontera commerce world.",
      status: "ACTIVE",
      displayOrder: 1,
    },
    create: {
      name: "Central Trade Region",
      slug: "central-trade-region",
      description: "The first connected region of the Prontera commerce world.",
      status: "ACTIVE",
      displayOrder: 1,
    },
  });

  const city = await prisma.worldCity.upsert({
    where: { slug: "merchant-city" },
    update: {
      regionId: region.id,
      name: "Merchant City",
      description:
        "The buyer entry city where shops become places and commerce becomes exploration.",
      status: "ACTIVE",
    },
    create: {
      regionId: region.id,
      name: "Merchant City",
      slug: "merchant-city",
      description:
        "The buyer entry city where shops become places and commerce becomes exploration.",
      status: "ACTIVE",
    },
  });

  const zone = await prisma.worldZone.upsert({
    where: { code: "MERCHANT_WORLD" },
    update: {
      name: "Merchant World",
      description:
        "The connected city and district network for buyer discovery.",
      status: "ACTIVE",
      sortOrder: 1,
    },
    create: {
      code: "MERCHANT_WORLD",
      name: "Merchant World",
      description:
        "The connected city and district network for buyer discovery.",
      status: "ACTIVE",
      sortOrder: 1,
    },
  });

  const districtDefinitions = [
    {
      code: "CENTRAL_MARKET",
      name: "Central Market District",
      description: "The welcoming center of Merchant City for everyday goods.",
      category: "GENERAL",
      sortOrder: 0,
      coordinateX: 50,
      coordinateY: 48,
    },
    {
      code: "TECH_BAZAAR",
      name: "Tech Bazaar",
      description: "Technology shops, equipment, and digital tools.",
      category: "TECH",
      sortOrder: 1,
      coordinateX: 72,
      coordinateY: 34,
    },
    {
      code: "ARTISAN_VALLEY",
      name: "Artisan Valley",
      description: "Independent makers, coffee, craft, and local stories.",
      category: "ARTISAN",
      sortOrder: 2,
      coordinateX: 28,
      coordinateY: 38,
    },
    {
      code: "HARBOR_DISTRICT",
      name: "Harbor District",
      description: "Regional trade, supplies, logistics, and imported goods.",
      category: "HARBOR",
      sortOrder: 3,
      coordinateX: 20,
      coordinateY: 72,
    },
  ];

  const districts = new Map();
  for (const definition of districtDefinitions) {
    const existing = await prisma.worldDistrict.findFirst({
      where: { zoneId: zone.id, code: definition.code },
    });
    const district = existing
      ? await prisma.worldDistrict.update({
          where: { id: existing.id },
          data: {
            name: definition.name,
            description: definition.description,
            category: definition.category,
            sortOrder: definition.sortOrder,
          },
        })
      : await prisma.worldDistrict.create({
          data: {
            zoneId: zone.id,
            code: definition.code,
            name: definition.name,
            description: definition.description,
            category: definition.category,
            sortOrder: definition.sortOrder,
          },
        });

    const districtLocation = await prisma.worldDistrictLocation.findFirst({
      where: { districtId: district.id, cityId: city.id },
    });
    if (districtLocation) {
      await prisma.worldDistrictLocation.update({
        where: { id: districtLocation.id },
        data: {
          coordinateX: definition.coordinateX,
          coordinateY: definition.coordinateY,
          displayOrder: definition.sortOrder,
        },
      });
    } else {
      await prisma.worldDistrictLocation.create({
        data: {
          districtId: district.id,
          cityId: city.id,
          coordinateX: definition.coordinateX,
          coordinateY: definition.coordinateY,
          displayOrder: definition.sortOrder,
        },
      });
    }
    districts.set(definition.code, district);
  }

  const central = districts.get("CENTRAL_MARKET");
  await upsertWorldPlacement({
    shop: demoShop,
    city,
    district: central,
    buildingType: "SMALL",
    storefrontTheme: "CLASSIC",
    buildingStyle: "CLASSIC_SHOP",
    signText: "Demo General Store",
    xCoordinate: 48,
    yCoordinate: 52,
    featured: true,
    isLive: true,
  });

  const promotion =
    (await prisma.promotionCampaign.findFirst({
      where: {
        shopId: demoShop.id,
        name: "Welcome to Merchant City",
        deletedAt: null,
      },
    })) ??
    (await prisma.promotionCampaign.create({
      data: {
        shopId: demoShop.id,
        name: "Welcome to Merchant City",
        description: "A demo launch offer for first-time world visitors.",
        promotionType: "PERCENT_DISCOUNT",
        status: "ACTIVE",
        priority: 100,
        stackable: false,
        createdById: user.id,
      },
    }));

  const promotionRule = await prisma.promotionRule.findFirst({
    where: { campaignId: promotion.id, targetProductId: demoProduct.id },
  });
  if (!promotionRule) {
    await prisma.promotionRule.create({
      data: {
        campaignId: promotion.id,
        discountPercent: 10,
        targetProductId: demoProduct.id,
      },
    });
  }

  const liveChannel = await prisma.shopLiveChannel.findFirst({
    where: {
      shopId: demoShop.id,
      title: "Merchant City Welcome Live",
      deletedAt: null,
    },
  });
  if (liveChannel) {
    await prisma.shopLiveChannel.update({
      where: { id: liveChannel.id },
      data: {
        status: "LIVE",
        startsAt: new Date(),
        endsAt: null,
      },
    });
  } else {
    await prisma.shopLiveChannel.create({
      data: {
        shopId: demoShop.id,
        provider: "YOUTUBE",
        title: "Merchant City Welcome Live",
        description: "Demo live-commerce signal for the buyer world.",
        videoUrl: "https://www.youtube.com/watch?v=prontera-demo",
        embedUrl: "https://www.youtube.com/embed/prontera-demo",
        status: "LIVE",
        startsAt: new Date(),
        createdById: user.id,
      },
    });
  }

  const optionalStores = [
    {
      name: "Tech Bazaar Keyboard Store",
      slug: "tech-bazaar-keyboard-store",
      description: "Mechanical keyboards and creator workstations.",
      districtCode: "TECH_BAZAAR",
      productName: "Demo Mechanical Keyboard",
      productSlug: "demo-mechanical-keyboard",
      sku: "DEMO-KEYBOARD",
      priceCents: 8900,
      buildingType: "MEDIUM",
      storefrontTheme: "TECH",
      buildingStyle: "TECH_STORE",
      xCoordinate: 70,
      yCoordinate: 38,
      isOfficialStore: true,
    },
    {
      name: "Artisan Coffee House",
      slug: "artisan-coffee-house",
      description: "Small-batch coffee and the stories behind every roast.",
      districtCode: "ARTISAN_VALLEY",
      productName: "Demo Artisan Roast",
      productSlug: "demo-artisan-roast",
      sku: "DEMO-COFFEE",
      priceCents: 1800,
      buildingType: "SMALL",
      storefrontTheme: "ARTISAN",
      buildingStyle: "MARKET_STALL",
      xCoordinate: 30,
      yCoordinate: 42,
      isFounder: true,
    },
    {
      name: "Harbor Supply Shop",
      slug: "harbor-supply-shop",
      description:
        "Reliable supplies for merchants moving goods across regions.",
      districtCode: "HARBOR_DISTRICT",
      productName: "Demo Cargo Crate",
      productSlug: "demo-cargo-crate",
      sku: "DEMO-CRATE",
      priceCents: 2400,
      buildingType: "LARGE",
      storefrontTheme: "HARBOR",
      buildingStyle: "PREMIUM_HALL",
      xCoordinate: 24,
      yCoordinate: 70,
    },
  ];

  for (const definition of optionalStores) {
    const shop = await upsertWorldShop(user.id, definition);
    await upsertWorldPlacement({
      shop,
      city,
      district: districts.get(definition.districtCode),
      buildingType: definition.buildingType,
      storefrontTheme: definition.storefrontTheme,
      buildingStyle: definition.buildingStyle,
      signText: definition.name,
      xCoordinate: definition.xCoordinate,
      yCoordinate: definition.yCoordinate,
      isFounder: definition.isFounder ?? false,
      isOfficialStore: definition.isOfficialStore ?? false,
      featured: definition.isFounder ?? false,
    });

    if (definition.isFounder) {
      await prisma.founderMerchantProgram.upsert({
        where: { shopId: shop.id },
        update: {
          isFounderMerchant: true,
          founderExpiresAt: null,
        },
        create: {
          shopId: shop.id,
          isFounderMerchant: true,
          founderGrantedAt: new Date(),
          benefits: {
            founderBadge: true,
            priorityPlacement: true,
          },
        },
      });
    }
  }

  const existingGate = await prisma.commerceGate.findFirst({
    where: { title: "Central Market Warp Gate" },
  });
  if (!existingGate) {
    await prisma.commerceGate.create({
      data: {
        sourceZoneId: zone.id,
        destinationZoneId: zone.id,
        sourceDistrictId: central.id,
        destinationDistrictId: districts.get("TECH_BAZAAR").id,
        title: "Central Market Warp Gate",
        description: "Fast travel from Central Market to Tech Bazaar.",
        gateType: "DISTRICT_GATE",
        status: "ACTIVE",
      },
    });
  }
}

async function upsertWorldShop(ownerId, definition) {
  const existing = await prisma.shop.findFirst({
    where: { slug: definition.slug, deletedAt: null },
  });
  const shop = existing
    ? await prisma.shop.update({
        where: { id: existing.id },
        data: {
          ownerId,
          name: definition.name,
          description: definition.description,
          status: "ACTIVE",
          isPublic: true,
        },
      })
    : await prisma.shop.create({
        data: {
          ownerId,
          name: definition.name,
          slug: definition.slug,
          description: definition.description,
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

  const category =
    (await prisma.category.findFirst({
      where: { shopId: shop.id, slug: "featured-goods", deletedAt: null },
    })) ??
    (await prisma.category.create({
      data: {
        shopId: shop.id,
        name: "Featured Goods",
        slug: "featured-goods",
        status: "ACTIVE",
      },
    }));
  const product =
    (await prisma.product.findFirst({
      where: { shopId: shop.id, sku: definition.sku, deletedAt: null },
    })) ??
    (await prisma.product.create({
      data: {
        shopId: shop.id,
        categoryId: category.id,
        sku: definition.sku,
        name: definition.productName,
        slug: definition.productSlug,
        description: `A featured product from ${definition.name}.`,
        status: "ACTIVE",
      },
    }));
  const variant = await prisma.productVariant.findFirst({
    where: {
      productId: product.id,
      sku: `${definition.sku}-STD`,
      deletedAt: null,
    },
  });
  if (!variant) {
    await prisma.productVariant.create({
      data: {
        productId: product.id,
        sku: `${definition.sku}-STD`,
        name: "Standard",
        priceCents: definition.priceCents,
        currency: "USD",
        status: "ACTIVE",
        inventoryCount: 20,
        isDefault: true,
      },
    });
  }
  return shop;
}

async function upsertWorldPlacement({
  shop,
  city,
  district,
  buildingType,
  storefrontTheme,
  buildingStyle,
  signText,
  xCoordinate,
  yCoordinate,
  featured = false,
  isFounder = false,
  isOfficialStore = false,
  isLive = false,
}) {
  await prisma.merchantBuilding.upsert({
    where: { shopId: shop.id },
    update: {
      districtId: district.id,
      buildingType,
      storefrontTheme,
      buildingLevel: 1,
      signText,
      isFounder,
      isOfficialStore,
      isLive,
      xCoordinate,
      yCoordinate,
      isPublished: true,
    },
    create: {
      shopId: shop.id,
      districtId: district.id,
      buildingType,
      storefrontTheme,
      buildingLevel: 1,
      signText,
      isFounder,
      isOfficialStore,
      isLive,
      xCoordinate,
      yCoordinate,
      isPublished: true,
    },
  });

  await prisma.merchantWorldLocation.upsert({
    where: { shopId: shop.id },
    update: {
      cityId: city.id,
      districtId: district.id,
      buildingStyle,
      storefrontTheme,
      featured,
      founderPlacement: isFounder,
    },
    create: {
      shopId: shop.id,
      cityId: city.id,
      districtId: district.id,
      buildingStyle,
      storefrontTheme,
      featured,
      founderPlacement: isFounder,
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
  await upsertDemoWorld(user, shop, product);

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
