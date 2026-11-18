import { useEffect, useState, type FormEvent } from "react";
import {
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  MapPin,
  CalendarDays,
  Phone,
  Mail,
  Moon,
  Sun,
  Menu,
  X,
  Search,
  Users,
  Fuel,
  Gauge,
  ShieldCheck,
  Check,
  CheckCircle2,
  Headphones,
  Plane,
  CarFront,
  ChevronDown,
  Globe2,
  Navigation,
  Camera,
  Plus,
  LockKeyhole,
} from "lucide-react";
import { useLanguage, languages, type TranslationKey } from "./i18n";
import {
  isDemo,
  saveBooking,
  type Booking,
  type Vehicle,
} from "./lib/store";
import { rentalDays, rentalPeriodDays, quote } from "./lib/booking.mjs";
import "./public.css";
import "./titanium.css";
import "./theme.css";
import {useContent,useFleet,themeStyle} from "./lib/content";
import Destinations from "./Destinations";
import WhatsAppIcon, { whatsappHref } from "./components/WhatsAppIcon";
import Contact, { emailHref, interfaceCopy } from "./Contact";
import { Dialog } from "./components/ui/dialog";

export const mapsUrl = "https://maps.app.goo.gl/ckuUGLpHTbmA3gPbA";
const earthUrl =
  "https://earth.google.com/web/@35.7733196,10.8352449,10a,600d,35y,0h,60t,0r";
const facebook = "https://www.facebook.com/teslarentcar/";
const locations = [
  { value: "Agence TESLA", key: "agencyLocation" },
  { value: "Aéroport de Monastir", key: "airport" },
  { value: "Aéroport d’Enfidha", key: "enfidha" },
  { value: "Livraison à convenir", key: "delivery" },
] as const;
const dateOffset = (offset: number) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};
const amount = (n: number) =>
  new Intl.NumberFormat("fr-TN", { maximumFractionDigits: 0 }).format(n);
