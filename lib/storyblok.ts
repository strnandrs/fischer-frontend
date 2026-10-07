import { storyblokInit, apiPlugin } from "@storyblok/react/rsc";
import { components } from "@/components/storyblok";

export const getStoryblokApi = storyblokInit({
  accessToken: process.env.NEXT_PUBLIC_STORYBLOK_TOKEN,
  use: [apiPlugin],
  apiOptions: { region: process.env.NEXT_PUBLIC_STORYBLOK_REGION ?? "eu" },
  components,
});
