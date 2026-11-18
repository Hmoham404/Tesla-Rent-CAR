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
  ArrowUpRight,
  ArrowRight,
  MapPin,
  CalendarDays,
  Users,
  Fuel,
  Gauge,
  ShieldCheck,
  Headphones,
  KeyRound,
  Menu,
  X,
  Check,
  CheckCircle2,
  Plus,
  Minus,
  Search,
  SlidersHorizontal,
  LockKeyhole,
  LayoutDashboard,
  CarFront,
  ClipboardList,
  LogOut,
  Download,
  MessageCircle,
  Globe2,
  Settings2,
} from "lucide-react";
import ContentEditor from "./ContentEditor";
import {useContent,themeStyle} from "./lib/content";
import "./admin-modern.css";
import { Button } from "./components/ui/button";
import { Dialog } from "./components/ui/dialog";
import {
  isDemo,
  address,
  whatsapp,
  readBookings,
  writeBookings,
  saveBooking,
  api,
  type Vehicle,
  type Booking,
} from "./lib/store";
import { rentalDays, quote } from "./lib/booking.mjs";

const money = (value: number) =>
  new Intl.NumberFormat("fr-TN", { maximumFractionDigits: 0 }).format(value);
const dateOffset = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const mapsUrl =
  import.meta.env.VITE_MAPS_URL || "https://maps.app.goo.gl/ckuUGLpHTbmA3gPbA";
