export default {
  async fetch(request, env, ctx) {
    const { query } = await request.json();

    const intent = await detectIntentWithCohere(query);
    
    if (intent === "ask_order_status") {
      const orderId = extractOrderId(query);
      if (!orderId) {
        return json({ reply: "আপনার Order Number টা দিন, আমি চেক করে জানাচ্ছি।" });
      }

      const status = await getOrderStatus(orderId);
      if (!status) {
        return json({ reply: `দুঃখিত, ${orderId} নাম্বারের কোনো অর্ডার খুঁজে পাইনি।` });
      }

      return json({ reply: `আপনার অর্ডার ${orderId} এখন "${status}" অবস্থায় আছে।` });
    }

    return json({
      reply: "আমি এখন কেবল অর্ডার সংক্রান্ত প্রশ্নের উত্তর দিতে পারি। অনুগ্রহ করে কাস্টমার কেয়ারে যোগাযোগ করুন।"
    });
  }
};

// === Cohere AI Integration ===
async function detectIntentWithCohere(message) {
  const res = await fetch("https://api.cohere.ai/v1/classify", {
    method: "POST",
    headers: {
      Authorization: "Bearer g2w48QtLf3V61kKZx771pEOrQ5Qi7HJ2vTIlKr9e", // ← তুমি চাইলে env বা config এ রাখো
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "embed-english-v3.0",
      inputs: [message],
      examples: [
        { text: "amar order ta ki obosta", label: "ask_order_status" },
        { text: "order number B984732 koi", label: "ask_order_status" },
        { text: "amar order id C112233", label: "ask_order_status" },
        { text: "order koi", label: "ask_order_status" },
        { text: "offer kokhon pabo", label: "other" },
        { text: "discount ache?", label: "other" },
        { text: "apnader phone number", label: "other" },
        { text: "ami delivery chai", label: "other" }
      ],
    }),
  });

  const data = await res.json();
  return data.classifications[0]?.prediction || "other";
}

// === Order Number Detection ===
function extractOrderId(text) {
  const match = text.match(/\b([A-Z]{1}\d{6})\b/i); // e.g., A143825, B984732
  return match ? match[1].toUpperCase() : null;
}

// === Simulated DB ===
async function getOrderStatus(orderId) {
  const db = {
    A143825: "শিপমেন্টে",
    B984732: "প্রসেসিং",
    C112233: "ডেলিভার্ড"
  };
  await new Promise((r) => setTimeout(r, 100));
  return db[orderId] || null;
}

// === Response JSON ===
function json(obj) {
  return new Response(JSON.stringify(obj), {
    headers: { 'Content-Type': 'application/json' }
  });
}