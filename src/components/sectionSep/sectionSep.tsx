import CarouselApps from "../carouselApps";
import Link from "next/link";
interface SectionTitle {
  sectionTitle: string;
}
export default function SectionSep({sectionTitle="any"}:SectionTitle) {
  return (
    <div className="flex flex-col gap-4 my-16 mx-8 ">
      <div className="uppercase text-2xl leading-relaxed font-bold">
        list {sectionTitle}
      </div>
      <CarouselApps />
      <Link href={`/${sectionTitle}`} className="uppercase bg-green-500 leading-relaxed font-bold w-max py-1.5 px-6 rounded-full shadow-xl shadow-green-500/20">
        all {sectionTitle}
      </Link>
    </div>
  );
}
