import { beforeEach, describe, expect, it } from "vitest";
import { fallbackTeamMembers } from "../data/team";
import { TeamContentManager } from "../utils/admin/team-manager";

const sampleMember = {
  slug: "nueva-aliada",
  name: "Nueva Aliada",
  role: "Gestora de alianzas",
  image: "/images/team/nueva-aliada.jpg",
  shortBio: "Coordina colaboraciones estratégicas",
  bio: ["Cuenta con más de diez años en articulación institucional."],
  focus: "Alianzas interinstitucionales",
  expertise: ["Gestión de convenios", "Vinculación comunitaria"],
  highlights: ["Impulsó la red de voluntariado 2023"],
  socials: [
    { platform: "linkedin" as const, label: "LinkedIn", url: "https://linkedin.com/in/nueva-aliada" },
  ],
};

describe("manejador de equipo", () => {
  let manager: TeamContentManager;

  beforeEach(() => {
    manager = new TeamContentManager(fallbackTeamMembers);
  });

  it("lista copias independientes de los integrantes", () => {
    const list = manager.list();
    expect(list).toEqual(fallbackTeamMembers);
    expect(list).not.toBe(fallbackTeamMembers);
  });

  it("permite añadir un nuevo integrante", () => {
    const result = manager.add(sampleMember);
    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.members.some((member) => member.slug === sampleMember.slug)).toBe(true);
      const stored = manager.findBySlug(sampleMember.slug);
      expect(stored).toMatchObject({ name: sampleMember.name, role: sampleMember.role });
    }
  });

  it("impide duplicar integrantes", () => {
    expect(manager.add(sampleMember).ok).toBe(true);
    const duplicate = manager.add(sampleMember);
    expect(duplicate.ok).toBe(false);
    if (!duplicate.ok) {
      expect(duplicate.error).toContain(sampleMember.slug);
    }
  });

  it("elimina integrantes existentes", () => {
    manager.add(sampleMember);
    const removal = manager.remove(sampleMember.slug);
    expect(removal.ok).toBe(true);

    if (removal.ok) {
      expect(removal.members.some((member) => member.slug === sampleMember.slug)).toBe(false);
      expect(manager.findBySlug(sampleMember.slug)).toBeUndefined();
    }
  });
});
