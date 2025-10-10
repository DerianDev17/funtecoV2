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
import {
  fallbackWhatWeDoContent,
  type WhatWeDoContent,
} from "../data/whatWeDo";

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

const cloneWhatWeDo = (content: WhatWeDoContent): WhatWeDoContent => ({
  hero: { ...content.hero },
  approach: {
    title: content.approach.title,
    paragraphs: [...content.approach.paragraphs],
    values: content.approach.values.map((value) => ({ ...value })),
  },
  focusAreas: content.focusAreas.map((area) => ({ ...area })),
  etnoeducation: {
    title: content.etnoeducation.title,
    description: content.etnoeducation.description,
    initiatives: content.etnoeducation.initiatives.map((initiative) => ({
      ...initiative,
    })),
    quote: { ...content.etnoeducation.quote },
  },
  programs: content.programs.map((program) => ({
    ...program,
    outcomes: [...program.outcomes],
  })),
  cta: { ...content.cta },
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

export async function getWhatWeDoContent(): Promise<WhatWeDoContent> {
  return cloneWhatWeDo(fallbackWhatWeDoContent);
}

export type { WhatWeDoContent };
