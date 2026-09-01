import Image from "next/image";

import styles from "./admin.module.css";

interface AdminLogoProps {
  variant?: "login" | "sidebar" | "loader";
  preload?: boolean;
}

export function AdminLogo({ variant = "sidebar", preload = false }: AdminLogoProps) {
  return (
    <span className={styles.adminLogoFrame} data-variant={variant}>
      <Image
        className={styles.adminLogo}
        src="/assets/logo/logo.png"
        width={1738}
        height={721}
        sizes={variant === "sidebar" ? "168px" : "208px"}
        alt="Ahmed Hatem"
        preload={preload}
      />
    </span>
  );
}
