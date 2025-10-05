import {
  fallbackEvents,
  getFallbackEventBySlug,
  type Event,
} from "../data/eventsFallback";
import {
  fallbackTeamMembers,
  getFallbackTeamMemberBySlug,
  type TeamMember,
} from "../data/team";

const cloneEvent = (event: Event): Event => ({
  ...event,
  description: [...event.description],
  tags: [...event.tags],
});

const cloneTeamMember = (member: TeamMember): TeamMember => ({
  ...member,
  bio: [...member.bio],
  expertise: [...member.expertise],
  highlights: [...member.highlights],
  socials: member.socials.map((social) => ({ ...social })),
});

export async function getEvents(): Promise<Event[]> {
  return fallbackEvents.map((event) => cloneEvent(event));
}

export async function getEventBySlug(slug: string): Promise<Event | undefined> {
  const event = getFallbackEventBySlug(slug);
  return event ? cloneEvent(event) : undefined;
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  return fallbackTeamMembers.map((member) => cloneTeamMember(member));
}

export async function getTeamMemberBySlug(
  slug: string
): Promise<TeamMember | undefined> {
  const member = getFallbackTeamMemberBySlug(slug);
  return member ? cloneTeamMember(member) : undefined;
}

export type { Event, TeamMember };
