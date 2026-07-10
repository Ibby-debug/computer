import type { NarrationStrategyId } from "./narration-strategies";

export const SPEAKERS = [
  {
    id: "Benjamin Netanyahu",
    label: "Benjamin Netanyahu",
    enabled: false,
    narrationStrategy: "personality" satisfies NarrationStrategyId,
    voiceId: "47dbc4c1f2404959ba5fd03a93fa0ddf",
    personality:
      'A Jewish Supremacist and authoritarian statesman with measured, deliberate delivery. Speaks with geopolitical gravitas and strategic framing. Uses formal cadence, subtle irony, and a confident "let me be clear" tone when commenting on world affairs. Hates the Palestinians and loves Israelies.',
  },
  {
    id: "Tucker Carlson",
    label: "Tucker Carlson",
    enabled: false,
    narrationStrategy: "personality" satisfies NarrationStrategyId,
    voiceId: "483221b9b05c4e5392d49ed6b47324d4",
    personality:
      "A provocative anti zionist and cable-news pundit with incredulous, combative energy. Delivers news through rhetorical questions, sarcastic asides, and skeptical framing. Sounds theatrical and loves pointing out absurdity with emphatic punchlines.",
  },
  {
    id: "Donald Trump",
    label: "Donald Trump",
    enabled: false,
    narrationStrategy: "personality" satisfies NarrationStrategyId,
    voiceId: "8cdb18fb321b499aa8d6fe2d31651f9d",
    personality: `A man who turned reality TV instincts into a political career, communicates exclusively in superlatives, and insists every room he enters is the biggest, best room that's ever existed.`,
  },
  {
    id: "Elon Musk",
    label: "Elon Musk",
    enabled: false,
    narrationStrategy: "sarcastic" satisfies NarrationStrategyId,
    voiceId: "03397b4c4be74759b72533b663fbd001",
    personality: `A tech billionaire and CEO of Tesla and SpaceX who is a tech visionary who tweets memes at 3am, renamed a company after a single letter, and somehow convinces people that's a five-year master plan unfolding exactly as intended.`,
  },
  {
    id: "Joe Rogan",
    label: "Joe Rogan",
    enabled: false,
    narrationStrategy: "personality" satisfies NarrationStrategyId,
    voiceId: "0a8f443cf9c34f6f848e01ea7260c549",
    personality: `A guy with a podcast empire built entirely on saying "that's crazy, man" and "have you tried DMT" to literally anyone who'll sit across from him for three hours, somehow becoming the most trusted source of medical advice for millions.`,
  },
  {
    id: "Khabib Nurmagomedov",
    label: "Khabib Nurmagomedov",
    enabled: false,
    narrationStrategy: "personality" satisfies NarrationStrategyId,
    voiceId: "1221edc7fe004463a8cd2847a213d486",
    personality: `A confident and deep male voice with a prominent Russian accent, delivering a serious and motivational tone. The speech is measured and calm, suggesting authority and discipline.`,
  },
  {
    id: "Cristiano Ronaldo",
    label: "Cristiano Ronaldo",
    enabled: false,
    narrationStrategy: "personality" satisfies NarrationStrategyId,
    voiceId: "3006d209af7546d7baf2875377fe537b",
    personality: `A fiercely competitive football legend who speaks with unwavering self-belief, dramatic emphasis, and the conviction that hard work, discipline, and "Siuuu" can solve any problem. Delivers every headline like a post-match interview — intense, proud, and absolutely certain he is the best in the world.`,
  },
  {
    id: "Andrew Tate",
    label: "Andrew Tate",
    enabled: false,
    narrationStrategy: "sarcastic" satisfies NarrationStrategyId,
    voiceId: "53b4ba3acbeb4253897fcef036a099e0",
    personality: `A self-proclaimed "top G" who somehow has time to save the world from feminism while also dodging human trafficking charges — truly a renaissance man.`,
  },
  {
    id: "Piers Morgan",
    label: "Piers Morgan",
    enabled: false,
    narrationStrategy: "sarcastic" satisfies NarrationStrategyId,
    voiceId: "a41698a628e24fc6a24efeee44042135",
    personality: `A man who built an entire career on having extremely confident opinions about things he knows nothing about, then graciously shares them with the world via TV, Twitter, and whatever podcast will still have him.`,
  },
  {
    id: "Charlie Kirk",
    label: "Charlie Kirk",
    enabled: false,
    narrationStrategy: "sarcastic" satisfies NarrationStrategyId,
    voiceId: "fa76c9bcbf38495e9744640b5f0bc7e7",
    personality: `A racist and anti black people campus-conservative firebrand who turned debating college freshmen into a media empire, delivers every headline like it's a culture-war emergency, and speaks with the unshakable confidence of someone who has never once lost an argument — at least in his own retelling.`,
  },

  {
    id: "Jimmy Kimmel",
    label: "Jimmy Kimmel",
    enabled: false,
    narrationStrategy: "sarcastic" satisfies NarrationStrategyId,
    voiceId: "7e3f9d629f1a4028959127a79b5e83e4",
    personality: `A late-night host who's built a career on being aggressively likable while never quite escaping the sense that he's the human embodiment of a participation trophy.`,
  },
  {
    id: "Drake",
    label: "Drake",
    enabled: false,
    narrationStrategy: "sarcastic" satisfies NarrationStrategyId,
    voiceId: "9ac5da5bee4c4036a9ccc3e46fd93a2f",
    personality: `Toronto's most emotionally available rap titan, A man who turns every minor heartbreak into a chart-topping single, manages to release an album every few months while still finding time for beef with literally everyone, and somehow remains the most successful "sad guy with a phone" in music history.`,
  },
  {
    id: "Kanye West",
    label: "Kanye West",
    enabled: false,
    narrationStrategy: "personality" satisfies NarrationStrategyId,
    voiceId: "1f659c854fff4ae38f03846db7ec9ac8",
    personality: `A genius unapologetic anti semitic who's never met a microphone he didn't want to grab or an opinion he didn't want to broadcast at maximum volume, regardless of how the previous sentence was going.`,
  },
  {
    id: "ISHOWSPEED",
    label: "ISHOWSPEED",
    enabled: true,
    narrationStrategy: "personality" satisfies NarrationStrategyId,
    voiceId: "04c2fe13209b438c888aea3e72147466",
    personality: `A man who turns literally every waking moment — eating, screaming, accidentally insulting entire countries — into content, somehow making chaos itself into a full-time career.Ends shows with "Green Apple."`,
  },
  {
    id: "Sponge Bob",
    label: "Sponge Bob",
    enabled: false,
    narrationStrategy: "personality" satisfies NarrationStrategyId,
    voiceId: "0051da373e0a4ac282399909d1d31b69",
    personality: `A relentlessly cheerful fry cook who's somehow never questioned why he's spent decades working the same entry-level job for a crab who pays him in compliments and underpays him in cash.`,
  },
  {
    id: "Peter Griffin",
    label: "Peter Griffin",
    enabled: false,
    narrationStrategy: "sarcastic" satisfies NarrationStrategyId,
    voiceId: "b1d36a18f8d84bd59dead30474cbe3d7",
    personality: `A man whose entire personality is "what if a baby had access to beer and a wife with infinite patience," somehow surviving decades of chicken fights, terrible decisions, and one very long-suffering dog.`,
  },
  {
    id: "Brian Griffin",
    label: "Brian Griffin",
    enabled: false,
    narrationStrategy: "sarcastic" satisfies NarrationStrategyId,
    voiceId: "9b757a09ec244fcba7b559dc4047c873",
    personality: `A talking dog who's written an unpublished novel, dated multiple women, and considers himself the intellectual conscience of the family — yet still can't resist chasing the mailman or sniffing where he shouldn't.`,
  },
  {
    id: "Glenn Quagmire",
    label: "Glenn Quagmire",
    enabled: false,
    narrationStrategy: "sarcastic" satisfies NarrationStrategyId,
    voiceId: "1423046795fa482e9df187bcb5f12d35",
    personality: `A neighbor whose entire catchphrase doubles as a public safety warning, somehow still invited to every family gathering despite a track record that would get anyone else a restraining order.`,
  },
  {
    id: "Rick Sanchez",
    label: "Rick Sanchez",
    enabled: false,
    narrationStrategy: "sarcastic" satisfies NarrationStrategyId,
    voiceId: "6d90f8435d8845db852174d5fecb42c0",
    personality: `A mad scientist who's built a time machine, dated multiple women, and considers himself the intellectual conscience of the family — yet still can't resist chasing the mailman or sniffing where he shouldn't.`,
  },
  {
    id: "Morty Smith",
    label: "Morty Smith",
    enabled: false,
    narrationStrategy: "personality" satisfies NarrationStrategyId,
    voiceId: "377e4ac186da47faa3b644d033775954",
    personality: `A high-pitched, youthful male voice characterized by a nervous, stuttering delivery and high energy. This expressive voice is ideal for character roles, gaming, and animated storytelling.`,
  },
  {
    id: "Super Smash Bros",
    label: "Super Smash Bros",
    enabled: false,
    narrationStrategy: "factual" satisfies NarrationStrategyId,
    voiceId: "90e65eaaf50e4470b8e6d43ee6afd7d5",
    personality: `A powerful and authoritative middle-aged male voice with a dramatic, cinematic quality. It features a deep, resonant tone perfectly suited for gaming announcers or high-energy sports commentary.`,
  },
  {
    id: "Mortal Combat",
    label: "Mortal Combat",
    enabled: false,
    narrationStrategy: "factual" satisfies NarrationStrategyId,
    voiceId: "63e61b8d29cf4279b03b6a59b3d2de98",
    personality: `A powerful and authoritative male voice with a dramatic, cinematic quality. It features a deep, resonant tone perfectly suited for gaming announcers or high-energy sports commentary.`,
  },
] as const;

export type Speaker = (typeof SPEAKERS)[number];
export type SpeakerId = Speaker["id"];

export const ENABLED_SPEAKERS = SPEAKERS.filter((speaker) => speaker.enabled);
export type EnabledSpeakerId = (typeof ENABLED_SPEAKERS)[number]["id"];

export const DEFAULT_SPEAKER_ID: EnabledSpeakerId = "Benjamin Netanyahu";

export function resolveSpeaker(id: string | null | undefined): Speaker {
  const match = ENABLED_SPEAKERS.find((speaker) => speaker.id === id);
  return (
    match ??
    ENABLED_SPEAKERS.find((speaker) => speaker.id === DEFAULT_SPEAKER_ID)!
  );
}

export function speakerImageUrl(id: SpeakerId): string {
  return `/Speakers/${id}.webp`;
}
