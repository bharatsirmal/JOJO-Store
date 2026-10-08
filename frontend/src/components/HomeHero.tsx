import Image from "next/image";
import hero from "../../public/home_bg.png";

export function HomeHero() {
  return (
    <section className="relative w-full h-[calc(100svh-65px)] overflow-hidden bg-[#0a0a0a]">
      <Image src={hero} alt="JOJO storefront background" fill priority sizes="100vw" className="object-cover object-center" />
    </section>
  );
}
