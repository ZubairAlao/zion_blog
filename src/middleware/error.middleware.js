export function errorHandler(err, req, res, next) {
    console.error(err);
  
    if (err.code === "P2002") {
      return res.status(409).json({ success: false, message: "A record with that value already exists" });
    }
    if (err.code === "P2025") {
      return res.status(404).json({ success: false, message: "Record not found" });
    }
  
    const status = err.status || 500;
    res.status(status).json({
      success: false,
      message: status === 500 ? "Server error" : err.message
    });
  }