export async function POST({ request, locals }) {
  const formData = await request.formData();

  // Honeypot
  if (formData.get("company")) {
    return new Response("OK");
  }

  const name = formData.get("name");
  const email = formData.get("email");
  const message = formData.get("message");

  if (!name || !email || !message) {
    return new Response("Missing fields", { status: 400 });
  }

  // Send email via Resend
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${locals.runtime.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Website <contact@loughboroughcommunitykitchen.org.uk>",
      to: ["communitykitchenlboro@outlook.com"],
      reply_to: email,
      subject: "New website form submission",
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
    }),
  });

  if (!res.ok) {
    return new Response("Email failed", { status: 500 });
  }

  return new Response("OK");
}
