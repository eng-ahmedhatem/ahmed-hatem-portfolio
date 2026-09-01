import styles from "./loading.module.css";

export default function Loading() {
  return (
    <main className={styles.loader} aria-live="polite" aria-busy="true">
      <div className={styles.mark} aria-hidden="true">
        <svg viewBox="0 0 160 96" focusable="false">
          <path d="M18 78 53 18l27 60M34 54h36" />
          <path d="M84 18v60m0-30h55m0-30v60" />
          <circle cx="142" cy="18" r="3" />
        </svg>
      </div>
      <div className={styles.copy}>
        <span className={styles.ar}>جارٍ تجهيز الصفحة</span>
        <span className={styles.en}>Preparing the page</span>
        <i aria-hidden="true"><b /></i>
      </div>
    </main>
  );
}
