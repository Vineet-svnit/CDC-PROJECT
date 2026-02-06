// function sebOnly(req, res, next) {
//   const ua = req.headers["user-agent"] || "";

//   if (!ua.includes("SEB")) {
//     return res
//       .status(403)
//       .send("Please open this exam using Safe Exam Browser.");
//   }

//   next();
// }

// async function sebOnly(req, res, next) {
//   const ua = req.headers["user-agent"] || "";
//   const sebKey = req.headers["x-safeexambrowser-configkey"];

//   const expectedKey = process.env.NODE_ENV === 'production' ? process.env.SEB_CONFIG_KEY : process.env.SEB_CONFIG_KEY_LOCAL;

//   const isSEB =
//     ua.includes("SEB") ||
//     ua.includes("SafeExamBrowser");
//   console.log(sebKey, isSEB, expectedKey);

//   const isValidSEB = sebKey && isSEB && expectedKey && (sebKey === expectedKey);

//   if (!isValidSEB) {
//     if (req.user) {
//       req.user.pendingTestId = req.params.id;
//       await req.user.save();
//     }
//     return res.status(403).render("sebRequired", { page: "sebRequired", isProd: process.env.NODE_ENV === "production" });
//   }
//   next();
// }

// module.exports = sebOnly;

const crypto = require("crypto");

function sha256Hex(input) {
  return crypto
    .createHash("sha256")
    .update(input, "utf8")
    .digest("hex");
}

function getAbsoluteUrl(req) {
  const protocol = req.protocol;
  const host = req.get("host");
  const originalUrl = req.originalUrl.split("#")[0];
  return `${protocol}://${host}${originalUrl}`;
}

// async function sebOnly(req, res, next) {
//   const ua = req.headers["user-agent"] || "";
//   const receivedHash =
//     req.headers["x-safeexambrowser-configkeyhash"];

//     const isSEB = ua.includes("SafeExamBrowser") || ua.includes("SEB");

//   const configKey = process.env.NODE_ENV === 'production' ? process.env.SEB_CONFIG_KEY : process.env.SEB_CONFIG_KEY_LOCAL;

//   if (!ua.includes("SafeExamBrowser") || !receivedHash) {
//     return res.status(403).render("sebRequired", { page: "sebRequired", isProd: process.env.NODE_ENV === "production" });
//   }

//   const absoluteUrl = getAbsoluteUrl(req);
//   const expectedHash = sha256Hex(absoluteUrl + configKey);

//   if (expectedHash !== receivedHash) {
//     return res.status(403).render("sebRequired", { page: "sebRequired", isProd: process.env.NODE_ENV === "production" });
//   }

//   next();
// }

async function sebOnly(req, res, next) {
  const ua = req.headers["user-agent"] || "";
  const receivedHash =
    req.headers["x-safeexambrowser-configkeyhash"];

  const isSEB = ua.includes("SafeExamBrowser") || ua.includes("SEB");

  const isProd = process.env.NODE_ENV === "production";

  const configKey = process.env.SEB_CONFIG_KEY;
  console.log("bbbbbbbbbbbbbbbbbbb", isSEB, receivedHash, configKey);

  if (!isSEB || !receivedHash || !configKey) {
    return res
      .status(403)
      .render("sebRequired", {
        page: "sebRequired",
        isProd
      });
  }

  // hard-coded base URLs (exactly as browser shows)
  const BASE_URL = isProd
    ? "https://cdc-project-w2zb.onrender.com/"
    : "http://localhost:5000/";

  // strip query + fragment, keep path
  let path = req.originalUrl.split("?")[0].split("#")[0];

  // ensure single slash join
  if (path.startsWith("/")) {
    path = path.slice(1);
  }

  const absoluteUrl = BASE_URL + path;
  console.log('fffffffffffffffffffffffffffff', absoluteUrl);
  

  const expectedHash = sha256Hex(absoluteUrl + configKey);

  console.log("zzzzzzzzzzzzzzzzzzzzzz", isSEB, receivedHash, configKey, expectedHash);

  if (expectedHash !== receivedHash) {
    return res
      .status(403)
      .render("sebRequired", {
        page: "sebRequired",
        isProd
      });
  }

  next();
}

module.exports = {
  sebOnly,
  sha256Hex,
  getAbsoluteUrl
};


