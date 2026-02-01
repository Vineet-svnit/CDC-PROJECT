function sebOnly(req, res, next) {
  const ua = req.headers["user-agent"] || "";

  if (!ua.includes("SEB")) {
    return res
      .status(403)
      .send("Please open this exam using Safe Exam Browser.");
  }

  next();
}

module.exports = sebOnly;
