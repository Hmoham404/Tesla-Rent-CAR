import { lazy, Suspense, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./i18n";
import PublicSite from "./PublicSite";
import { ContentProvider } from './lib/content';
const Admin = lazy(() => import("./Admin"));
function AdminRoute() {
  useEffect(() => {
    document.documentElement.lang = "fr";
    document.documentElement.dir = "ltr";
    document.title = "TESLA Rent Car — Administration";
  }, []);
  return (
    <Suspense fallback={<p style={{ padding: 40 }}>Chargement…</p>}>
      <Admin />
    </Suspense>
  );
}
export default function App() {
  return (
    <ContentProvider><Routes>
      <Route path="/admin" element={<AdminRoute />} />
      <Route
        path="*"
        element={
          <LanguageProvider>
            <PublicSite />
          </LanguageProvider>
        }
      />
    </Routes></ContentProvider>
  );
}
