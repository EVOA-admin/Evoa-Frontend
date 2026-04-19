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

  const orderResponse = createOrder
    ? await createOrder()
    : await pricingService.createOrder(planType);
  const orderData = orderResponse?.data?.data || orderResponse?.data || {};

  if (orderData?.alreadyParticipating) {
    if (onSuccess) {
      await onSuccess(orderData);
    }
    return orderData;
  }

  if (!orderData?.orderId || !orderData?.razorpayKey) {
    throw new Error("Unable to initiate payment right now.");
  }

  return new Promise((resolve, reject) => {
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
          resolve(response);
        } catch (error) {
          reject(error);
        }
      },
      modal: {
        ondismiss: async () => {
          try {
            if (onDismiss) {
              await onDismiss({ razorpayOrderId: orderData.orderId });
            }
          } catch {
            // Ignore dismiss cleanup errors so the UI can still recover.
          }
          reject(new Error(cancelMessage));
        },
      },
    });

    razorpay.open();
  });
};
