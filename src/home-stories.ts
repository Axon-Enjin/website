import { useEffect, useState } from "react";

export type HomeStory = {
  title: string;
  result: string;
  type: string;
  description: string;
  href: string;
  art: string;
};

export const defaultStories: HomeStory[] = [
  {
    title: "Why we started",
    result: "February 2026",
    type: "Think",
    description: "From hackathon weekends to a studio that keeps shipping.",
    href: "/articles/started.html",
    art: "/assets/hero-network.png",
  },
  {
    title: "Axial",
    result: "2nd runner-up · Stellar",
    type: "Case",
    description: "Seventy-two hours to Mainnet for MSME working capital.",
    href: "/articles/axial.html",
    art: "/assets/manifesto-network.png",
  },
  {
    title: "KPMG Academic Innovation Challenge",
    result: "1st place",
    type: "Build",
    description: "Archon and Mate under institutional constraints.",
    href: "/articles/kpmg.html",
    art: "/assets/assembly-network.png",
  },
];

let pending: Promise<HomeStory[] | null> | null = null;

function fetchHomeStories() {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (!pending) {
    pending = fetch("/api/public/stories")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { stories?: HomeStory[] } | null) =>
        data?.stories?.length ? data.stories : null,
      )
      .catch(() => null);
  }
  return pending;
}

export function useHomeStories() {
  const [stories, setStories] = useState(defaultStories);
  useEffect(() => {
    let live = true;
    fetchHomeStories().then((next) => {
      if (live && next) setStories(next);
    });
    return () => {
      live = false;
    };
  }, []);
  return stories;
}
