export async function onRequestPost({ request, env }) {
  const formData = await request.formData();

  // Extract fields
  const name = formData.get("name");
  const email = formData.get("email");
  const message = formData.get("message");

  // Honeypot field
  const company = formData.get("company");

  // 🚫 If honeypot is filled → silently drop
  if (company) {
    return new Response("OK", { status: 200 });
  }

  // Basic validation
  if (!name || !email || !message) {
    return new Response("Missing fields", { status: 400 });
  }

  // Send email via Resend
  const resendResponse = await fetch(
    "https://api.resend.com/emails",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "Website <contact@yourdomain.org>",
        to: ["secretary@yourdomain.org"],
        reply_to: email,
        subject: "New website contact form",
        html: `
          <h2>New Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p>${message.replace(/\n/g, "<br>")}</p>
        `
      })
    }
  );

  if (!resendResponse.ok) {
    return new Response("Email failed", { status: 500 });
  }

  return new Response("OK", { status: 200 });
}
