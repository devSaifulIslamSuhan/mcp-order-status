export default {
  async fetch(request, env, ctx) {
    const { query } = await request.json();

    const orderId = extractOrderId(query);
    if (!orderId) {
      return json({ reply: "দয়া করে সঠিক Order ID দিন।" });
    }

    const status = await getOrderStatus(orderId);

    if (!status) {
      return json({ reply: `দুঃখিত, ${orderId} নামের কোনো অর্ডার খুঁজে পাওয়া যায়নি।` });
    }

    return json({ reply: `আপনার অর্ডারটি এখন ${status} অবস্থায় আছে।` });
  }
};

function extractOrderId(text) {
  const match = text.match(/order id\s*([A-Z0-9]+)/i);
  return match ? match[1] : null;
}

async function getOrderStatus(orderId) {
  const mockDb = {
    A143825: "শিপমেন্টে",
    B984732: "প্রসেসিং",
    C112233: "ডেলিভার্ড"
  };
  await new Promise((r) => setTimeout(r, 200));
  return mockDb[orderId] || null;
}

function json(obj) {
  return new Response(JSON.stringify(obj), {
    headers: { 'Content-Type': 'application/json' }
  });
}