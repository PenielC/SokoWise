import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/db/client";
import { normalizeProductName } from "../lib/search/normalize";

// Clearly-labelled demo data for a Zimbabwe/Africa context — see spec §17.
// These are fictional prices for demonstration only, not real-world current
// prices (spec §17/§21).
const DEMO_PASSWORD = process.env.SEED_DEMO_PASSWORD;
if (!DEMO_PASSWORD) {
  throw new Error("SEED_DEMO_PASSWORD must be set before seeding (see .env.example).");
}

const hoursAgo = (h: number) => new Date(Date.now() - h * 60 * 60 * 1000);

async function upsertUser(input: {
  email: string;
  name: string;
  systemRole?: "USER" | "ADMIN";
  phone?: string;
}) {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD!, 10);
  return prisma.user.upsert({
    where: { email: input.email },
    update: { name: input.name, systemRole: input.systemRole ?? "USER", phone: input.phone },
    create: {
      email: input.email,
      name: input.name,
      passwordHash,
      systemRole: input.systemRole ?? "USER",
      phone: input.phone,
    },
  });
}

async function upsertSeller(input: {
  userId?: string;
  businessName: string;
  sellerType:
    | "SUPERMARKET"
    | "GROCERY"
    | "WHOLESALER"
    | "MARKET_SELLER"
    | "INDEPENDENT_RETAILER";
  country?: "ZIMBABWE" | "KENYA" | "SOUTH_AFRICA" | "NIGERIA" | "GHANA" | "UGANDA" | "TANZANIA" | "ZAMBIA" | "MOZAMBIQUE" | "BOTSWANA";
  location: string;
  city?: string;
  verificationStatus?: "UNVERIFIED" | "VERIFIED" | "SUSPENDED";
  contactPhone?: string;
}) {
  const existing = await prisma.seller.findFirst({ where: { businessName: input.businessName } });
  if (existing) {
    return prisma.seller.update({
      where: { id: existing.id },
      data: {
        sellerType: input.sellerType,
        country: input.country ?? "ZIMBABWE",
        location: input.location,
        city: input.city ?? "Harare",
        verificationStatus: input.verificationStatus ?? "UNVERIFIED",
        contactPhone: input.contactPhone,
      },
    });
  }
  return prisma.seller.create({
    data: {
      userId: input.userId,
      businessName: input.businessName,
      sellerType: input.sellerType,
      country: input.country ?? "ZIMBABWE",
      location: input.location,
      city: input.city ?? "Harare",
      verificationStatus: input.verificationStatus ?? "UNVERIFIED",
      contactPhone: input.contactPhone,
    },
  });
}

async function upsertProduct(input: {
  name: string;
  category: string;
  unit: string;
  brand?: string;
}) {
  const normalizedName = normalizeProductName(input.name);
  const existing = await prisma.product.findFirst({ where: { name: input.name } });
  if (existing) {
    return prisma.product.update({
      where: { id: existing.id },
      data: { normalizedName, category: input.category, unit: input.unit, brand: input.brand },
    });
  }
  return prisma.product.create({
    data: {
      name: input.name,
      normalizedName,
      category: input.category,
      unit: input.unit,
      brand: input.brand,
    },
  });
}

async function createPriceReport(input: {
  productId: string;
  sellerId: string;
  sourceType: "SELLER" | "COMMUNITY";
  price: number;
  currency?: string;
  submittedById: string;
  ageHours: number;
  confirmedBy?: string[];
  flaggedBy?: { userId: string; reason: "OUTDATED" | "INCORRECT_PRICE" | "SELLER_NOT_FOUND" | "SUSPICIOUS" | "OTHER" }[];
}) {
  const submittedAt = hoursAgo(input.ageHours);

  const report = await prisma.priceReport.create({
    data: {
      productId: input.productId,
      sellerId: input.sellerId,
      sourceType: input.sourceType,
      price: input.price,
      currency: input.currency ?? "USD",
      submittedById: input.submittedById,
      submittedAt,
      lastVerifiedAt: submittedAt,
    },
  });

  for (const userId of input.confirmedBy ?? []) {
    await prisma.priceConfirmation.create({
      data: { priceReportId: report.id, userId, confirmationType: "STILL_ACCURATE" },
    });
  }

  for (const flag of input.flaggedBy ?? []) {
    await prisma.flag.create({
      data: { priceReportId: report.id, userId: flag.userId, reason: flag.reason },
    });
  }

  return report;
}

