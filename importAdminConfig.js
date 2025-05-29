const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const serviceAccount = require("./serviceAccountKey.json");

// Initialize Firebase
initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

async function importAdminData() {
  try {
    // 1. Admin Settings
    const adminSettings = {
      id: "system",
      siteSettings: {
        maintenanceMode: false,
        registrationOpen: true,
        claimApprovalRequired: true
      },
      emailSettings: {
        fromEmail: "paulavicius.e@gmail.com",
        replyTo: "paulavicius.e@gmail.com",
        adminNotificationEmails: [
          "paulavicius.e@gmail.com",
          "paulavicius.e@gmail.com"
        ]
      },
      verificationSettings: {
        requireDocumentation: true,
        manualVerificationRequired: true,
        automaticVerificationMethods: ["email", "phone"]
      },
      updatedAt: Timestamp.now(),
      updatedBy: "verslodaigynas123",
    };

    await db.collection("adminSettings").doc("system").set(adminSettings);
    console.log("✅ Admin settings imported");

    // 2. Admin Notification
    const notification = {
      id: "notification123",
      type: "business_claim",
      title: "Naujas verslo perėmimo prašymas",
      message: "Gautas naujas prašymas perimti verslą 'Verslo Vartai'",
      relatedDocId: "claim456",
      relatedCollection: "businessClaims",
      status: "unread",
      priority: "high",
      createdAt: Timestamp.now(),
      forAdmins: ["all"]
    };

    await db.collection("adminNotifications").doc(notification.id).set(notification);
    console.log("✅ Admin notification imported");

    // 3. Admin Activity Log
    const activityLog = {
      id: "verslodaigynas123",
      adminId: "verslodaigynas123",
      adminEmail: "paulavicius.e@gmail.com",
      action: "approve_claim",
      description: "Patvirtintas verslo perėmimo prašymas",
      relatedDocId: "claim456",
      relatedCollection: "businessClaims",
      ip: "192.168.1.1",
      userAgent: "Mozilla/5.0...",
      timestamp: Timestamp.now()
    };

    await db.collection("adminActivityLogs").doc(activityLog.id).set(activityLog);
    console.log("✅ Admin activity log imported");
  } catch (err) {
    console.error("❌ Failed to import admin data:", err);
  }
}

importAdminData();