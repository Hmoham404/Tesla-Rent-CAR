import React from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../src/App";
import { dictionaries, languages } from "../src/i18n";
beforeEach(() => localStorage.clear());
afterEach(() => cleanup());
function mount(route = "/") {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>,
  );
}
describe("Multilingual rental experience", () => {
  it("opens photos inside the site without redirecting to Facebook media", () => {
    mount();
    expect(document.querySelector('a[href*="facebook.com/teslarentcar/videos"]')).toBeNull();
    expect(document.querySelector('a[href*="facebook.com/teslarentcar/photos"]')).toBeNull();
    expect(document.querySelectorAll('.t-destination-card')).toHaveLength(4);
    fireEvent.click(screen.getByRole("button", { name: "Découvrir Sousse" }));
    expect(screen.getByRole("dialog").querySelector("img")?.getAttribute("src")).toBe("/images/sousse.webp");
    expect(screen.getByRole('link', {name:'Voir sur la carte'}).getAttribute('href')).toContain('Sousse');
    fireEvent.click(screen.getByRole("button", { name: "Fermer" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
  it("persists the theme and offers email alongside WhatsApp", () => {
    mount();
    fireEvent.click(screen.getByRole('button', {name:'Mode nuit'}));
    expect(localStorage.getItem('tesla-theme')).toBe('dark');
    expect(document.querySelector('.public-site')?.getAttribute('data-theme')).toBe('dark');
    const dock=document.querySelector('.t-contact-dock');
    expect(dock?.querySelector('a[href="https://wa.me/21621119123"]')).toBeTruthy();
    expect(dock?.querySelector('a[href^="mailto:tesla.rentcar.pro@gmail.com"]')).toBeTruthy();
    cleanup();mount();
    expect(screen.getByRole('button', {name:'Mode jour'})).toBeTruthy();
    fireEvent.click(screen.getByRole('button', {name:'Mode jour'}));
    expect(document.documentElement.dataset.teslaTheme).toBe('light');
  });
  it("translates the site in all five languages, persists selection and switches RTL", () => {
    mount();
    for (const language of languages) {
      fireEvent.click(screen.getByRole("button", { name: language.label }));
      expect(document.documentElement.lang).toBe(language.html);
      expect(document.documentElement.dir).toBe(
        language.code === "tn" ? "rtl" : "ltr",
      );
      expect(screen.getByRole("heading", { level: 1 }).textContent).toContain(
        dictionaries[language.code].heroTitle,
      );
      expect(
        screen.getByRole("button", {
          name: dictionaries[language.code].search,
        }),
      ).toBeTruthy();
      expect(localStorage.getItem("tesla-language")).toBe(language.code);
    }
    expect(document.querySelectorAll(".p-languages img")).toHaveLength(5);
    cleanup();
    mount();
    expect(document.documentElement.lang).toBe("es");
  });
  it("preserves entered dates and times while changing language", () => {
    mount();
    const input = screen.getByLabelText("Date de départ") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "2028-04-11" } });
    fireEvent.click(screen.getByRole("button", { name: "English" }));
    expect(
      (screen.getByLabelText("Pick-up date") as HTMLInputElement).value,
    ).toBe("2028-04-11");
  });
  it("filters cars and recovers from an empty result", () => {
    mount("/vehicules");
    fireEvent.change(
      screen.getByRole("textbox", { name: "Marque ou modèle…" }),
      { target: { value: "does not exist" } },
    );
    expect(screen.getByText(dictionaries.fr.noResults)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Réinitialiser" }));
    expect(document.querySelectorAll(".p-car")).toHaveLength(6);
    fireEvent.click(screen.getByRole("button", { name: "SUV" }));
    expect(document.querySelectorAll(".p-car")).toHaveLength(1);
    expect(screen.getByRole("heading", { name: "CR-V" })).toBeTruthy();
  });
  it("carries both locations, dates and times from search into booking", () => {
    mount();
    fireEvent.change(screen.getByLabelText("Lieu de prise en charge"), {
      target: { value: "Aéroport de Monastir" },
    });
    fireEvent.click(
      screen.getByRole("checkbox", { name: "Restitution au même endroit" }),
    );
    fireEvent.change(screen.getByLabelText("Lieu de restitution"), {
      target: { value: "Aéroport d’Enfidha" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Rechercher un véhicule" }),
    );
    const links = screen.getAllByRole("link", { name: /Réserver/ }).filter(link => link.closest('.p-car'));
    expect(links[0].getAttribute("href")).toContain("returnLocation=");
    fireEvent.click(links[0]);
    expect(
      (screen.getByLabelText("Lieu de prise en charge") as HTMLSelectElement)
        .value,
    ).toBe("Aéroport de Monastir");
    expect(
      (screen.getByLabelText("Lieu de restitution") as HTMLSelectElement).value,
    ).toBe("Aéroport d’Enfidha");
  });
  it("completes a demo booking without losing data on language switch", async () => {
    mount(
      "/reservation/mercedes-amg-gt?start=2028-04-11&end=2028-04-14&startTime=10:00&endTime=11:00&location=Agence+TESLA",
    );
    fireEvent.click(screen.getByRole("button", { name: "Continuer" }));
    fireEvent.change(screen.getByLabelText("Nom complet"), {
      target: { value: "Test Client" },
    });
    fireEvent.change(screen.getByLabelText("E-mail"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(dictionaries.fr.phone), {
      target: { value: "+21621119123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "English" }));
    expect((screen.getByLabelText("Full name") as HTMLInputElement).value).toBe(
      "Test Client",
    );
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Send my request" }));
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: dictionaries.en.savedDemo }),
      ).toBeTruthy(),
    );
    const bookings = JSON.parse(localStorage.getItem("tesla-bookings-v1")!);
    expect(bookings).toHaveLength(1);
    expect(bookings[0].startTime).toBe("10:00");
    expect(bookings[0].endTime).toBe("11:00");
    expect(bookings[0].total).toBe(480);
    expect(bookings[0].returnLocation).toBe("Agence TESLA");
  });
  it("opens the exact satellite map and provides a separate Earth 3D link", () => {
    mount();
    expect(document.querySelector(".p-map-panel iframe")).toBeNull();
    fireEvent.click(
      screen.getByRole("button", { name: "Afficher la carte interactive" }),
    );
    expect(document.querySelector("iframe")?.getAttribute("src")).toContain(
      "35.7733196,10.8352449",
    );
    const earth = screen.getByRole("link", { name: "Explorer en 3D" });
    expect(earth.getAttribute("href")).toContain("earth.google.com");
    expect(earth.getAttribute("target")).toBe("_blank");
  });
});
