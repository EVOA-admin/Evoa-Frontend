import pricingService from "../services/pricingService";

let razorpayScriptPromise = null;

const ensureRazorpayScript = () => {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay is only available in the browser."));
  }

  if (window.Razorpay) {
    return Promise.resolve(window.Razorpay);
  }

  if (!razorpayScriptPromise) {
    razorpayScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(window.Razorpay);
      script.onerror = () => reject(new Error("Failed to load Razorpay checkout."));
      document.body.appendChild(script);
    });
  }

  return razorpayScriptPromise;
};

export const openRazorpayCheckout = async ({
  planType,
  user,
  onSuccess,
  createOrder,
  verifyPayment,
  onDismiss,
  description,
  notes,
  cancelMessage = "Payment cancelled.",
}) => {
  await ensureRazorpayScript();

  if (typeof window.Razorpay !== "function") {
    throw new Error("Razorpay checkout is unavailable right now.");
  }

  let orderResponse;
  try {
    orderResponse = createOrder
      ? await createOrder()
      : await pricingService.createOrder(planType);
  } catch (error) {
    console.error("[Razorpay] create order failed:", error);
    throw new Error(error?.message || "Unable to create payment order right now.");
  }
  const orderData = orderResponse?.data?.data || orderResponse?.data || {};

  if (orderData?.alreadyParticipating) {
    if (onSuccess) {
      await onSuccess(orderData);
    }
    return orderData;
  }

  if (!orderData?.orderId || !orderData?.razorpayKey) {
    console.error("[Razorpay] invalid order payload:", orderData);
    throw new Error("Unable to initiate payment right now.");
  }

  return new Promise((resolve, reject) => {
    let settled = false;

    const razorpay = new window.Razorpay({
      key: orderData.razorpayKey,
      amount: orderData.amount,
      currency: orderData.currency || "INR",
      name: "Evoa",
      description: description || orderData.planName || "Evoa Subscription",
      order_id: orderData.orderId,
      prefill: {
        name: user?.fullName || "",
        email: user?.email || "",
      },
      notes: {
        ...(planType ? { planType } : {}),
        ...(notes || {}),
      },
      theme: {
        color: "#E8341A",
      },
      handler: async (response) => {
        try {
          const payload = {
            ...(planType ? { planType } : {}),
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          };

          if (verifyPayment) {
            await verifyPayment(payload);
          } else {
            await pricingService.verifyPayment(payload);
          }

          if (onSuccess) {
            await onSuccess(response);
          }
          settled = true;
          resolve(response);
        } catch (error) {
          console.error("[Razorpay] verify payment failed:", error);
          settled = true;
          reject(error);
        }
      },
      modal: {
        ondismiss: async () => {
          if (settled) return;
          try {
            if (onDismiss) {
              await onDismiss({ razorpayOrderId: orderData.orderId });
            }
          } catch (error) {
            console.error("[Razorpay] dismiss handler failed:", error);
            // Ignore dismiss cleanup errors so the UI can still recover.
          }
          settled = true;
          reject(new Error(cancelMessage));
        },
      },
    });

    razorpay.on("payment.failed", (response) => {
      if (settled) return;
      settled = true;
      const failureMessage = response?.error?.description || "Payment failed. Please try again.";
      console.error("[Razorpay] payment failed:", response?.error || response);
      reject(new Error(failureMessage));
    });

    razorpay.open();
  });
};
