import Link from "next/link";
import { IconArrowRight, IconSearch } from "@/components/Icons";

export default function NotFound() {
  return (
    <div className="card" style={{ marginTop: 40 }}>
      <div className="empty-state">
        <div className="eb">
          <IconSearch className="ic l" />
        </div>
        <h3>Page not found</h3>
        <p>
          This page isn't part of the pipeline. The guides cover everything
          from photos to on-device detection.
        </p>
        <Link
          href="/guides"
          className="btn-primary"
          style={{ width: "auto", display: "inline-flex", padding: "0 24px" }}
        >
          Browse the guides
          <IconArrowRight className="ic s" />
        </Link>
      </div>
    </div>
  );
}
