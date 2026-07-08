import Link from "next/link";

export const metadata = {
  title: "Terms of Service",
  description: "Zipra Terms of Service.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 py-2">
      <div>
        <h1 className="font-display text-2xl font-bold">Terms of Service</h1>
        <p className="mt-1 text-sm text-muted-foreground">Last updated: 9 July 2026</p>
      </div>

      <p className="text-sm text-muted-foreground">
        Welcome to Zipra. These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and
        use of the Zipra website, mobile application, and related services (collectively, the
        &ldquo;Service&rdquo;). By creating an account or placing an order, you agree to these
        Terms. If you do not agree, please do not use the Service.
      </p>

      <section className="space-y-2">
        <h2 className="font-semibold">1. Account &amp; Eligibility</h2>
        <p className="text-sm text-muted-foreground">
          You must be at least 18 years old and provide accurate, current information to register.
          You are responsible for maintaining the confidentiality of your account credentials and
          for all activity that occurs under your account.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">2. Orders &amp; Pricing</h2>
        <p className="text-sm text-muted-foreground">
          Product prices, discounts, and availability are subject to change without notice. We
          reserve the right to refuse or cancel any order, including after an order has been
          accepted, in cases such as suspected fraud, stock unavailability, or incorrect pricing.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">3. Delivery</h2>
        <p className="text-sm text-muted-foreground">
          Delivery is available only within the serviceable delivery zones we operate in. Delivery
          times are estimates and not guaranteed. Risk of loss passes to you upon delivery to the
          address you provide.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">4. Payments &amp; Refunds</h2>
        <p className="text-sm text-muted-foreground">
          Payments are processed securely through our payment partners. Refunds, where applicable,
          are issued to the original payment method in accordance with our refund policy.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">5. User Conduct</h2>
        <p className="text-sm text-muted-foreground">
          You agree not to misuse the Service, attempt to gain unauthorized access, interfere with
          the Service&rsquo;s operation, or violate any applicable law while using Zipra.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">6. Limitation of Liability</h2>
        <p className="text-sm text-muted-foreground">
          The Service is provided &ldquo;as is&rdquo; without warranties of any kind. To the maximum
          extent permitted by law, Zipra shall not be liable for any indirect, incidental, or
          consequential damages arising from your use of the Service.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">7. Changes to These Terms</h2>
        <p className="text-sm text-muted-foreground">
          We may update these Terms from time to time. Continued use of the Service after changes
          take effect constitutes acceptance of the revised Terms.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">8. Contact</h2>
        <p className="text-sm text-muted-foreground">
          Questions about these Terms can be directed to{" "}
          <span className="font-medium text-foreground">support@zipra.app</span>.
        </p>
      </section>

      <p className="text-sm">
        <Link href="/privacy" className="font-medium text-primary underline underline-offset-2">
          Read our Privacy Policy
        </Link>
      </p>
    </div>
  );
}
