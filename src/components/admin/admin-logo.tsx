import Image from "next/image";

import styles from "./admin.module.css";

interface AdminLogoProps {
  variant?: "login" | "sidebar" | "loader";
  preload?: boolean;
}

export function AdminLogo({ variant = "sidebar", preload = false }: AdminLogoProps) {
  const compact = variant === "loader";

  return (
    <span className={styles.adminLogoFrame} data-variant={variant}>
      <Image
        className={styles.adminLogo}
        src={compact ? "/assets/logo/favicon-192.png" : "/assets/logo/logo.png"}
        width={compact ? 192 : 1738}
        height={compact ? 192 : 721}
        sizes={compact ? "76px" : variant === "sidebar" ? "168px" : "208px"}
        alt="Ahmed Hatem"
        preload={preload}
      />
    </span>
  );
}