function useContactLink() {
  const { t } = useLanguage();
  return emailHref(t.whatsappMessage);
}
function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="p-eyebrow">
      <span />
      {children}
    </p>
  );
}
function Logo() {
  const {content}=useContent();
  return (
    <Link to="/" className="p-logo" aria-label="TESLA Rent Car">
      <img src={content.theme.logo} alt="TESLA Rent Car" width="720" height="480" />
    </Link>
  );
}
function Header({ dark, toggleTheme }: {dark:boolean;toggleTheme:()=>void}) {
  const { lang, setLang, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const contactLink = useContactLink();
  useEffect(() => setOpen(false), [location]);
  return (
    <>
      <div className="p-topbar">
        <div className="p-container">
          <span>
            <MapPin size={12} />
            {t.top}
          </span>
          <a href="tel:+21621119123">
            <Phone size={12} />
            <bdi>+216 21 119 123</bdi>
          </a>
          <span className="p-currency">
            TND <span>· {t.currency}</span>
          </span>
        </div>
      </div>
      <header className="p-header">
        <div className="p-container p-nav">
          <Logo />
          <nav
            className={open ? "p-navlinks is-open" : "p-navlinks"}
            aria-label={t.menu}
          >
            <NavLink to="/" end>
              {t.home}
            </NavLink>
            <NavLink to="/vehicules">{t.cars}</NavLink>
            <Link to="/#services">{t.services}</Link>
            <Link to="/#monastir">{t.discover}</Link>
            <Link to="/#agence">{t.agency}</Link>
            <Link to="/#contact">{t.contact}</Link>
          </nav>
          <div className="p-nav-right">
            <button type="button" className="t-theme-toggle" onClick={toggleTheme} aria-label={interfaceCopy[lang][dark ? "day" : "night"]} aria-pressed={dark} title={interfaceCopy[lang][dark ? "day" : "night"]}>{dark ? <Sun size={19}/> : <Moon size={19}/>}</button>
            <Link to="/#reservation" className="p-button t-header-book">{t.book}<ArrowRight size={16}/></Link>
            <div className="p-languages" role="group" aria-label={t.language}>
              {languages.map((l) => (
                <button
                  key={l.code}
                  lang={l.html}
                  title={l.label}
                  aria-label={l.label}
                  aria-pressed={lang === l.code}
                  onClick={() => setLang(l.code)}
                >
                  <img
                    src={`/flags/${l.flag}.svg`}
                    width="22"
                    height="15"
                    alt=""
                  />
                  <span>{l.code.toUpperCase()}</span>
                </button>
              ))}
            </div>
            <a
              href={contactLink}
              className="p-nav-contact"
              aria-label={t.contact}
            >
              <Mail size={20} />
            </a>
            <button
              className="p-menu"
              aria-label={open ? t.close : t.menu}
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
function Footer() {
  const { t } = useLanguage();
  const contactLink = useContactLink();
  return (
    <footer className="p-footer">
      <div className="p-container p-footer-grid">
        <div>
          <Logo />
          <p>{t.footer}</p>
        </div>
        <div>
          <h3>{t.cars}</h3>
          <Link to="/vehicules">{t.allCars}</Link>
          <Link to="/#services">{t.services}</Link>
          <Link to="/#monastir">{t.discover}</Link>
          <Link to="/#agence">{t.agency}</Link>
        </div>
        <div>
          <h3>{t.contact}</h3>
          <a className="p-footer-phone" href="tel:+21621119123">
            <bdi>+216 21 119 123</bdi>
            <ArrowUpRight size={18} />
          </a>
          <a href={contactLink}>
            E-mail <ArrowUpRight size={13} />
          </a>
          <a href={facebook} target="_blank" rel="noreferrer">
            Facebook <ArrowUpRight size={13} />
          </a>
        </div>
        <div>
          <h3>Monastir, Tunisia</h3>
          <p>{t.mapText}</p>
          <a href={mapsUrl} target="_blank" rel="noreferrer">
            {t.directions}
            <ArrowUpRight size={13} />
          </a>
        </div>
      </div>
      <div className="p-container p-footer-bottom">
        <span>
          © {new Date().getFullYear()} TESLA Rent Car · {t.rights}
        </span>
        <a href="/credits.html" target="_blank" rel="noreferrer">
          {t.photoCredit}
        </a>
        <Link to="/admin">
          <LockKeyhole size={12} />
          {t.admin}
        </Link>
      </div>
    </footer>
  );
}
type Stay = {
  start: string;
  end: string;
  startTime: string;
  endTime: string;
  location: string;
  returnLocation: string;
  same: boolean;
};
function initialStay(params: URLSearchParams): Stay {
  return {
    start: params.get("start") || dateOffset(1),
    end: params.get("end") || dateOffset(4),
    startTime: params.get("startTime") || "10:00",
    endTime: params.get("endTime") || "10:00",
    location: locations.some((l) => l.value === params.get("location"))
      ? params.get("location")!
      : "Agence TESLA",
    returnLocation: locations.some(
      (l) => l.value === params.get("returnLocation"),
    )
      ? params.get("returnLocation")!
      : "Agence TESLA",
    same:
      !params.get("returnLocation") ||
      params.get("returnLocation") === params.get("location"),
  };
}
function stayParams(stay: Stay) {
  return new URLSearchParams({
    start: stay.start,
    end: stay.end,
    startTime: stay.startTime,
    endTime: stay.endTime,
    location: stay.location,
    returnLocation: stay.same ? stay.location : stay.returnLocation,
  }).toString();
}
function validStay(stay: Stay) {
  return (
    stay.start >= dateOffset(0) &&
    rentalPeriodDays(stay.start, stay.end, stay.startTime, stay.endTime) > 0 &&
    /^([01]\d|2[0-3]):[0-5]\d$/.test(stay.startTime) &&
    /^([01]\d|2[0-3]):[0-5]\d$/.test(stay.endTime)
  );
}
function LocationSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (s: string) => void;
}) {
  const { t } = useLanguage();
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      {locations.map((l) => (
        <option value={l.value} key={l.value}>
          {t[l.key]}
        </option>
      ))}
    </select>
  );
}
function StayFields({
  stay,
  setStay,
}: {
  stay: Stay;
  setStay: (s: Stay) => void;
}) {
  const { t } = useLanguage();
  return (
    <>
      <div className="p-search-fields">
        <label className="p-pickup">
          <span>
            <MapPin size={16} />
            {t.pickup}
          </span>
          <LocationSelect
            value={stay.location}
            onChange={(v) => setStay({ ...stay, location: v })}
          />
        </label>
        <div className="p-date-field">
          <label>
            <span>
              <CalendarDays size={16} />
              {t.start}
            </span>
            <input
              type="date"
              required
              min={dateOffset(0)}
              value={stay.start}
              onChange={(e) => setStay({ ...stay, start: e.target.value })}
            />
          </label>
          <label>
            <span>{t.time}</span>
            <input
              type="time"
              required
              value={stay.startTime}
              onChange={(e) => setStay({ ...stay, startTime: e.target.value })}
            />
          </label>
        </div>
        <div className="p-date-field">
          <label>
            <span>
              <CalendarDays size={16} />
              {t.end}
            </span>
            <input
              type="date"
              required
              min={stay.start}
              value={stay.end}
              onChange={(e) => setStay({ ...stay, end: e.target.value })}
            />
          </label>
          <label>
            <span>{t.time}</span>
            <input
              type="time"
              required
              value={stay.endTime}
              onChange={(e) => setStay({ ...stay, endTime: e.target.value })}
            />
          </label>
        </div>
      </div>
      <div className="p-search-bottom">
        <label className="p-check">
          <input
            type="checkbox"
            checked={stay.same}
            onChange={(e) => setStay({ ...stay, same: e.target.checked })}
          />
          {t.same}
        </label>
        {!stay.same && (
          <label className="p-return">
            <span>{t.dropoff}</span>
            <LocationSelect
              value={stay.returnLocation}
              onChange={(v) => setStay({ ...stay, returnLocation: v })}
            />
          </label>
        )}
      </div>
    </>
  );
}
function SearchBox() {
  const { t } = useLanguage();
  const [params] = useSearchParams();
  const [stay, setStay] = useState(() => initialStay(params));
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  const contactLink = useContactLink();
  return (
    <form
      className="p-search"
      onSubmit={(e) => {
        e.preventDefault();
        if (!validStay(stay)) {
          setError(true);
          return;
        }
        setError(false);
        navigate(`/vehicules?${stayParams(stay)}`);
      }}
    >
      <div className="p-search-heading">
        <span>
          <CarFront size={19} />
          {t.rental}
        </span>
        <a href={contactLink}>
          <Headphones size={14} />
          {t.personal}
          <ArrowUpRight size={14} />
        </a>
      </div>
      <div className="p-search-body">
        <StayFields stay={stay} setStay={setStay} />
        <button type="submit" className="p-button p-search-submit">
          <Search size={18} />
          {t.search}
          <ArrowRight size={17} />
        </button>
        {error && (
          <p role="alert" className="p-error">
            {t.datesError}
          </p>
        )}
        <small className="p-location-note">{t.locationNotice}</small>
      </div>
    </form>
  );
}
function CarCard({ car, params = "" }: { car: Vehicle; params?: string }) {
  const { t } = useLanguage();
  const category = t[car.category as TranslationKey] || car.category;
  return (
    <article className="p-car">
      <Link className="p-car-photo" to={`/vehicules/${car.id}${params}`}>
        <img
          src={car.image}
          alt={`${car.brand} ${car.name}`}
          loading="lazy"
          width="900"
          height="600"
        />
        <span>{category}</span>
        <i>
          <ArrowUpRight size={20} />
        </i>
      </Link>
      <div className="p-car-info">
        <small>{car.brand}</small>
        <h3>
          <Link to={`/vehicules/${car.id}${params}`}>{car.name}</Link>
        </h3>
        <div className="p-specs">
          <span>
            <Gauge size={14} />
            {car.transmission === "Automatique" ? t.Automatic : t.Manual}
          </span>
          <span>
            <Users size={14} />
            {car.seats} {t.seats}
          </span>
          <span>
            <Fuel size={14} />
            {t[car.fuel as TranslationKey] || car.fuel}
          </span>
        </div>
        <div className="p-car-price">
          <div>
            <small>{t.from}</small>
            <strong>
              {amount(car.price)} <b>DT</b>
              <span> / {t.day}</span>
            </strong>
          </div>
          <Link
            to={`/reservation/${car.id}${params}`}
            className="p-button p-button-small"
          >
            {t.book}
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </article>
  );
}
function Fleet({ catalogue = false }: { catalogue?: boolean }) {
  const fleet=useFleet();
  const { t } = useLanguage();
  const [params] = useSearchParams();
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("recommended");
  const maxBudget=Math.max(350,...fleet.map(v=>v.price));
  const [budget, setBudget] = useState(10000);
  const categories = [...new Set(fleet.map((c) => c.category))];
  let cars = fleet.filter(
    (c) =>
      (category === "all" || c.category === category) &&
      `${c.brand} ${c.name}`.toLowerCase().includes(query.toLowerCase()) &&
      c.price <= budget,
  );
  if (sort !== "recommended")
    cars = [...cars].sort((a, b) =>
      sort === "asc" ? a.price - b.price : b.price - a.price,
    );
  if(sort==='recommended')cars=[...cars].sort((a,b)=>Number(b.featured)-Number(a.featured));
  if (!catalogue) cars = cars.slice(0, 3);
  return (
    <section
      className={`p-section p-container ${catalogue ? "p-catalogue" : ""}`}
      id="collection"
    >
      <div className="p-section-heading">
        <div>
          <Label>{t.fleetLabel}</Label>
          <h2>
            {t.fleetTitle} <em>{t.fleetAccent}</em>
          </h2>
        </div>
        <p>{t.fleetText}</p>
      </div>
      <div className="p-fleet-toolbar">
        <div className="p-pills">
          <button
            className={category === "all" ? "selected" : ""}
            onClick={() => setCategory("all")}
          >
            {t.all}
          </button>
          {categories.map((c) => (
            <button
              key={c}
              className={category === c ? "selected" : ""}
              onClick={() => setCategory(c)}
            >
              {t[c as TranslationKey] || c}
            </button>
          ))}
        </div>
        {!catalogue ? (
          <Link className="p-textlink" to="/vehicules">
            {t.allCars}
            <ArrowUpRight size={17} />
          </Link>
        ) : (
          <label className="p-query">
            <Search size={17} />
            <input
              aria-label={t.query}
              placeholder={t.query}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        )}
      </div>
      {catalogue && (
        <div className="p-catalogue-meta">
          <span>
            {cars.length} {t.results}
          </span>
          <label>
            {t.budget} <b>{Math.min(budget,maxBudget)} DT</b>
            <input
              aria-label={t.budget}
              type="range"
              min="65"
              max={maxBudget}
              step="5"
              value={Math.min(budget,maxBudget)}
              onChange={(e) => setBudget(Number(e.target.value))}
            />
          </label>
          <select
            aria-label={t.sort}
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="recommended">{t.recommended}</option>
            <option value="asc">{t.ascending}</option>
            <option value="desc">{t.descending}</option>
          </select>
        </div>
      )}
      <div className="p-car-grid">
        {cars.map((c) => (
          <CarCard
            car={c}
            key={c.id}
            params={params.size ? `?${params}` : ""}
          />
        ))}
      </div>
      {!cars.length && (
        <div className="p-empty">
          <CarFront size={38} />
          <p>{t.noResults}</p>
          <button
            className="p-button"
            onClick={() => {
              setCategory("all");
              setQuery("");
              setBudget(10000);
            }}
          >
            {t.reset}
          </button>
        </div>
      )}
      <p className="p-demo-fleet">{t.demoFleet}</p>
    </section>
  );
}
function Home() {
  const {content}=useContent();
  const { t } = useLanguage();
  const reduce = useReducedMotion();
  return (
    <>
      <section className="t-hero relative">
        <div className="p-container grid items-center gap-12 lg:grid-cols-2">
          <motion.div initial={reduce ? false : { opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6 }} className="relative z-10">
            <div className="t-kicker inline-flex items-center gap-3 rounded-full bg-white px-4 py-3 shadow-sm"><span className="h-2 w-2 rounded-full bg-emerald-500" />{t.top}</div>
            <h1 className="t-title">{t.heroTitle}<br /><em>{t.heroAccent}</em></h1>
            <p className="t-intro">{t.heroText}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#reservation" className="p-button">{t.explore}<ArrowRight size={19} /></a>
              <a href="tel:+21621119123" className="t-phone inline-flex items-center gap-3 rounded-full border border-gray-200 bg-white px-6 py-4 font-bold"><Phone size={17} /><bdi>+216 21 119 123</bdi></a>
            </div>
            <div className="t-checks mt-8 flex flex-wrap gap-x-6 gap-y-3">{[t.trust1,t.trust3,t.trust4].map(text=><span key={text} className="inline-flex items-center gap-2"><Check size={15} className="text-emerald-500" />{text}</span>)}</div>
          </motion.div>
          <motion.div initial={reduce ? false : { opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8, delay: .15 }} className="t-scene relative">
            <div className="t-scene-photo overflow-hidden rounded-[36px]"><img src={content.theme.hero} alt="TESLA Rent Car" width="1280" height="941" fetchPriority="high" /></div>
            <div className="t-car-label absolute flex items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-xl"><div><strong>Mercedes-AMG GT</strong><small>{t.demoFleet}</small></div><Link to="/vehicules" className="p-button">{t.cars}<ArrowRight size={15} /></Link></div>
            <div className="t-badge t-airport"><span><Plane size={21} /></span><div><strong>Monastir</strong><small>{t.airport}</small></div></div>
            <div className="t-badge t-easy"><span><CarFront size={21} /></span><div><strong>{t.trust1}</strong><small>TESLA Rent Car</small></div></div>
            <img className="t-cutout" src="/images/hero-car.webp" alt="Mercedes-AMG GT — illustration" width="1100" height="470" fetchPriority="high" />
            <a href="tel:+21621119123" className="t-badge t-support"><span><Headphones size={21} /></span><div><strong>{t.contact}</strong><small>+216 21 119 123</small></div></a>
          </motion.div>
        </div>
      </section>
      <div id="reservation" className="p-container p-search-overlap">
        <SearchBox />
      </div>
      <div className="p-container p-trust">
        {[
          [ShieldCheck, t.trust1],
          [Mail, t.trust2],
          [MapPin, t.trust3],
          [CheckCircle2, t.trust4],
        ].map(([Icon, text]) => {
          const I = Icon as typeof ShieldCheck;
          return (
            <span key={String(text)}>
              <I size={20} />
              {String(text)}
            </span>
          );
        })}
      </div>
      <Fleet />
      <Services />
      <Destinations />
      <Social />
      <Agency />
    </>
  );
}
function Services() {
  const { t } = useLanguage();
  return (
    <section id="services" className="p-services p-section">
      <div className="p-container">
        <div className="p-section-heading">
          <div>
            <Label>{t.servicesLabel}</Label>
            <h2>
              {t.servicesTitle}
              <br />
              <em>{t.servicesAccent}</em>
            </h2>
          </div>
          <img
            src="/logo.webp"
            alt="TESLA Rent Car"
            className="p-service-logo"
            loading="lazy"
          />
        </div>
        <div className="p-service-grid">
          {[
            [Plane, t.s1Title, t.s1Text],
            [Headphones, t.s2Title, t.s2Text],
            [CarFront, t.s3Title, t.s3Text],
          ].map(([Icon, title, text], i) => {
            const I = Icon as typeof Plane;
            return (
              <article key={String(title)}>
                <div>
                  <I size={28} />
                  <span>0{i + 1}</span>
                </div>
                <h3>{String(title)}</h3>
                <p>{String(text)}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
const importedMedia = Object.keys(import.meta.glob('/public/media/*.{mp4,webm,jpg,jpeg,png,webp}')).map(path => path.replace('/public',''));
function Social() {
  const {content}=useContent();
  const { t } = useLanguage();
  const [selected,setSelected] = useState<string | null>(null);
  const photos = [...content.media.map(m=>m.url),...importedMedia.filter(path=>!path.match(/\.(mp4|webm)$/i))];
  const videos = importedMedia.filter(path=>path.match(/\.(mp4|webm)$/i));
  if (!photos.length && !videos.length) return null;
  return <section className="p-container t-gallery p-section">
    <div className="p-section-heading"><div><Label>TESLA · MONASTIR</Label><h2>{t.photos}</h2></div><Camera size={30}/></div>
    <div className="grid gap-5 md:grid-cols-2">{photos.map((src,i)=><button key={src} className="group relative overflow-hidden rounded-3xl text-start" onClick={()=>setSelected(src)} aria-label={t.photos+' '+(i+1)}><img src={src} alt={content.media.find(m=>m.url===src)?.alt || 'TESLA Rent Car'} loading="lazy" className="h-80 w-full object-cover transition-transform duration-500 group-hover:scale-105"/><span className="absolute bottom-5 left-5 flex items-center gap-3 rounded-full bg-white px-5 py-3 text-sm font-semibold"><Plus size={16}/>{t.photos}</span></button>)}</div>
    {videos.length>0 && <div className="mt-8 grid gap-5 md:grid-cols-2">{videos.map(src=><video key={src} src={src} controls playsInline preload="metadata" className="w-full rounded-3xl bg-black" aria-label={t.videos}/>)}</div>}
    <Dialog open={selected!==null} onOpenChange={open=>!open&&setSelected(null)} title={t.photos}>{selected&&<img src={selected} alt={t.photos} className="max-h-[75vh] w-full object-contain"/>}</Dialog>
  </section>;
}
function Agency() {
  const { lang, t } = useLanguage();
  const [mapType, setMapType] = useState("k");
  const [loaded, setLoaded] = useState(false);
  const contactLink = useContactLink();
  return (
    <section id="agence" className="p-agency p-section">
      <div className="p-container p-agency-grid">
        <div>
          <Label>{t.mapLabel}</Label>
          <h2>{t.mapTitle}</h2>
          <p>{t.mapText}</p>
          <div className="p-agency-contact">
            <MapPin size={21} />
            <span>
              TESLA RENT CAR<small>{t.address}</small>
            </span>
          </div>
          <a href="tel:+21621119123" className="p-agency-phone">
            <Phone size={19} />
            <bdi>+216 21 119 123</bdi>
          </a>
          <div className="p-agency-buttons">
            <a
              className="p-button"
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
            >
              <Navigation size={16} />
              {t.directions}
              <ArrowUpRight size={15} />
            </a>
            <a
              className="p-textlink"
              href={contactLink}
            >
              {t.write}
              <Mail size={16} />
            </a>
          </div>
        </div>
        <div className="p-map-panel">
          <div className="p-map-toolbar">
            <div role="group" aria-label={t.map}>
              <button
                className={mapType === "k" ? "selected" : ""}
                onClick={() => {
                  setMapType("k");
                  setLoaded(true);
                }}
              >
                {t.satellite}
              </button>
              <button
                className={mapType === "m" ? "selected" : ""}
                onClick={() => {
                  setMapType("m");
                  setLoaded(true);
                }}
              >
                {t.map}
              </button>
            </div>
            <a href={earthUrl} target="_blank" rel="noreferrer">
              <Globe2 size={15} /> {t.earth}
              <ArrowUpRight size={14} />
            </a>
          </div>
          {loaded ? (
            <iframe
              title={`${t.map} — TESLA Rent Car, Monastir`}
              src={`https://maps.google.com/maps?q=35.7733196,10.8352449&z=18&t=${mapType}&hl=${lang === "tn" ? "ar" : lang}&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          ) : (
            <div className="p-map-placeholder">
              <img src="/images/monastir-ribat.webp" alt="" loading="lazy" />
              <div>
                <MapPin size={31} />
                <strong>TESLA RENT CAR</strong>
                <span dir="ltr">35.7733196, 10.8352449</span>
                <button className="p-button" onClick={() => setLoaded(true)}>
                  {t.loadMap}
                  <ArrowUpRight size={16} />
                </button>
                <small>{t.mapPrivacy}</small>
              </div>
            </div>
          )}
          <p>{t.mapNote}</p>
        </div>
      </div>
    </section>
  );
}
function Catalogue() {
  const { t } = useLanguage();
  return (
    <>
      <div className="p-page-intro p-container">
        <Label>TESLA RENT CAR · MONASTIR</Label>
        <h1>{t.cars}</h1>
        <p>{t.fleetText}</p>
        <SearchBox />
      </div>
      <Fleet catalogue />
    </>
  );
}
function Detail() {
  const fleet=useFleet();
  const {loading}=useContent();
  const [activeImage,setActiveImage]=useState<string|null>(null);
  const { id } = useParams();
  const { t } = useLanguage();
  const [params] = useSearchParams();
  const car = fleet.find((c) => c.id === id);
  if (!car) return loading?<main className="p-container p-section">{t.loading}</main>:<NotFound />;
  return (
    <main className="p-container p-detail p-section">
      <Link className="p-textlink" to="/vehicules">
        ← {t.cars}
      </Link>
      <div className="p-detail-grid">
        <div>
          <img
            className="p-detail-image"
            src={activeImage && [car.image,...car.images||[]].includes(activeImage)?activeImage:car.image}
            alt={`${car.brand} ${car.name}`}
          />
          <div className="t-car-thumbs">{[car.image,...car.images||[]].map(src=><button key={src} onClick={()=>setActiveImage(src)} aria-label={t.photos} aria-pressed={(activeImage||car.image)===src}><img src={src} alt={car.name}/></button>)}</div>
          <p className="p-demo-fleet">{t.demoFleet}</p>
        </div>
        <div>
          <Label>{car.brand}</Label>
          <h1>{car.name}</h1>
          <p>{car.description || t.detailText}</p>
          <div className="p-detail-specs">
            <span>
              <Gauge />
              {car.transmission === "Automatique" ? t.Automatic : t.Manual}
            </span>
            <span>
              <Users />
              {car.seats} {t.seats}
            </span>
            <span>
              <Fuel />
              {t[car.fuel as TranslationKey] || car.fuel}
            </span>
          </div>
          <h3>{t.equipment}</h3>
          <ul>
            {car.features.map((f) => (
              <li key={f}>
                <Check size={16} />
                {f}
              </li>
            ))}
          </ul>
          <div className="p-detail-price">
            <span>{t.from}</span>
            <strong>
              {amount(car.price)} <small>DT / {t.day}</small>
            </strong>
          </div>
          <Link
            to={`/reservation/${car.id}?${params}`}
            className="p-button p-wide"
          >
            {t.book}
            <ArrowRight size={18} />
          </Link>
          <p className="p-small">{t.priceNote}</p>
        </div>
      </div>
    </main>
  );
}
function Reservation() {
  const fleet=useFleet();
  const {loading}=useContent();
  const { id } = useParams();
  const { t } = useLanguage();
  const [params] = useSearchParams();
  const [stay, setStay] = useState(() => initialStay(params));
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [insurance, setInsurance] = useState(false);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<"dates" | "contact" | "send" | null>(null);
  const [reference, setReference] = useState("");
  const car = fleet.find((c) => c.id === id);
  if (!car) return loading?<main className="p-container p-section">{t.loading}</main>:<NotFound />;
  const days = rentalDays(stay.start, stay.end);
  const billedDays = rentalPeriodDays(
    stay.start,
    stay.end,
    stay.startTime,
    stay.endTime,
  );
  const total = quote(car.price, days ? billedDays : 0, insurance);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!validStay(stay)) {
      setError("dates");
      return;
    }
    if (step === 1) {
      setStep(2);
      return;
    }
    if (
      name.trim().length < 2 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !/^[+\d\s().-]{8,30}$/.test(phone.trim()) ||
      !consent
    ) {
      setError("contact");
      return;
    }
    setBusy(true);
    const booking: Booking = {
      id: crypto.randomUUID(),
      vehicleId: car!.id,
      vehicleName: `${car!.brand} ${car!.name}`,
      start: stay.start,
      end: stay.end,
      startTime: stay.startTime,
      endTime: stay.endTime,
      location: stay.location,
      returnLocation: stay.same ? stay.location : stay.returnLocation,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      insurance,
      total,
      status: "En attente",
      createdAt: new Date().toISOString(),
    };
    try {
      setReference(await saveBooking(booking));
      setStep(3);
    } catch {
      setError("send");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="p-container p-section p-booking">
      <Label>TESLA RENT CAR · MONASTIR</Label>
      <h1>{t.bookingTitle}</h1>
      <div className="p-steps">
        {[t.stay, t.customer, t.request].map((text, i) => (
          <span className={step >= i + 1 ? "active" : ""} key={i}>
            <b>{step > i + 1 ? <Check size={14} /> : i + 1}</b>
            {text}
          </span>
        ))}
      </div>
      {step === 3 ? (
        <div className="p-confirmation">
          <CheckCircle2 size={55} />
          <h2>{isDemo ? t.savedDemo : t.saved}</h2>
          <p>{isDemo ? t.demoNotice : t.savedText}</p>
          <small>{t.reference}</small>
          <strong>{reference.slice(0, 8).toUpperCase()}</strong>
          <a
            href={emailHref(`${reference.slice(0, 8).toUpperCase()} — ${car.brand} ${car.name}, ${stay.start} ${stay.startTime} / ${stay.end} ${stay.endTime}.`)}
            className="p-button"
          >
            {t.contactAgency}
            <Mail size={18} />
          </a>
          <Link to="/vehicules" className="p-textlink">
            {t.allCars}
            <ArrowRight size={17} />
          </Link>
        </div>
      ) : (
        <div className="p-booking-grid">
          <form className="p-booking-form" onSubmit={submit}>
            {isDemo && <p className="p-notice">{t.demoNotice}</p>}
            <h2>{step === 1 ? t.stay : t.customer}</h2>
            {step === 1 ? (
              <>
                <StayFields stay={stay} setStay={setStay} />
                <label className="p-option">
                  <input
                    type="checkbox"
                    checked={insurance}
                    onChange={(e) => setInsurance(e.target.checked)}
                  />
                  <span>
                    {t.insurance}
                    <small>{t.insuranceNote}</small>
                  </span>
                  <ShieldCheck size={23} />
                </label>
                <p className="p-small">
                  {t.locationNotice} {t.priceNote}
                </p>
              </>
            ) : (
              <>
                <label>
                  {t.fullName}
                  <input
                    required
                    maxLength={120}
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>
                <label>
                  {t.email}
                  <input
                    required
                    type="email"
                    maxLength={180}
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>
                <label>
                  {t.phone}
                  <input
                    required
                    type="tel"
                    minLength={8}
                    maxLength={30}
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </label>
                <label className="p-consent">
                  <input
                    type="checkbox"
                    required
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                  />
                  <span>{t.consent}</span>
                </label>
              </>
            )}
            {error && (
              <p role="alert" className="p-error">
                {error === "dates"
                  ? t.datesError
                  : error === "contact"
                    ? t.invalidContact
                    : t.sendError}
              </p>
            )}
            <div className="p-form-actions">
              {step === 2 && (
                <button
                  type="button"
                  className="p-textlink"
                  onClick={() => setStep(1)}
                >
                  {t.back}
                </button>
              )}
              <button className="p-button" type="submit" disabled={busy}>
                {busy ? t.sending : step === 1 ? t.continue : t.send}
                <ArrowRight size={17} />
              </button>
            </div>
          </form>
          <aside className="p-summary">
            <img src={car.image} alt={car.name} />
            <small>{car.brand}</small>
            <h3>{car.name}</h3>
            <div>
              <span>
                {days ? billedDays : 0} × {amount(car.price)} DT / {t.day}
              </span>
              <b>{amount(car.price * (days ? billedDays : 0))} DT</b>
            </div>
            {insurance && (
              <div>
                <span>{t.insurance}</span>
                <b>{amount(19 * (days ? billedDays : 0))} DT</b>
              </div>
            )}
            <div className="p-summary-total">
              <span>{t.estimated}</span>
              <strong>
                {amount(total)} <small>DT</small>
              </strong>
            </div>
            <p>{t.priceNote}</p>
            <span className="p-no-payment">
              <ShieldCheck size={17} />
              {t.trust4}
            </span>
          </aside>
        </div>
      )}
    </main>
  );
}
function NotFound() {
  const { t } = useLanguage();
  return (
    <main className="p-container p-section p-empty">
      <Label>404</Label>
      <h1>{t.notFound}</h1>
      <Link to="/" className="p-button">
        {t.backHome}
        <ArrowRight size={17} />
      </Link>
    </main>
  );
}
export default function PublicSite() {
  const {content}=useContent();
  const location = useLocation();
  const [dark,setDark] = useState(() => {try {const saved=localStorage.getItem("tesla-theme");return saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;}catch{return false;}});
  useEffect(()=>{document.documentElement.dataset.teslaTheme=dark?"dark":"light";try{localStorage.setItem("tesla-theme",dark?"dark":"light");}catch{} return ()=>{delete document.documentElement.dataset.teslaTheme;};},[dark]);
  const { t } = useLanguage();
  const contactLink = useContactLink();
  useEffect(() => {
    if (location.hash) {
      requestAnimationFrame(() =>
        document
          .getElementById(location.hash.slice(1))
          ?.scrollIntoView({ behavior: "smooth" }),
      );
    } else window.scrollTo(0, 0);
  }, [location.pathname, location.hash]);
  return (
    <div className="public-site" data-theme={dark ? "dark" : "light"} style={themeStyle(content,dark)}>
      <Header dark={dark} toggleTheme={()=>setDark(value=>!value)} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/vehicules" element={<Catalogue />} />
        <Route path="/vehicules/:id" element={<Detail />} />
        <Route path="/reservation/:id" element={<Reservation />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Contact />
      <Footer />
      <div className="t-contact-dock">
      <a href={whatsappHref} className="t-whatsapp" aria-label="WhatsApp" title="WhatsApp" target="_blank" rel="noreferrer"><WhatsAppIcon size={24}/></a>
      <a
        href={contactLink}
        className="p-floating"
        aria-label={t.contactAgency}
      >
        <Mail size={24} />
        <span>E-mail</span>
      </a>
      </div>
    </div>
  );
}