const waUrl = `https://wa.me/${whatsapp || "21621119123"}?text=${encodeURIComponent("Bonjour TESLA Rent Car, je souhaite louer un véhicule.")}`;
function Brand() {
  const {content}=useContent();
  return (
    <Link to="/" className="brand admin-brand-logo" aria-label="TESLA Rent Car">
      <img
        src={content.theme.logo}
        alt="TESLA Rent Car"
        width={180} height={88}
      />
    </Link>
  );
}
export default function Admin() {
  const {content}=useContent();
  const [dirty,setDirty]=useState(false);
  const [dark,setDark]=useState(()=>{try{return localStorage.getItem("tesla-theme")==="dark"}catch{return false}});
  useEffect(()=>{try{localStorage.setItem("tesla-theme",dark?"dark":"light")}catch{/* Private browser storage may be unavailable. */}document.documentElement.dataset.teslaTheme=dark?"dark":"light";return()=>{delete document.documentElement.dataset.teslaTheme}},[dark]);
  const [auth, setAuth] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [section, setSection] = useState("Vue d’ensemble");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState("Toutes");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Booking | null>(null);
  async function load() {
    if (isDemo) {
      setBookings(readBookings());
      return;
    }
    const result = await api("admin/bookings", undefined, "GET");
    setBookings(result.bookings);
  }
  useEffect(() => {
    api("admin/session", undefined, "GET")
      .then(async () => {
        setAuth(true);
        try { await load(); } catch(e) { setError((e as Error).message); }
      })
      .catch(() => {});
  }, []);
  async function login(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("admin/login", { code });
      setAuth(true);
      setCode("");
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function updateStatus(id: string, status: Booking["status"]) {
    try {
      if (!isDemo) await api("admin/bookings", { id, status }, "PATCH");
      const next = bookings.map((b) => (b.id === id ? { ...b, status } : b));
      if (isDemo) writeBookings(next);
      setBookings(next);
      setSelected(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  function exportJson() {
    const blob = new Blob([JSON.stringify(bookings, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tesla-reservations-${dateOffset(0)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  if (!auth)
    return (
      <main className="admin-login admin-modern" data-theme={dark?"dark":"light"} style={themeStyle(content,dark)}>
        <div className="login-art">
          <img className="login-photo" src="/images/hero.webp" alt="Une berline sur une route bordée de paysages naturels" fetchPriority="high" />
          <Brand />
          <h1>
            L’exigence,
            <br />
            dans chaque
            <br />
            <em>détail.</em>
          </h1>
          <span>TESLA RENT CAR · ESPACE PRIVÉ</span>
        </div>
        <div className="login-form">
          <form onSubmit={login}>
            <LockKeyhole size={30} />
            <p className="eyebrow">BIENVENUE DANS VOTRE ESPACE</p>
            <h2>Tout commence ici.</h2>
            <p>Connectez-vous avec votre code administrateur.</p>
            <label>
              Code d’accès
              <input
                autoComplete="current-password"
                type="password"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Votre code confidentiel"
              />
            </label>
            {error && (
              <p role="alert" className="error">
                {error}
              </p>
            )}
            <Button type="submit" disabled={busy} className="wide">
              {busy ? "Vérification…" : "Accéder au dashboard"}
              <ArrowRight size={17} />
            </Button>
            <Link to="/" className="text-link">
              Revenir au site <ArrowUpRight size={15} />
            </Link>
          </form>
        </div>
      </main>
    );
  const filtered = bookings.filter(
    (b) =>
      (filter === "Toutes" || b.status === filter) &&
      `${b.name} ${b.vehicleName} ${b.id}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <div className="admin-shell admin-modern" data-theme={dark?"dark":"light"} style={themeStyle(content,dark)}>
      <aside className="admin-sidebar">
        <Brand />
        <span className="eyebrow">VOTRE ESPACE</span>
        {[
          ["Vue d’ensemble", LayoutDashboard],
          ["Réservations", ClipboardList],
          ["Véhicules", CarFront],
          ["Médiathèque", Plus],
          ["Configuration", Settings2],
        ].map(([label, Icon]) => {
          const I = Icon as typeof LayoutDashboard;
          return (
            <button
              key={String(label)}
              className={section === label ? "active" : ""}
              onClick={() => {if(!dirty||window.confirm("Des modifications ne sont pas enregistrées. Quitter cet écran ?")){setDirty(false);setSection(String(label));}}}
            >
              <I size={18} />
              {String(label)}
            </button>
          );
        })}
        <div className="sidebar-bottom">
          <Link to="/">
            Voir le site <ArrowUpRight size={16} />
          </Link>
          <button
            onClick={async () => {
              try {
                await api("admin/logout");
                setAuth(false);
                setBookings([]);
              } catch (e) {
                setError((e as Error).message);
              }
            }}
          >
            <LogOut size={17} /> Déconnexion
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <header className="admin-header">
          <span>TESLA / {section}</span>
          <button className="cms-theme" onClick={()=>setDark(!dark)}>{dark?"Mode jour":"Mode nuit"}</button>
        </header>
        <div className="admin-title">
          <div>
            <p className="eyebrow">L’ART DE TOUT MAÎTRISER</p>
            <h1>
              {section === "Vue d’ensemble" ? "Bonjour, bienvenue." : section}
            </h1>
            <p>Un regard sur votre activité. Chaque détail à sa place.</p>
          </div>
          <Button variant="outline" size="small" onClick={exportJson}>
            <Download size={15} /> Exporter JSON
          </Button>
        </div>
        <p className="notice">
          {isDemo
            ? "Mode démonstration · Les réservations affichées sont conservées dans ce navigateur uniquement."
            : "Mode Supabase · Données accessibles après authentification administrateur."}
        </p>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        {["Configuration","Véhicules","Médiathèque"].includes(section) ? (
          <ContentEditor key={section} section={section} onDirty={setDirty}/>
        ) : (
          <>
            <div className="stats-grid">
              <div>
                <ClipboardList size={20} />
                <span>Demandes reçues</span>
                <strong>{bookings.length.toString().padStart(2, "0")}</strong>
                <small>Toutes les demandes</small>
              </div>
              <div>
                <CalendarDays size={20} />
                <span>À confirmer</span>
                <strong>
                  {bookings
                    .filter((b) => b.status === "En attente")
                    .length.toString()
                    .padStart(2, "0")}
                </strong>
                <small>Votre attention est attendue</small>
              </div>
              <div>
                <CheckCircle2 size={20} />
                <span>Réservations confirmées</span>
                <strong>
                  {bookings
                    .filter((b) => b.status === "Confirmée")
                    .length.toString()
                    .padStart(2, "0")}
                </strong>
                <small>Prêtes pour le départ</small>
              </div>
              <div>
                <CarFront size={20} />
                <span>Volume estimé confirmé</span>
                <strong>
                  {money(
                    bookings
                      .filter((b) => b.status === "Confirmée")
                      .reduce((s, b) => s + b.total, 0),
                  )}
                  <small> DT</small>
                </strong>
                <small>Estimations, hors encaissements</small>
              </div>
            </div>
            <section className="bookings-panel">
              <div className="panel-title">
                <h2>Les prochains départs</h2>
                <span>{bookings.length} demandes</span>
              </div>
              <div className="admin-filters">
                <div className="filter-pills">
                  {["Toutes", "En attente", "Confirmée", "Annulée"].map((s) => (
                    <button
                      key={s}
                      className={filter === s ? "selected" : ""}
                      onClick={() => setFilter(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <label className="search-input">
                  <Search size={15} />
                  <input
                    aria-label="Rechercher une réservation"
                    placeholder="Rechercher…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </label>
              </div>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Client / Référence</th>
                      <th>Véhicule</th>
                      <th>Séjour</th>
                      <th>Estimation</th>
                      <th>Statut</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((b) => (
                      <tr key={b.id}>
                        <td>
                          <strong>{b.name}</strong>
                          <small>#{b.id.slice(0, 8).toUpperCase()}</small>
                        </td>
                        <td>{b.vehicleName}</td>
                        <td>
                          {b.start}
                          <small>au {b.end}</small>
                        </td>
                        <td>{money(b.total)} DT</td>
                        <td>
                          <span
                            className={`status ${b.status === "Confirmée" ? "confirmed" : b.status === "Annulée" ? "cancelled" : ""}`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="icon-button"
                            aria-label={`Détails de la demande de ${b.name}`}
                            onClick={() => setSelected(b)}
                          >
                            <ArrowUpRight size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!filtered.length && (
                  <div className="empty-state">
                    <ClipboardList size={32} />
                    <h3>
                      {bookings.length
                        ? "Aucun résultat."
                        : "Le prochain voyage commence ici."}
                    </h3>
                    <p>
                      {bookings.length
                        ? "Essayez un autre filtre."
                        : "Les demandes de réservation apparaîtront dans cet espace."}
                    </p>
                    <Link to="/vehicules" className="text-link">
                      Explorer la collection <ArrowUpRight size={16} />
                    </Link>
                  </div>
                )}
              </div>
            </section>
          </>
        )}
        <Dialog
          open={!!selected}
          onOpenChange={(o) => !o && setSelected(null)}
          title="Détails de la demande"
        >
          {selected && (
            <div className="booking-details">
              <p>Référence : {selected.id.slice(0, 8).toUpperCase()}</p>
              <h3>{selected.vehicleName}</h3>
              <p>
                {selected.name}
                <br />
                <a href={`mailto:${selected.email}`}>{selected.email}</a>
                <br />
                <a href={`tel:${selected.phone}`}>{selected.phone}</a>
              </p>
              <p>
                Du {selected.start} à {selected.startTime || "10:00"} au{" "}
                {selected.end} à {selected.endTime || "10:00"}
                <br />
                Départ : {selected.location}
                <br />
                Retour : {selected.returnLocation || selected.location}
                <br />
                Protection complémentaire :{" "}
                {selected.insurance ? "Demandée" : "Non demandée"}
                <br />
                Estimation : {money(selected.total)} DT
              </p>
              <div className="form-actions">
                <Button
                  variant="outline"
                  onClick={() => updateStatus(selected.id, "Annulée")}
                >
                  Annuler
                </Button>
                <Button onClick={() => updateStatus(selected.id, "Confirmée")}>
                  Confirmer <Check size={16} />
                </Button>
              </div>
            </div>
          )}
        </Dialog>
      </main>
    </div>
  );
}
