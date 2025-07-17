export default {
  async fetch(request, env, ctx) {
    try {
      console.log("Incoming request:", request);

      const { query } = await request.json();
      console.log("Parsed query:", query);

      const orderId = extractOrderId(query);
      if (!orderId) {
        return json({ reply: "দয়া করে সঠিক Order ID দিন।" });
      }

      const status = await getOrderStatus(orderId);

      if (!status) {
        return json({ reply: `দুঃখিত, ${orderId} নামের কোনো অর্ডার খুঁজে পাওয়া যায়নি।` });
      }

      return json({ reply: `আপনার অর্ডারটি এখন ${status} অবস্থায় আছে।` });

    } catch (err) {
      console.error("Worker error:", err);
      return new Response("Internal Error: " + err.message, { status: 500 });
    }
  }
};