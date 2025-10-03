import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { fallbackEvents } from "../data/eventsFallback";
import { fallbackTeamMembers } from "../data/team";
import {
  getEventBySlug,
  getEvents,
  getTeamMemberBySlug,
  getTeamMembers,
} from "../utils/strapiContent";

const createResponse = (payload: unknown, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });

describe("strapiContent helpers", () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeAll(() => {
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterAll(() => {
    warnSpy.mockRestore();
  });

  it("convierte la respuesta de Strapi en eventos de dominio", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      createResponse({
        data: [
          {
            id: 1,
            attributes: {
              slug: "festival", 
              title: "Festival de prueba",
              shortDescription: "Celebración comunitaria",
              description: "Primer párrafo.\n\nSegundo párrafo.",
              date: "2026-04-05",
              location: "Quito",
              tags: ["cultura", "comunidad"],
              image: {
                data: {
                  id: 10,
                  attributes: { url: "/uploads/festival.jpg" },
                },
              },
            },
          },
        ],
      })
    );

    const events = await getEvents({ fetcher, baseUrl: "https://cms.test" });
    expect(fetcher).toHaveBeenCalledWith(
      expect.stringContaining("https://cms.test/api/events"),
      expect.any(Object)
    );
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      slug: "festival",
      title: "Festival de prueba",
      shortDescription: "Celebración comunitaria",
      description: ["Primer párrafo.", "Segundo párrafo."],
      image: "https://cms.test/uploads/festival.jpg",
      tags: ["cultura", "comunidad"],
    });
  });

  it("recupera datos de respaldo cuando la API falla", async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error("fallo de red"));
    const events = await getEvents({ fetcher, fallback: fallbackEvents });
    expect(events).toHaveLength(fallbackEvents.length);
    expect(events[0].slug).toBe(fallbackEvents[0].slug);
  });

  it("convierte la respuesta de Strapi en integrantes del equipo", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      createResponse({
        data: [
          {
            id: 1,
            attributes: {
              slug: "ana",
              name: "Ana Test",
              role: "Coordinadora",
              shortBio: "Bio breve",
              bio: "Párrafo uno.\n\nPárrafo dos.",
              focus: "Innovación",
              expertise: ["Gestión", "Incidencia"],
              highlights: ["Facilita procesos", "Diseña herramientas"],
              socials: [
                {
                  platform: "instagram",
                  label: "Instagram de Ana",
                  url: "https://instagram.com/ana",
                },
              ],
              image: {
                data: {
                  id: 7,
                  attributes: { url: "/uploads/ana.jpg" },
                },
              },
            },
          },
        ],
      })
    );

    const team = await getTeamMembers({ fetcher, baseUrl: "https://cms.test" });
    expect(team).toHaveLength(1);
    expect(team[0]).toMatchObject({
      slug: "ana",
      name: "Ana Test",
      role: "Coordinadora",
      focus: "Innovación",
      socials: [
        {
          platform: "instagram",
          label: "Instagram de Ana",
          url: "https://instagram.com/ana",
        },
      ],
    });
  });

  it("usa la data local cuando no existe el perfil solicitado", async () => {
    const fetcher = vi.fn().mockResolvedValue(createResponse({ data: [] }));
    const fallbackSlug = fallbackTeamMembers[0]?.slug ?? "";
    const member = await getTeamMemberBySlug(fallbackSlug, { fetcher });
    if (fallbackSlug) {
      expect(member).toMatchObject({ slug: fallbackSlug });
    } else {
      expect(member).toBeUndefined();
    }
  });

  it("puede recuperar un evento específico", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      createResponse({
        data: [
          {
            id: 3,
            attributes: {
              slug: "festival", 
              title: "Festival de prueba",
              shortDescription: "Celebración comunitaria",
              description: "Texto",
              date: "2026-04-05",
              location: "Quito",
            },
          },
        ],
      })
    );

    const event = await getEventBySlug("festival", { fetcher });
    expect(event).toBeDefined();
    expect(event?.slug).toBe("festival");
  });
});