async function main() {
  // --- Users -----------------------------------------------------------
  const admin = await upsertUser({ email: "admin@sokowise.test", name: "Admin User", systemRole: "ADMIN" });
  const sellerUser1 = await upsertUser({ email: "sunrise@sokowise.test", name: "Tapiwa Sunrise" });
  const sellerUser2 = await upsertUser({ email: "mbarefresh@sokowise.test", name: "Chido Mbare" });
  const sellerUser3 = await upsertUser({ email: "chitungwiza@sokowise.test", name: "Blessing Wholesale" });
  const community1 = await upsertUser({ email: "tendai@sokowise.test", name: "Tendai M." });
  const community2 = await upsertUser({ email: "rufaro@sokowise.test", name: "Rufaro C." });
  const consumer1 = await upsertUser({ email: "farai@sokowise.test", name: "Farai N." });

  // Kenya — demonstrates the platform isn't hardcoded to Zimbabwe (see
  // lib/validation/country.ts and the Country/City filters).
  const keSellerUser1 = await upsertUser({ email: "westlands@sokowise.test", name: "Njeri Kamau" });
  const keSellerUser2 = await upsertUser({ email: "kibera@sokowise.test", name: "Otieno Odhiambo" });
  const keSellerUser3 = await upsertUser({ email: "eastleigh@sokowise.test", name: "Amina Hassan" });
  const keCommunity1 = await upsertUser({ email: "wanjiru@sokowise.test", name: "Wanjiru M." });
  const keCommunity2 = await upsertUser({ email: "kiprono@sokowise.test", name: "Kiprono K." });

  // --- Sellers -----------------------------------------------------------
  const sunrise = await upsertSeller({
    userId: sellerUser1.id,
    businessName: "Sunrise Supermarket",
    sellerType: "SUPERMARKET",
    location: "Avondale",
    verificationStatus: "VERIFIED",
    contactPhone: "+263 77 123 4567",
  });
  const mbareFresh = await upsertSeller({
    userId: sellerUser2.id,
    businessName: "Mbare Fresh Grocery",
    sellerType: "GROCERY",
    location: "Mbare",
    verificationStatus: "VERIFIED",
    contactPhone: "+263 77 234 5678",
  });
  const chitungwizaWholesale = await upsertSeller({
    userId: sellerUser3.id,
    businessName: "Chitungwiza Wholesale Traders",
    sellerType: "WHOLESALER",
    location: "Chitungwiza",
    verificationStatus: "UNVERIFIED",
    contactPhone: "+263 77 345 6789",
  });
  // Informal sellers with no online presence and no linked account — the
  // exact scenario the product exists to address (spec §1/§4).
  const mbudziStall = await upsertSeller({
    businessName: "Mbudzi Market Stall 12",
    sellerType: "MARKET_SELLER",
    location: "Mbudzi Market",
    verificationStatus: "UNVERIFIED",
  });
  const cornerShop = await upsertSeller({
    businessName: "Corner Shop Chisipite",
    sellerType: "INDEPENDENT_RETAILER",
    location: "Chisipite",
    verificationStatus: "VERIFIED",
  });

  // --- Sellers: Kenya --------------------------------------------------------
  const westlandsFreshMart = await upsertSeller({
    userId: keSellerUser1.id,
    businessName: "Westlands Fresh Mart",
    sellerType: "SUPERMARKET",
    country: "KENYA",
    location: "Westlands",
    city: "Nairobi",
    verificationStatus: "VERIFIED",
    contactPhone: "+254 71 234 5678",
  });
  const kiberaGrocery = await upsertSeller({
    userId: keSellerUser2.id,
    businessName: "Kibera Grocery Corner",
    sellerType: "GROCERY",
    country: "KENYA",
    location: "Kibera",
    city: "Nairobi",
    verificationStatus: "UNVERIFIED",
    contactPhone: "+254 72 345 6789",
  });
  const eastleighWholesale = await upsertSeller({
    userId: keSellerUser3.id,
    businessName: "Eastleigh Wholesale Traders",
    sellerType: "WHOLESALER",
    country: "KENYA",
    location: "Eastleigh",
    city: "Nairobi",
    verificationStatus: "UNVERIFIED",
    contactPhone: "+254 73 456 7890",
  });
  // Informal Kenyan sellers with no online presence and no linked account —
  // same "sellers with no online presence" scenario as the Zimbabwe data,
  // just in a different country.
  const gikombaStall = await upsertSeller({
    businessName: "Gikomba Market Stall 7",
    sellerType: "MARKET_SELLER",
    country: "KENYA",
    location: "Gikomba Market",
    city: "Nairobi",
    verificationStatus: "UNVERIFIED",
  });
  const kilimaniShop = await upsertSeller({
    businessName: "Kilimani Corner Shop",
    sellerType: "INDEPENDENT_RETAILER",
    country: "KENYA",
    location: "Kilimani",
    city: "Nairobi",
    verificationStatus: "VERIFIED",
  });

  // --- Products ------------------------------------------------------------
  const cookingOil = await upsertProduct({ name: "Cooking Oil 5L", category: "Cooking Oil", unit: "5L" });
  const mealieMeal = await upsertProduct({ name: "Mealie Meal 20kg", category: "Grain & Mealie Meal", unit: "20kg" });
  const rice = await upsertProduct({ name: "Rice 2kg", category: "Grain & Mealie Meal", unit: "2kg" });
  const sugar = await upsertProduct({ name: "Sugar 2kg", category: "Pantry", unit: "2kg" });
  const washingPowder = await upsertProduct({ name: "Washing Powder 2kg", category: "Household", unit: "2kg" });
  const bread = await upsertProduct({ name: "Bread", category: "Bakery", unit: "1 loaf" });
  await upsertProduct({ name: "Milk 1L", category: "Dairy", unit: "1L" }); // intentionally zero reports below

  // --- Products: Kenya ---------------------------------------------------
  // Genuinely Kenya-specific staples, not just the Zimbabwean list with a
  // different currency — "seed products for Kenya" means actual local
  // products, e.g. unga (maize flour) rather than Zimbabwe's 20kg mealie
  // meal sacks, and sukuma wiki, a staple leafy green.
  const unga = await upsertProduct({ name: "Unga (Maize Flour) 2kg", category: "Grain & Flour", unit: "2kg" });
  const sukumaWiki = await upsertProduct({ name: "Sukuma Wiki (Kale)", category: "Vegetables", unit: "1 bunch" });
  const cookingOil2L = await upsertProduct({ name: "Cooking Oil 2L", category: "Cooking Oil", unit: "2L" });

  // --- Price reports ---------------------------------------------------
  // Only seed reports if this product has none yet, so re-running the seed
  // doesn't pile up duplicate reports (idempotent per spec §17).
  const cookingOilReportCount = await prisma.priceReport.count({ where: { productId: cookingOil.id } });
  if (cookingOilReportCount === 0) {
    // "BEST VALUE" — reproduces spec §7's Shop B: $11.90, ~5h old, 3 confirmations.
    await createPriceReport({
      productId: cookingOil.id,
      sellerId: sunrise.id,
      sourceType: "SELLER",
      price: 11.9,
      submittedById: sellerUser1.id,
      ageHours: 5,
      confirmedBy: [consumer1.id, community1.id, community2.id],
    });
    // "LOWEST REPORTED" — reproduces spec §7's Seller C: $10.80, 2h old, 1 confirmation.
    await createPriceReport({
      productId: cookingOil.id,
      sellerId: mbudziStall.id,
      sourceType: "COMMUNITY",
      price: 10.8,
      submittedById: community1.id,
      ageHours: 2,
      confirmedBy: [consumer1.id],
    });
    // "Flagged for review" — also the seeded OPEN flag for the admin demo.
    await createPriceReport({
      productId: cookingOil.id,
      sellerId: chitungwizaWholesale.id,
      sourceType: "SELLER",
      price: 9.5,
      submittedById: sellerUser3.id,
      ageHours: 10,
      flaggedBy: [{ userId: consumer1.id, reason: "SUSPICIOUS" }],
    });
    // "Possibly outdated" — submitted over 72 hours ago, never re-confirmed.
    await createPriceReport({
      productId: cookingOil.id,
      sellerId: cornerShop.id,
      sourceType: "COMMUNITY",
      price: 13.0,
      submittedById: community2.id,
      ageHours: 100,
    });
    // "Newly reported" — submitted moments ago, no confirmations yet.
    await createPriceReport({
      productId: cookingOil.id,
      sellerId: mbareFresh.id,
      sourceType: "SELLER",
      price: 12.2,
      submittedById: sellerUser2.id,
      ageHours: 0.5,
    });
  }

  const riceReportCount = await prisma.priceReport.count({ where: { productId: rice.id } });
  if (riceReportCount === 0) {
    // Wide, unconfirmed price spread -> triggers the conflicting-reports banner.
    await createPriceReport({
      productId: rice.id,
      sellerId: sunrise.id,
      sourceType: "SELLER",
      price: 3.5,
      submittedById: sellerUser1.id,
      ageHours: 3,
    });
    await createPriceReport({
      productId: rice.id,
      sellerId: mbudziStall.id,
      sourceType: "COMMUNITY",
      price: 6.5,
      submittedById: community1.id,
      ageHours: 1,
    });
  }

  if ((await prisma.priceReport.count({ where: { productId: mealieMeal.id } })) === 0) {
    await createPriceReport({
      productId: mealieMeal.id,
      sellerId: mbareFresh.id,
      sourceType: "SELLER",
      price: 14.0,
      submittedById: sellerUser2.id,
      ageHours: 6,
      confirmedBy: [consumer1.id],
    });
  }

  if ((await prisma.priceReport.count({ where: { productId: sugar.id } })) === 0) {
    await createPriceReport({
      productId: sugar.id,
      sellerId: sunrise.id,
      sourceType: "SELLER",
      price: 2.8,
      submittedById: sellerUser1.id,
      ageHours: 20,
    });
  }

  if ((await prisma.priceReport.count({ where: { productId: washingPowder.id } })) === 0) {
    await createPriceReport({
      productId: washingPowder.id,
      sellerId: cornerShop.id,
      sourceType: "COMMUNITY",
      price: 4.2,
      submittedById: community2.id,
      ageHours: 8,
      confirmedBy: [consumer1.id, community1.id],
    });
  }

  if ((await prisma.priceReport.count({ where: { productId: bread.id } })) === 0) {
    await createPriceReport({
      productId: bread.id,
      sellerId: mbudziStall.id,
      sourceType: "COMMUNITY",
      price: 1.2,
      submittedById: community1.id,
      ageHours: 4,
    });
  }
  // Milk 1L intentionally has zero reports — demonstrates the no-data state.

  // --- Price reports: Kenya (KES) -----------------------------------------
  if ((await prisma.priceReport.count({ where: { productId: unga.id } })) === 0) {
    // BEST VALUE-ish: fresher, more confirmed, slightly higher price.
    await createPriceReport({
      productId: unga.id,
      sellerId: westlandsFreshMart.id,
      sourceType: "SELLER",
      price: 220,
      currency: "KES",
      submittedById: keSellerUser1.id,
      ageHours: 3,
      confirmedBy: [keCommunity1.id, keCommunity2.id],
    });
    // LOWEST REPORTED: cheaper, informal seller, less confirmed.
    await createPriceReport({
      productId: unga.id,
      sellerId: gikombaStall.id,
      sourceType: "COMMUNITY",
      price: 190,
      currency: "KES",
      submittedById: keCommunity1.id,
      ageHours: 1,
    });
  }

  if ((await prisma.priceReport.count({ where: { productId: sukumaWiki.id } })) === 0) {
    await createPriceReport({
      productId: sukumaWiki.id,
      sellerId: kiberaGrocery.id,
      sourceType: "SELLER",
      price: 20,
      currency: "KES",
      submittedById: keSellerUser2.id,
      ageHours: 5,
      confirmedBy: [keCommunity2.id],
    });
  }

  if ((await prisma.priceReport.count({ where: { productId: cookingOil2L.id } })) === 0) {
    await createPriceReport({
      productId: cookingOil2L.id,
      sellerId: eastleighWholesale.id,
      sourceType: "SELLER",
      price: 480,
      currency: "KES",
      submittedById: keSellerUser3.id,
      ageHours: 10,
      confirmedBy: [keCommunity1.id],
    });
    // "Possibly outdated" — submitted over 72 hours ago, never re-confirmed.
    await createPriceReport({
      productId: cookingOil2L.id,
      sellerId: kilimaniShop.id,
      sourceType: "COMMUNITY",
      price: 510,
      currency: "KES",
      submittedById: keCommunity2.id,
      ageHours: 80,
    });
  }

  // --- Audit log -----------------------------------------------------------
  const auditLogCount = await prisma.auditLog.count();
  if (auditLogCount === 0) {
    await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        action: "SEED_DATA_INITIALIZED",
        entityType: "System",
        entityId: "seed",
        metadata: { note: "Demo data seeded for local development / hackathon judging." },
      },
    });
  }

  console.log("Seed complete.");
  console.log(`Demo password for all seeded accounts: ${DEMO_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
