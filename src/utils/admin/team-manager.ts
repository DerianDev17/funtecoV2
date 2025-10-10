import { fallbackTeamMembers, type TeamMember } from "../../data/team";

const cloneMember = (member: TeamMember): TeamMember => ({
  ...member,
  bio: [...member.bio],
  expertise: [...member.expertise],
  highlights: [...member.highlights],
  socials: member.socials.map((social) => ({ ...social })),
});

type MutationSuccess = {
  ok: true;
  members: TeamMember[];
};

type MutationError = {
  ok: false;
  error: string;
};

export type MutationResult = MutationSuccess | MutationError;

export class TeamContentManager {
  private members = new Map<string, TeamMember>();

  constructor(initialMembers: TeamMember[] = []) {
    this.replaceAll(initialMembers);
  }

  list(): TeamMember[] {
    return Array.from(this.members.values()).map((member) => cloneMember(member));
  }

  findBySlug(slug: string) {
    const member = this.members.get(slug);
    return member ? cloneMember(member) : undefined;
  }

  add(member: TeamMember): MutationResult {
    if (this.members.has(member.slug)) {
      return {
        ok: false,
        error: `Ya existe un integrante con el identificador "${member.slug}"`,
      };
    }

    this.members.set(member.slug, cloneMember(member));

    return {
      ok: true,
      members: this.list(),
    };
  }

  remove(slug: string): MutationResult {
    if (!this.members.has(slug)) {
      return {
        ok: false,
        error: `No se encontró el integrante con el identificador "${slug}"`,
      };
    }

    this.members.delete(slug);

    return {
      ok: true,
      members: this.list(),
    };
  }

  replaceAll(members: TeamMember[]) {
    this.members.clear();
    members.forEach((member) => {
      this.members.set(member.slug, cloneMember(member));
    });
  }
}

export const defaultTeamContentManager = new TeamContentManager(fallbackTeamMembers);
