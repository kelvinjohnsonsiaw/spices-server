import express from "express";

const router = express.Router();

router.post("/verify", async (req, res) => {
  try {
    const { reference, amount, currency } = req.body || {};

    if (!reference) {
      return res.status(400).json({ error: "Payment reference is required." });
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return res.status(500).json({ error: "Paystack secret key is not configured." });
    }

    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const payload = await paystackRes.json();

    if (!paystackRes.ok || !payload?.status || payload.data?.status !== "success") {
      return res.status(400).json({
        error: "Payment verification failed or the transaction is incomplete.",
        paystack: payload,
      });
    }

    const verifiedAmount = Number((payload.data?.amount || 0) / 100);
    const expectedAmount = Number(amount || 0);

    if (expectedAmount && verifiedAmount !== expectedAmount) {
      return res.status(400).json({
        error: "Payment amount does not match the order total.",
        expectedAmount,
        verifiedAmount,
      });
    }

    if (currency && payload.data?.currency && payload.data.currency !== currency) {
      return res.status(400).json({
        error: "Payment currency does not match the order currency.",
        expectedCurrency: currency,
        verifiedCurrency: payload.data.currency,
      });
    }

    return res.json({
      ok: true,
      reference,
      amount: verifiedAmount,
      currency: payload.data?.currency || currency || "GHS",
      customer: payload.data?.customer || null,
      message: "Payment verified successfully.",
    });
  } catch (err) {
    console.error("Paystack verify error:", err);
    return res.status(500).json({ error: "Could not verify payment." });
  }
});

export default router;
