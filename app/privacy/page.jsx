import Link from "next/link";

export const metadata = {
  title: "Privacy Policy",
  description: "Zipra Privacy Policy.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 py-2">
      <div>
        <h1 className="font-display text-2xl font-bold">Privacy Policy</h1>
        <p className="mt-1 text-sm text-muted-foreground">Last updated: 9 July 2026</p>
      </div>

      <p className="text-sm text-muted-foreground">
        Your privacy matters to us. This Privacy Policy explains how Zipra collects, uses, and
        protects your information when you use our Service. By using Zipra, you consent to the
        practices described here.
      </p>

      <section className="space-y-2">
        <h2 className="font-semibold">1. Information We Collect</h2>
        <p className="text-sm text-muted-foreground">
          We collect information you provide directly (such as name, phone number, email, delivery
          addresses, and payment details), and information collected automatically (such as device
          data, location you choose for delivery, and usage analytics).
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">2. How We Use Information</h2>
        <p className="text-sm text-muted-foreground">
          We use your information to create and manage your account, process and deliver orders,
          provide customer support, send notifications, improve our Service, and comply with legal
          obligations.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">3. Location Data</h2>
        <p className="text-sm text-muted-foreground">
          With your permission, we access your device location to detect your delivery area and
          check serviceability. You may revoke location access at any time through your device
          settings. We do not sell your location data.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">4. Payments</h2>
        <p className="text-sm text-muted-foreground">
          Payment information is processed by our PCI-compliant payment partners. Zipra does not
          store full card numbers or sensitive authentication data on its servers.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">5. Sharing of Information</h2>
        <p className="text-sm text-muted-foreground">
          We share information only with service providers necessary to operate the Service (such as
          delivery partners and payment processors), or where required by law. We do not sell your
          personal information.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">6. Data Security</h2>
        <p className="text-sm text-muted-foreground">
          We implement reasonable technical and organizational measures to protect your data.
          However, no method of transmission or storage is completely secure.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">7. Your Rights</h2>
        <p className="text-sm text-muted-foreground">
          You may access, correct, or delete your account information at any time from your profile
          settings, or by contacting us. Subject to applicable law, you may request export or
          deletion of your personal data.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">8. Contact</h2>
        <p className="text-sm text-muted-foreground">
          For privacy-related requests, contact{" "}
          <span className="font-medium text-foreground">support@zipra.app</span>.
        </p>
      </section>

      <p className="text-sm">
        <Link href="/terms" className="font-medium text-primary underline underline-offset-2">
          Read our Terms of Service
        </Link>
      </p>
    </div>
  );
}
