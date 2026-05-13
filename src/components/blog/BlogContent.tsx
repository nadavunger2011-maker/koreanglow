import { ShoppableProductCard } from "./ShoppableProductCard";

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "image"; url: string; alt?: string; caption?: string }
  | { type: "quote"; text: string; cite?: string }
  | { type: "product"; handle: string };

export const BlogContent = ({ blocks }: { blocks: Block[] }) => {
  return (
    <div className="prose prose-slate max-w-none prose-headings:font-black prose-h2:text-2xl prose-h3:text-xl">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "h2":
            return (
              <h2 key={i} className="text-2xl md:text-3xl font-black mt-10 mb-4 text-foreground">
                {b.text}
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} className="text-xl font-bold mt-6 mb-3 text-foreground">
                {b.text}
              </h3>
            );
          case "p":
            return (
              <p key={i} className="text-base leading-relaxed text-foreground/90 my-4">
                {b.text}
              </p>
            );
          case "image":
            return (
              <figure key={i} className="my-8">
                <img
                  src={b.url}
                  alt={b.alt || ""}
                  className="w-full rounded-lg border border-border/40"
                  loading="lazy"
                />
                {b.caption && (
                  <figcaption className="text-xs text-muted-foreground text-center mt-2">
                    {b.caption}
                  </figcaption>
                )}
              </figure>
            );
          case "quote":
            return (
              <blockquote
                key={i}
                className="border-r-4 border-primary/40 pr-4 my-6 italic text-lg text-foreground/80"
              >
                {b.text}
                {b.cite && <footer className="text-sm not-italic text-muted-foreground mt-2">— {b.cite}</footer>}
              </blockquote>
            );
          case "product":
            return <ShoppableProductCard key={i} handle={b.handle} />;
          default:
            return null;
        }
      })}
    </div>
  );
};