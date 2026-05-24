import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import SiteFooter from "./SiteFooter";

interface Props {
  title: string;
  description: string;
  canonical: string;
  children: React.ReactNode;
}

const PolicyLayout = ({ title, description, canonical, children }: Props) => {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground flex flex-col" dir="rtl">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <nav className="w-full bg-background/90 backdrop-blur-md border-b border-pink-50">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <Link to="/" className="text-2xl font-black tracking-tighter text-pink-600">KOREANGLOW</Link>
          <Link to="/" className="text-sm font-bold text-slate-600 hover:text-pink-600">חזרה לאתר →</Link>
        </div>
      </nav>

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-16 w-full">
        {children}
      </main>

      <SiteFooter />
    </div>
  );
};

export default PolicyLayout;