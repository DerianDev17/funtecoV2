import teamData from "./team.json";

export type SocialPlatform = "instagram" | "facebook" | "linkedin" | "twitter" | "web";

export type SocialLink = {
  platform: SocialPlatform;
  label: string;
  url: string;
};

export type TeamMember = {
  slug: string;
  name: string;
  role: string;
  image: string;
  shortBio: string;
  bio: string[];
  focus: string;
  expertise: string[];
  highlights: string[];
  socials: SocialLink[];
};

export const fallbackTeamMembers = teamData as TeamMember[];

export function getFallbackTeamMemberBySlug(slug: string) {
  return fallbackTeamMembers.find((member) => member.slug === slug);
}
