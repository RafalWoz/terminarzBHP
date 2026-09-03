"use client";

type DownloadLinkProps = {
  href: string;
  label: string;
  postSlug: string;
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function DownloadLink({ href, label, postSlug }: DownloadLinkProps) {
  return (
    <a
      href={href}
      download={!/^https?:\/\//i.test(href)}
      onClick={() => {
        window.gtag?.("event", "blog_download_click", {
          event_category: "download",
          event_label: label,
          file_name: href,
          blog_slug: postSlug,
        });
      }}
      className="inline-flex justify-center rounded-[14px] bg-[var(--teal-600)] px-5 py-3 text-sm font-extrabold text-white shadow-[0_10px_24px_rgba(14,145,139,0.22)] hover:bg-[var(--teal-700)]"
    >
      {label}
    </a>
  );
}
