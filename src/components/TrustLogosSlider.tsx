import healthMinistry from "@/assets/press/health-ministry.webp";
import womfire from "@/assets/press/womfire.png";
import ynet from "@/assets/press/ynet.gif";
import haaretz from "@/assets/press/haaretz.png";
import jpost from "@/assets/press/jpost.png";
import wallaMaariv from "@/assets/press/walla-maariv.webp";
import hlskin from "@/assets/press/hlskin.webp";
import herbalife from "@/assets/press/herbalife.webp";

const logos = [
  { src: healthMinistry, alt: "משרד הבריאות" },
  { src: ynet, alt: "Ynet" },
  { src: haaretz, alt: "הארץ" },
  { src: jpost, alt: "The Jerusalem Post" },
  { src: wallaMaariv, alt: "וואלה ומעריב" },
  { src: womfire, alt: "Wom Fire" },
  { src: hlskin, alt: "HL/Skin" },
  { src: herbalife, alt: "Herbalife" },
];

export const TrustLogosSlider = () => {
  // Duplicate the logos so the marquee loops seamlessly
  const loop = [...logos, ...logos];

  return (
    <section
      aria-label="מוזכרים ב"
      className="relative py-10 bg-white border-y border-pink-50"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 mb-6">
        <p className="text-center text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase text-slate-500">
          As featured in · מוזכרים בתקשורת
        </p>
      </div>

      <div
        className="group relative overflow-hidden"
        style={{
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0, black 8%, black 92%, transparent 100%)",
          maskImage:
            "linear-gradient(to right, transparent 0, black 8%, black 92%, transparent 100%)",
        }}
      >
        <div className="flex w-max animate-marquee items-center">
          {loop.map((logo, i) => (
            <div
              key={`${logo.alt}-${i}`}
              className="shrink-0 flex items-center justify-center h-12 sm:h-14 px-7 sm:px-10"
            >
              <img
                src={logo.src}
                alt={logo.alt}
                loading="lazy"
                className="max-h-12 sm:max-h-14 w-auto object-contain grayscale opacity-70 hover:opacity-100 hover:grayscale-0 transition duration-500"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustLogosSlider;