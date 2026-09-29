
const fs = require("fs");
const path = "src/components/admin/AdminHeader.tsx";
let content = fs.readFileSync(path, "utf8");

content = content.replace(
    `      if (pathname.startsWith("/delivery")) {
        router.push("/delivery-login");
      } else {
        router.push("/admin-login");
      }
      router.refresh();`,
    `      if (pathname.startsWith("/delivery")) {
        window.location.href = "/delivery-login";
      } else {
        window.location.href = "/admin-login";
      }`
);

fs.writeFileSync(path, content, "utf8");

