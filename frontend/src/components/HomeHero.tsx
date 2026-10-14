import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Globe2 } from "lucide-react";
import hero from "../../public/home_bg.png";
import styles from "./HomeHero.module.css";

export function HomeHero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-heading">
      <h1 id="hero-heading" className="sr-only">
        JOJO Store — Streetwear for a brighter tomorrow
      </h1>
      <Image
        src={hero}
        alt="Two models in oversized brown and blue hoodies against a bright blue city sky"
        fill
        priority
        placeholder="blur"
        quality={85}
        sizes="100vw"
        className={styles.image}
      />
      <div className={styles.shade} aria-hidden="true" />
      <div className={styles.values}>
        <p>
          People
          <br />
          Style
          <br />
          Progress
        </p>
        <span aria-hidden="true" />
      </div>
      <p className={styles.statement}>
        Streetwear
        <br />
        for a brighter
        <br />
        tomorrow
      </p>
      <div className={styles.footer}>
        <div className={styles.actions}>
          <Link href="/products" className={styles.shop}>
            Shop now{" "}
            <ArrowRight size={23} strokeWidth={1.5} aria-hidden="true" />
          </Link>
          <Link href="#new-arrivals" className={styles.arrivals}>
            <span aria-hidden="true" />
            New arrivals
          </Link>
        </div>
        <p className={styles.shipping}>
          Worldwide shipping{" "}
          <Globe2 size={27} strokeWidth={1.3} aria-hidden="true" />
        </p>
      </div>
    </section>
  );
}
