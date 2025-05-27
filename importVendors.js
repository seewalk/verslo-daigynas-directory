const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const vendors = require("./vendors.json");
const serviceAccount = require("./serviceAccountKey.json");

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

async function importVendors() {
  for (const vendor of Object.values(vendors)) {
    try {
      const enrichedVendor = {
        ...vendor,
        verificationLevel: "none",
        verificationStatus: {
          email: { verified: false, verifiedAt: null },
          phone: { verified: false, verifiedAt: null },
          address: { verified: false, verifiedAt: null },
          documents: { verified: false, verifiedAt: null },
          physicalAudit: { verified: false, verifiedAt: null, auditor: null },
        },
        verificationDocuments: [],
        complianceBadges: [],
        trustMetrics: {
          overallScore: 0,
          responseRate: 0,
          responseTime: 0,
          profileCompleteness: 0,
          verificationLevel: 0,
          yearsInBusiness: 0,
          reviewScore: vendor.googleReview?.rating || 0,
          reviewCount: vendor.googleReview?.reviewCount || 0,
          disputeResolutionRate: 0,
          lastUpdated: Timestamp.now()
        },
        businessHours: {
          monday: { open: "09:00", close: "18:00", isOpen24Hours: false, isClosed: false },
          tuesday: { open: "09:00", close: "18:00", isOpen24Hours: false, isClosed: false },
          wednesday: { open: "09:00", close: "18:00", isOpen24Hours: false, isClosed: false },
          thursday: { open: "09:00", close: "18:00", isOpen24Hours: false, isClosed: false },
          friday: { open: "09:00", close: "18:00", isOpen24Hours: false, isClosed: false },
          saturday: { isClosed: true },
          sunday: { isClosed: true },
          holidays: [],
          timezone: "Europe/Vilnius"
        },
        currentStatus: {
          isOpen: true,
          reopensAt: null,
          closesAt: null,
          specialHours: false
        }
      };

      await db.collection("vendors").doc(vendor.id).set(enrichedVendor, { merge: true });
      console.log(`✅ Imported: ${vendor.name}`);
    } catch (error) {
      console.error(`❌ Failed to import ${vendor.name}:`, error);
    }
  }
}

importVendors();

