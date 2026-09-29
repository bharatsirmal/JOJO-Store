file_path = "src/app/api/auth/session/route.ts"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

replacement = """
    // Fetch role from Firestore
    const { adminDb } = require("@/lib/firebase/admin");
    let userRole = "customer";
    try {
      const userDoc = await adminDb.collection("users").doc(decodedToken.uid).get();
      if (userDoc.exists) {
        userRole = userDoc.data().role || "customer";
      }
    } catch (e) {
      console.error("Failed to fetch role", e);
    }

    return NextResponse.json({ success: true, role: userRole }, { status: 200 });
"""

content = content.replace("return NextResponse.json({ success: true }, { status: 200 });", replacement)

# Add missing import if needed, but we used require above to be safe

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

