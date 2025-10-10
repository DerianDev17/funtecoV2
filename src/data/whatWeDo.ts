import whatWeDoData from "./whatWeDo.json";

export type ValueStatement = {
  title: string;
  description: string;
};

export type FocusArea = {
  title: string;
  description: string;
  emphasis: string;
};

export type EtnoeducationInitiative = {
  name: string;
  impact: string;
};

export type EtnoeducationQuote = {
  text: string;
  author: string;
  role: string;
};

export type ProgramOverview = {
  name: string;
  audience: string;
  focus: string;
  outcomes: string[];
};

export type WhatWeDoContent = {
  hero: {
    badge: string;
    title: string;
    description: string;
    callout: string;
  };
  approach: {
    title: string;
    paragraphs: string[];
    values: ValueStatement[];
  };
  focusAreas: FocusArea[];
  etnoeducation: {
    title: string;
    description: string;
    initiatives: EtnoeducationInitiative[];
    quote: EtnoeducationQuote;
  };
  programs: ProgramOverview[];
  cta: {
    title: string;
    description: string;
    buttonLabel: string;
    buttonUrl: string;
  };
};

export const fallbackWhatWeDoContent = whatWeDoData as WhatWeDoContent;
