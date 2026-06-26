import styles from './ImmersionDoor.module.css';

export default function ImmersionDoor({ open = false, phase, children }) {
  const p = phase ?? (open ? 'open' : 'closed');
  const stateClass =
    p === 'opening' ? styles.opening : p === 'open' ? styles.open : styles.closed;

  return (
    <div className={`${styles.frame} ${stateClass}`}>
      <div className={styles.stage}>
        {/* Fond intérieur lumineux (visible derrière la porte) */}
        <div className={styles.rail} />
        <div className={styles.sasFog} />
        <div className={styles.scanline} />

        {/* Plaque "ENTRÉE PRINCIPALE" au-dessus */}
        <div className={styles.namePlate}>
          <p className={styles.namePlateText}>Entrée principale</p>
        </div>

        {/* Contenu au-dessus (popup formulaire ou choix étage) */}
        <div className={styles.inner}>
          <div className={styles.innerGlow} />
          {children}
        </div>

        {/* Cadre doré + portes coulissantes */}
        <div className={styles.frameGold}>
          <div className={styles.frameInner}>
            {/* LEDs scanner */}
            <div className={styles.ledStrip}>
              <div className={styles.led} />
              <div className={styles.led} />
              <div className={styles.led} />
            </div>

            {/* Porte gauche */}
            <div className={styles.doorLeft}>
              <span className={styles.doorLogo}>UCA · INNOVATION</span>
            </div>

            {/* Porte droite */}
            <div className={styles.doorRight}>
              <span className={styles.doorLogo}>CITÉ · 2025</span>
            </div>

            {/* Jointure centrale */}
            <div className={styles.seam} />
          </div>
        </div>
      </div>
    </div>
  );
}