import { describe, expect, it } from "vitest";
import { fallbackEvents } from "../data/eventsFallback";
import { fallbackTeamMembers } from "../data/team";
import {
  getEventBySlug,
  getEvents,
  getTeamMemberBySlug,
  getTeamMembers,
} from "../utils/content";

describe("content helpers", () => {
  it("devuelve copias independientes de los eventos", async () => {
    const events = await getEvents();
    expect(events).toEqual(fallbackEvents);
    expect(events).not.toBe(fallbackEvents);

    if (events.length > 0) {
      events[0].tags.push("mutado");
      expect(fallbackEvents[0].tags).not.toContain("mutado");
    }
  });

  it("recupera un evento específico por slug", async () => {
    const target = fallbackEvents[0];
    if (!target) {
      expect(await getEventBySlug("inexistente")).toBeUndefined();
      return;
    }

    const event = await getEventBySlug(target.slug);
    expect(event).toEqual(target);
    expect(event).not.toBe(target);
  });

  it("devuelve el listado del equipo sin compartir referencias", async () => {
    const team = await getTeamMembers();
    expect(team).toEqual(fallbackTeamMembers);
    expect(team).not.toBe(fallbackTeamMembers);

    if (team.length > 0) {
      team[0].expertise.push("nueva habilidad");
      expect(fallbackTeamMembers[0].expertise).not.toContain("nueva habilidad");
    }
  });

  it("recupera integrantes por slug", async () => {
    const target = fallbackTeamMembers[0];
    if (!target) {
      expect(await getTeamMemberBySlug("inexistente")).toBeUndefined();
      return;
    }

    const member = await getTeamMemberBySlug(target.slug);
    expect(member).toEqual(target);
    expect(member).not.toBe(target);
  });
});
