
const fs = require("fs");

function fix(path) {
  if (!fs.existsSync(path)) return;
  let content = fs.readFileSync(path, "utf8");
  
  // signInWithEmailAndPassword(auth, ...) -> signInWithEmailAndPassword(auth!, ...)
  content = content.replace(/signInWithEmailAndPassword\(\s*auth\s*,/g, "signInWithEmailAndPassword(auth!,");
  // createUserWithEmailAndPassword(auth, ...) -> createUserWithEmailAndPassword(auth!, ...)
  content = content.replace(/createUserWithEmailAndPassword\(\s*auth\s*,/g, "createUserWithEmailAndPassword(auth!,");
  // signInWithPopup(auth, ...) -> signInWithPopup(auth!, ...)
  content = content.replace(/signInWithPopup\(\s*auth\s*,/g, "signInWithPopup(auth!,");
  
  fs.writeFileSync(path, content, "utf8");
}

fix("src/app/(auth)/delivery-register/page.tsx");
fix("src/app/(auth)/login/page.tsx");
fix("src/app/(auth)/register/page.tsx");
fix("src/app/(auth)/admin-login/page.tsx");
fix("src/app/(auth)/delivery-login/page.tsx");
fix("src/components/auth/AuthUI.tsx");
fix("src/components/auth/GoogleSignIn.tsx");

