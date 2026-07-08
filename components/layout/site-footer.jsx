import Link from "next/link";

const LINKS = [
  { href: "/terms", label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/profile/help", label: "Help" },
  { href: "/profile/about", label: "About" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container-app flex flex-col items-center gap-3 py-6">
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-muted-foreground transition hover:text-primary"
            >
              {l.label}
            </Link>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Zipra. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
