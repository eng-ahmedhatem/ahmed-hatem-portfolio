import Link from "next/link";

import { DirectionalArrow } from "./directional-arrow";
import styles from "./action-link.module.css";

export function ActionLink({
  href,
  children,
  variant = "primary",
  className,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
}) {
  const classes = [styles.action, styles[variant], className].filter(Boolean).join(" ");
  return (
    <Link className={classes} href={href}>
      <span>{children}</span>
      <DirectionalArrow className={styles.arrow} />
    </Link>
  );
}
