// function sebOnly(req, res, next) {
//   const ua = req.headers["user-agent"] || "";

//   if (!ua.includes("SEB")) {
//     return res
//       .status(403)
//       .send("Please open this exam using Safe Exam Browser.");
//   }

//   next();
// }

function sebOnly(req, res, next) {
  const ua = req.headers["user-agent"] || "";
  const sebKey = req.headers["x-safeexambrowser-requesthash"];

  const isSEB =
    ua.includes("SEB") ||
    ua.includes("SafeExamBrowser");

  if (!isSEB || !sebKey) {
    return res.status(403).render("sebRequired", { page: "sebRequired" });
  }


  next();
}

module.exports = sebOnly;