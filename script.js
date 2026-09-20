/* ═══════════════════════════════════════════════════════════
   THE CUTEST GIRL ON EARTH vs. ALI  —  Supabase Edition
   Clean getting-to-know-you game · Long-distance ready
   Real-time via Supabase PostgreSQL · One or Two phones
   ═══════════════════════════════════════════════════════════ */
'use strict';

/* ── Supabase Config — paste your values from Settings → API ── */
const SUPABASE_URL = 'https://cbmjmhrjvacbopgzcemr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNibWptaHJqdmFjYm9wZ3pjZW1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4OTY3ODYsImV4cCI6MjEwNTQ3Mjc4Nn0.vJgthAH50S76Tna_YI5agM_dbZn2z5erZFimNU9-kfM';
const SB_READY = !SUPABASE_URL.includes('REPLACE');

let sb = null;
if (SB_READY) {
  try {
    const { createClient } = supabase;        // global from CDN
    sb = createClient(SUPABASE_URL, SUPABASE_KEY);
  } catch(e) { console.warn('Supabase init failed:', e); }
}

/* ── Path map: Firebase-style nested paths → flat Supabase columns ── */
const PATH_MAP = {
  'game/card':           'game_card',
  'game/cardPhase':      'game_card_phase',
  'game/cardDrawnAt':    'game_card_drawn_at',
  'game/cardsPlayed':    'game_cards_played',
  'game/turn':           'game_turn',
  'game/round':          'game_round',
  'game/phase':          'game_phase',
  'game/level':          'game_level',
  'game/p1Cards':        'game_p1_cards',
  'game/p2Cards':        'game_p2_cards',
  'p1/name':             'p1_name',
  'p1/emoji':            'p1_emoji',
  'p1/ready':            'p1_ready',
  'p1/connected':        'p1_connected',
  'p2/name':             'p2_name',
  'p2/emoji':            'p2_emoji',
  'p2/ready':            'p2_ready',
  'p2/joined':           'p2_joined',
  'p2/connected':        'p2_connected',
  'usedT':               'used_t',
  'usedL':               'used_l',
};

/* ── Convert flat Supabase row → nested game-state object (UI uses this) ── */
function rowToState(row) {
  if (!row) return null;
  return {
    p1: {
      name:      row.p1_name      || '',
      emoji:     row.p1_emoji     || '🌸',
      ready:     !!row.p1_ready,
      connected: !!row.p1_connected,
    },
    p2: {
      name:      row.p2_name      || '',
      emoji:     row.p2_emoji     || '🏎️',
      ready:     !!row.p2_ready,
      joined:    !!row.p2_joined,
      connected: !!row.p2_connected,
    },
    game: {
      phase:       row.game_phase       || 'waiting_p2',
      turn:        row.game_turn        || 'p1',
      round:       row.game_round       || 1,
      cardsPlayed: row.game_cards_played || 0,
      level:       row.game_level       || 1,
      card:        row.game_card        || null,
      cardPhase:   row.game_card_phase  || 'idle',
      cardDrawnAt: row.game_card_drawn_at || 0,
      p1Cards:     row.game_p1_cards    || 0,
      p2Cards:     row.game_p2_cards    || 0,
    },
    usedT: row.used_t || '',
    usedL: row.used_l || '',
  };
}

/* ── Convert Firebase-style path updates → Supabase column object ── */
function pathsToRow(updates) {
  const row = {};
  for (const [path, value] of Object.entries(updates)) {
    row[ PATH_MAP[path] || path ] = value;
  }
  return row;
}

/* ═══════════════════════════════════════════════════════════
   QUESTIONS — 100 Truths  (lv 1/2/3 = Chapter 1/2/3)
   ═══════════════════════════════════════════════════════════ */
const TRUTHS = [
  /* ─── Chapter 1: First Impression (35) ─────────────────── */
  { text:"Where did you grow up — and what's one thing about where you're from that quietly shaped who you are?", cat:"Background", lv:1 },
  { text:"What did you want to be as a kid, and how far is your actual life from that version?", cat:"Background", lv:1 },
  { text:"What's the best thing about where you're from that people outside of it never really know?", cat:"Background", lv:1 },
  { text:"What's one thing from your childhood that explains a lot about who you turned out to be?", cat:"Background", lv:1 },
  { text:"Who in your family are you most like — and is that a compliment?", cat:"Background", lv:1 },
  { text:"What's the most surprising thing about your personality once people actually get to know you?", cat:"Personality", lv:1 },
  { text:"Are you more of a morning person or a night owl — and which do you genuinely wish you were?", cat:"Personality", lv:1 },
  { text:"How do your close friends describe you versus how a stranger would after one conversation?", cat:"Personality", lv:1 },
  { text:"What's something you're genuinely great at that nobody would guess from first impressions?", cat:"Personality", lv:1 },
  { text:"Are you the type to make a plan or the type to figure it out as you go — and which actually works better for you?", cat:"Personality", lv:1 },
  { text:"What's something you always have a strong opinion on that surprises people?", cat:"Personality", lv:1 },
  { text:"Describe yourself using exactly three words — then explain why you picked those three specifically.", cat:"Personality", lv:1 },
  { text:"What's something you're passionate about that you could talk about for hours without running out of things to say?", cat:"Interests", lv:1 },
  { text:"What's the last thing you got genuinely obsessed with — and how long did it last?", cat:"Interests", lv:1 },
  { text:"What's your comfort show or movie — the one you return to when you actually need it?", cat:"Interests", lv:1 },
  { text:"What's your relationship with music — is it background noise or something much more than that?", cat:"Interests", lv:1 },
  { text:"What's your usual coffee or tea order, and what do you think it honestly says about you?", cat:"Interests", lv:1 },
  { text:"What's a hobby or interest you have that would genuinely surprise people who think they already know you?", cat:"Interests", lv:1 },
  { text:"What's something you've recently discovered that you keep recommending to other people?", cat:"Interests", lv:1 },
  { text:"What's a place you've been to that you've never stopped thinking about — and why does it stay with you?", cat:"Interests", lv:1 },
  { text:"What do you consider a perfect day off when there's absolutely nothing you have to do?", cat:"Interests", lv:1 },
  { text:"If your life were a TV series right now, what would it be called and what genre would it be?", cat:"Fun", lv:1 },
  { text:"What's the most spontaneous thing you've ever done — and are you glad you did it?", cat:"Fun", lv:1 },
  { text:"What would be the first thing you'd do if you woke up tomorrow with enough money to quit your job forever?", cat:"Fun", lv:1 },
  { text:"If you could live in any city in the world other than where you are now, which would you choose and why?", cat:"Fun", lv:1 },
  { text:"What era or decade would you choose if you had no choice but to live somewhere other than now?", cat:"Fun", lv:1 },
  { text:"What's something you've done that you're fairly certain most people haven't?", cat:"Fun", lv:1 },
  { text:"What's something on your bucket list you could realistically do this year if you just actually decided to?", cat:"Fun", lv:1 },
  { text:"What's a simple pleasure in your life that means more to you than it probably sounds?", cat:"Fun", lv:1 },
  { text:"What was your actual first impression of me — not the polished version, the real one?", cat:"Tension", lv:1 },
  { text:"What's one question you've been curious to ask me since this game started — ask it now?", cat:"Tension", lv:1 },
  { text:"What's something you find yourself thinking about more than you probably should?", cat:"Tension", lv:1 },
  { text:"What's something you always notice about a person that tells you a lot about who they are?", cat:"Tension", lv:1 },
  { text:"What's the most memorable thing someone has done to make a genuinely good first impression on you?", cat:"Tension", lv:1 },
  { text:"What's a simple thing someone can do that immediately makes you feel at ease around them?", cat:"Tension", lv:1 },

  /* ─── Chapter 2: Getting Real (35) ─────────────────────── */
  { text:"What's the dream you'd be most disappointed to reach the end of your life without achieving?", cat:"Dreams", lv:2 },
  { text:"Where do you genuinely see your life in 5 years — the real answer, not the one you give when people ask?", cat:"Dreams", lv:2 },
  { text:"What does success actually mean to you — your definition, not anyone else's?", cat:"Dreams", lv:2 },
  { text:"What's something you've been quietly building that most people around you don't know about?", cat:"Dreams", lv:2 },
  { text:"What would your life look like if you stopped worrying entirely about what other people think?", cat:"Dreams", lv:2 },
  { text:"What's a goal you've carried for a long time that you've never told anyone?", cat:"Dreams", lv:2 },
  { text:"What does your ideal life look like at 45 — what would make you feel like you genuinely got it right?", cat:"Dreams", lv:2 },
  { text:"What's a belief you hold that the people closest to you might actually disagree with?", cat:"Values", lv:2 },
  { text:"What's something you would genuinely never compromise on — no matter the situation or the person?", cat:"Values", lv:2 },
  { text:"What does loyalty mean to you in actual practice, not just as a word?", cat:"Values", lv:2 },
  { text:"How important is family to you — and what does that word actually mean in your life?", cat:"Values", lv:2 },
  { text:"What's something you think most people have completely wrong about the way they live?", cat:"Values", lv:2 },
  { text:"What do you think makes someone genuinely worth admiring — the thing most people overlook?", cat:"Values", lv:2 },
  { text:"What's the bravest thing you've ever done — and did it feel like bravery at the time?", cat:"Deep", lv:2 },
  { text:"What's a mistake you made that ended up teaching you the most important lesson of your life?", cat:"Deep", lv:2 },
  { text:"Who or what are you most grateful for right now — and do they actually know it?", cat:"Deep", lv:2 },
  { text:"What are you proud of that has nothing to do with your job, achievements, or how you look?", cat:"Deep", lv:2 },
  { text:"What's something about your upbringing that explains a lot about who you turned out to be?", cat:"Deep", lv:2 },
  { text:"What's a version of your life that almost happened — and what would be different if it had?", cat:"Deep", lv:2 },
  { text:"What's something you've been through that permanently changed who you are?", cat:"Deep", lv:2 },
  { text:"What do you think is your biggest strength — the one that actually defines you?", cat:"Deep", lv:2 },
  { text:"What do you think is your biggest blind spot — the thing you don't always see in yourself?", cat:"Deep", lv:2 },
  { text:"What's something you've changed your mind about completely in the last few years?", cat:"Deep", lv:2 },
  { text:"What does a healthy relationship look like to you in everyday life — not the big romantic moments?", cat:"Love", lv:2 },
  { text:"What's your love language — and do you think you actually make it easy for people to love you?", cat:"Love", lv:2 },
  { text:"What's something you need from someone to feel genuinely close to them?", cat:"Love", lv:2 },
  { text:"How do you know when you actually like someone — what does that feel like for you specifically?", cat:"Love", lv:2 },
  { text:"What's the most important thing you've ever learned about love — from experience, not theory?", cat:"Love", lv:2 },
  { text:"What do you think is the real difference between a good relationship and a truly great one?", cat:"Love", lv:2 },
  { text:"What do you want someone to understand about you from the very beginning of anything real?", cat:"Love", lv:2 },
  { text:"Are you a patient person in relationships — and what tests your patience the most?", cat:"Love", lv:2 },
  { text:"What do you think you bring to someone's life that is genuinely hard to find?", cat:"Love", lv:2 },
  { text:"When you're going through something hard, what kind of support actually helps — and what makes it worse?", cat:"Love", lv:2 },
  { text:"What's something about the way you love that you hope the right person will one day genuinely appreciate?", cat:"Love", lv:2 },
  { text:"What's something you've changed your mind about completely when it comes to relationships?", cat:"Love", lv:2 },

  /* ─── Chapter 3: The Whole Truth (30) ──────────────────── */
  { text:"What's the most honest version of what you actually want your life to look like?", cat:"Real", lv:3 },
  { text:"What scares you most about letting someone truly know you?", cat:"Real", lv:3 },
  { text:"What's something you've always wanted someone to ask you — but nobody ever has? Ask me to ask it.", cat:"Real", lv:3 },
  { text:"What's the version of yourself you're still becoming — and what's honestly in the way?", cat:"Real", lv:3 },
  { text:"When are you the most authentically yourself — where, doing what, and with whom?", cat:"Real", lv:3 },
  { text:"What do people consistently misunderstand about you — the thing that frustrates you most?", cat:"Real", lv:3 },
  { text:"What's the biggest difference between who you are in public and who you are completely alone?", cat:"Real", lv:3 },
  { text:"What's something about your past that still quietly shapes how you love people?", cat:"Real", lv:3 },
  { text:"What would you do differently if you could go back knowing everything you know right now?", cat:"Real", lv:3 },
  { text:"What does being truly understood by another person feel like to you — have you actually experienced it?", cat:"Real", lv:3 },
  { text:"What's a version of yourself you keep hidden — and why do you keep it there?", cat:"Real", lv:3 },
  { text:"How do you show love when you're afraid to actually say it?", cat:"Real", lv:3 },
  { text:"What does the word 'home' mean to you — is it a place, a person, or just a feeling?", cat:"Real", lv:3 },
  { text:"What do you think you deserve that you haven't let yourself have yet?", cat:"Real", lv:3 },
  { text:"What's something you've been waiting for the right person to bring out in you?", cat:"Real", lv:3 },
  { text:"What do you need most from a relationship that you haven't always known how to ask for?", cat:"Real", lv:3 },
  { text:"What's the one thing you hope the right person will see in you that you can't always see in yourself?", cat:"Real", lv:3 },
  { text:"What's the most honest answer you can give to: 'What are you actually looking for right now?'", cat:"Real", lv:3 },
  { text:"If I could know one thing about you that would help me understand you better — what would it be?", cat:"Real", lv:3 },
  { text:"What's something about this conversation that has actually surprised you?", cat:"Real", lv:3 },
  { text:"What do you think you look like when you're genuinely happy — not performing it?", cat:"Real", lv:3 },
  { text:"What do you think makes someone actually worth being vulnerable with?", cat:"Real", lv:3 },
  { text:"What's the most honest thing you can say about who you are when you're in love?", cat:"Real", lv:3 },
  { text:"What would you want someone to remember about you if this was the last conversation you ever had?", cat:"Real", lv:3 },
  { text:"What do you most want to be remembered for — not as an achievement, but as a person?", cat:"Real", lv:3 },
  { text:"What's something about how you love that most people only discover after a very long time?", cat:"Real", lv:3 },
  { text:"What do you think the right person would add to your life that isn't already there?", cat:"Real", lv:3 },
  { text:"What's a question you've been wanting to ask me — ask it right now, no holding back?", cat:"Tension", lv:3 },
  { text:"What's the most honest thing you can say about where things could go between us — if you let yourself say it?", cat:"Tension", lv:3 },
  { text:"If you had to say one true thing about what this conversation made you feel — what is it?", cat:"Tension", lv:3 },
];

/* ═══════════════════════════════════════════════════════════
   DARES — 100 Loves  (all 100% long-distance compatible)
   ═══════════════════════════════════════════════════════════ */
const LOVES = [
  /* ─── Chapter 1: Fun & Light (40) ──────────────────────── */
  { text:"Record a 60-second voice note describing what your perfect morning looks like — every detail from the moment you wake up.", cat:"Voice Note", lv:1 },
  { text:"Send a voice note answering this without being vague: 'What's one thing I would never guess about you?'", cat:"Voice Note", lv:1 },
  { text:"Do your best impression of the other person on a voice note — exaggerate everything you've picked up so far.", cat:"Voice Note", lv:1 },
  { text:"Record yourself listing 5 things you genuinely love about your own life right now. Send it unedited.", cat:"Voice Note", lv:1 },
  { text:"Send a voice note of you reading the last text message you sent to your best friend out loud — no context given.", cat:"Voice Note", lv:1 },
  { text:"Record a voice note finishing this sentence in 30 seconds: 'What most people don't know about me is…'", cat:"Voice Note", lv:1 },
  { text:"Send a voice note of you describing your day so far as if you're narrating a nature documentary about your own life.", cat:"Voice Note", lv:1 },
  { text:"Take a selfie right now showing exactly where you are and what you're doing. Send it with absolutely no explanation.", cat:"Photo", lv:1 },
  { text:"Take a photo of the view from wherever you're sitting right now. Send it with exactly one word — make it count.", cat:"Photo", lv:1 },
  { text:"Take a selfie that captures your actual mood right now — not posed, no filter, no retakes. Send it.", cat:"Photo", lv:1 },
  { text:"Find something near you right now that reminds you of the other person. Photograph it and explain why in one sentence.", cat:"Photo", lv:1 },
  { text:"Take a photo of the surface closest to you — desk, table, floor — without tidying a single thing first.", cat:"Photo", lv:1 },
  { text:"Send a photo of your phone wallpaper and explain exactly what it is and why you chose it.", cat:"Photo", lv:1 },
  { text:"Take a photo of the thing you own that you're most emotionally attached to. Tell the story behind it.", cat:"Photo", lv:1 },
  { text:"Send a photo of your bookshelf, playlist, or something you collect — pick one item from it and defend your love for it.", cat:"Photo", lv:1 },
  { text:"Take a photo of the sky from where you are right now. Send it with the exact time you took it.", cat:"Photo", lv:1 },
  { text:"Take a selfie in the best natural lighting you can find right now. Send it exactly as it is — no edits.", cat:"Photo", lv:1 },
  { text:"Write 5 honest sentences about yourself you would never put on a dating profile. Send them.", cat:"Written", lv:1 },
  { text:"Write 5 specific things you've noticed or learned about the other person since this game started. Be precise.", cat:"Written", lv:1 },
  { text:"Share the last song you listened to with absolutely no explanation. They have 60 seconds to guess why you were playing it.", cat:"Written", lv:1 },
  { text:"Describe the other person in exactly 5 words. Take your time. Make every word genuinely count.", cat:"Written", lv:1 },
  { text:"Send 3 emojis that describe you right now — then explain each one in a full sentence.", cat:"Written", lv:1 },
  { text:"Write a 3-sentence pitch for yourself. Why should someone want to get to know you?", cat:"Written", lv:1 },
  { text:"Send a fun fact about yourself that you're almost certain the other person doesn't know.", cat:"Written", lv:1 },
  { text:"Write the other person a genuine compliment that has absolutely nothing to do with how they look.", cat:"Written", lv:1 },
  { text:"Write your honest answer to: 'What am I actually like when absolutely no one is watching?'", cat:"Written", lv:1 },
  { text:"Tell the other person one specific thing they said or did in this game that surprised you — explain what and why.", cat:"Written", lv:1 },
  { text:"On video call, give the other person a 3-minute tour of the room you're in right now — narrate everything as if they've never seen it before.", cat:"Video Call", lv:1 },
  { text:"Show the other person everything in your bag or pockets right now — explain every single item without skipping any.", cat:"Video Call", lv:1 },
  { text:"On video call, sit in complete silence together for 60 seconds — cameras on, no talking. Then both say the first word that comes to mind at the same time.", cat:"Video Call", lv:1 },
  { text:"On video call, show the other person the face you make when you get genuinely excited about something. No words — let them guess what caused it.", cat:"Video Call", lv:1 },
  { text:"Show the other person the most-used app on your phone right now. Explain honestly what that says about you.", cat:"Video Call", lv:1 },
  { text:"Invent a brand new holiday. Name it, explain how it's celebrated, and make sure it somehow reflects your personality.", cat:"Creative", lv:1 },
  { text:"Name 3 celebrities: one who looks like you, one who acts like you, and one whose life you'd swap with — explain each choice fully.", cat:"Creative", lv:1 },
  { text:"Describe yourself using only food. What dish are you — and why does that actually make sense for you specifically?", cat:"Creative", lv:1 },
  { text:"If your personality were a season, which would it be? Give the other person 30 seconds to guess before you reveal it.", cat:"Creative", lv:1 },
  { text:"Choose a song that you think could genuinely be your theme right now. Share it and explain exactly why.", cat:"Creative", lv:1 },
  { text:"Tell the most dramatic version of how you imagine the two of you could have met in a completely different life.", cat:"Creative", lv:1 },
  { text:"Name the 3 things you'd rescue from your home if you had exactly 2 minutes. Explain the order you'd grab them in.", cat:"Creative", lv:1 },
  { text:"Tell the other person your relationship dealbreakers — but deliver them as if reading from a formal, official application form.", cat:"Creative", lv:1 },

  /* ─── Chapter 2: Warmer & More Revealing (35) ──────────── */
  { text:"Send a voice note finishing this without being vague: 'The thing most people consistently get wrong about me is…'", cat:"Voice Note", lv:2 },
  { text:"Record the full story of the most embarrassing thing that has ever happened to you in public. Every detail — don't spare yourself.", cat:"Voice Note", lv:2 },
  { text:"Send a voice note about the moment in your life you're most proud of — not an achievement, a choice you made.", cat:"Voice Note", lv:2 },
  { text:"Tell the other person out loud exactly what your love language is — then give them a real, specific, day-to-day example of what it looks like in practice.", cat:"Voice Note", lv:2 },
  { text:"Record the story of the best day of your life so far. Don't rush it. Give it the time it actually deserves.", cat:"Voice Note", lv:2 },
  { text:"Send a voice note answering this honestly: 'What do you need most from someone to feel truly, genuinely loved?' Take as long as you need.", cat:"Voice Note", lv:2 },
  { text:"Tell the other person one thing about yourself you've never quite known how to say — and try to actually say it right now.", cat:"Voice Note", lv:2 },
  { text:"Record a voice note describing the person you want to become — not your career goals, your actual character.", cat:"Voice Note", lv:2 },
  { text:"Send a voice note telling the other person what kind of energy you think you bring into someone's life. Be honest, not modest.", cat:"Voice Note", lv:2 },
  { text:"Tell the other person about the person who has influenced you the most in your life — who they are, what they did, and how.", cat:"Voice Note", lv:2 },
  { text:"Find and send the photo in your camera roll that best represents who you are right now. Explain specifically why you chose that one.", cat:"Photo", lv:2 },
  { text:"Send a photo of the place where you feel most like yourself. Describe the exact feeling of being there — what it does to you.", cat:"Photo", lv:2 },
  { text:"Find a photo on your phone that made you genuinely happy when you first saw it. Share it and tell the full story behind it.", cat:"Photo", lv:2 },
  { text:"Send the other person a screenshot of something you've been thinking about lately — a note, article, voice memo, anything. Explain it properly.", cat:"Photo", lv:2 },
  { text:"Send a photo of your room or the space you sleep in exactly as it looks right now. No staging. No tidying. No hiding anything.", cat:"Photo", lv:2 },
  { text:"Both open your music app at exactly the same time. Share your most-played song of the last month. Listen to 30 seconds of each other's choice simultaneously.", cat:"Both", lv:2 },
  { text:"Both look around your space for something the same color — without telling each other what color you're searching for. Find it and compare.", cat:"Both", lv:2 },
  { text:"Play the same song at the exact same moment on both devices. Don't speak for the entire song. Afterwards, each say the first honest thing that came to mind.", cat:"Both", lv:2 },
  { text:"Both close your eyes for 30 seconds and think of one word that describes how this conversation has made you feel so far. Say it at exactly the same time.", cat:"Both", lv:2 },
  { text:"Take a selfie at the exact same moment — both press at the count of 3 together. Send simultaneously. Compare.", cat:"Both", lv:2 },
  { text:"Tell the other person about the last time you cried — what it was and why. Be honest, not performed.", cat:"Story", lv:2 },
  { text:"Tell the story of the most spontaneous decision you've ever made — and whether you think it was actually worth it.", cat:"Story", lv:2 },
  { text:"Describe the version of your life where everything went slightly differently — who are you in that version?", cat:"Story", lv:2 },
  { text:"Describe your relationship with your family in exactly 3 sentences. Make each one specific and true.", cat:"Story", lv:2 },
  { text:"Tell the other person what your life looked like exactly 3 years ago — and how genuinely different things are now.", cat:"Story", lv:2 },
  { text:"Tell the other person about the moment you realized you were actually an adult. What happened? Did it feel the way you expected it to?", cat:"Story", lv:2 },
  { text:"Describe the best conversation you've ever had — who it was with, what was said, what made it completely unforgettable.", cat:"Story", lv:2 },
  { text:"Send a voice note listing at least 5 specific things you find genuinely interesting about the other person — based only on what you know from this game.", cat:"Compliment", lv:2 },
  { text:"Tell the other person what you think their biggest strength is — and give actual evidence from what you've seen of them for why you believe it.", cat:"Compliment", lv:2 },
  { text:"Write the other person a paragraph about the first impression they made on you. Be completely, specifically honest.", cat:"Compliment", lv:2 },
  { text:"Tell the other person one thing about them that you think they underestimate about themselves — something they probably carry without realising its value.", cat:"Compliment", lv:2 },
  { text:"Tell the other person what you think their most attractive quality is — and it cannot be anything physical.", cat:"Compliment", lv:2 },
  { text:"Send a voice note that starts with: 'I think you're the kind of person who…' — finish it honestly, no clichés, no holding back.", cat:"Compliment", lv:2 },
  { text:"Write the other person a short letter. Date it today. Minimum 5 genuine sentences. Sign it with your name.", cat:"Compliment", lv:2 },
  { text:"Tell the other person what you imagine it would be like to be their close friend — what they'd add to your daily life specifically.", cat:"Compliment", lv:2 },

  /* ─── Chapter 3: The Whole Truth (25) ──────────────────── */
  { text:"Record a voice note telling the other person something real about yourself — something you'd normally wait much, much longer to say.", cat:"Bold", lv:3 },
  { text:"Tell the other person, out loud on a call, what your biggest insecurity is — and where you honestly think it came from.", cat:"Bold", lv:3 },
  { text:"Send a voice note describing what you think love actually looks like at its very best — be specific and concrete, not poetic.", cat:"Bold", lv:3 },
  { text:"Tell the other person what scares you most about getting genuinely close to someone. The real answer, not the safe one.", cat:"Bold", lv:3 },
  { text:"Record a voice note finishing this sentence without stopping to overthink it: 'The version of me I'm still working on is…'", cat:"Bold", lv:3 },
  { text:"Tell the other person what you hope they've understood about you by this point in the conversation.", cat:"Bold", lv:3 },
  { text:"On video call, sit in silence together for 2 full minutes — cameras on, nothing said. Afterwards, both say the first completely honest thing that comes to mind.", cat:"Bold", lv:3 },
  { text:"Send a voice note answering: 'What do you think you bring to someone's life that is genuinely hard to find?'", cat:"Bold", lv:3 },
  { text:"Write the other person a message describing what you think the best version of a connection between two people like you both could look like — if everything went right.", cat:"Bold", lv:3 },
  { text:"Tell the other person the truth about what you're actually looking for right now — not the safe, acceptable answer. The real one.", cat:"Bold", lv:3 },
  { text:"Tell the other person what you genuinely think about them — not what you've observed, what you actually think. Take your time with it.", cat:"Bold", lv:3 },
  { text:"Record a voice note describing the kind of connection you actually want — specific enough that someone could genuinely give it to you.", cat:"Bold", lv:3 },
  { text:"Send a voice note that starts with: 'I want you to know…' — finish it however you actually need to. Don't overthink it.", cat:"Bold", lv:3 },
  { text:"Tell the other person one thing about this conversation that genuinely surprised you — and exactly why.", cat:"Bold", lv:3 },
  { text:"Tell the other person what you would want them to remember about you if you never spoke again after this.", cat:"Bold", lv:3 },
  { text:"Both write down the 3 words you most want the other person to use when they describe you after this conversation. Share them at exactly the same time.", cat:"Both", lv:3 },
  { text:"Tell the other person one real fear you have — not a silly one — and explain where you honestly think it comes from.", cat:"Bold", lv:3 },
  { text:"Write the other person 5 sentences as if writing a note to be opened in exactly one year from today. Date it.", cat:"Bold", lv:3 },
  { text:"On a call, tell the other person one specific thing about them that you could see yourself falling for — if things went that way.", cat:"Bold", lv:3 },
  { text:"Record a voice note describing what it feels like to meet someone who genuinely makes you want to be yourself. Have you ever felt that before?", cat:"Bold", lv:3 },
  { text:"Send a voice note finishing this completely: 'What I find hardest to say is… but what I actually mean by it is…'", cat:"Bold", lv:3 },
  { text:"Tell the other person one thing you've been holding back saying during this game — whatever it is, say it now.", cat:"Bold", lv:3 },
  { text:"Both say one honest thing at exactly the same time on the count of 3 — something you've been thinking throughout this game but haven't said yet. No coordinating beforehand.", cat:"Both", lv:3 },
  { text:"Tell the other person what you think this entire conversation has revealed about them — not the answers themselves, the person behind them.", cat:"Bold", lv:3 },
  { text:"End the game with a voice note. One minute. No script. No preparation. Say whatever is genuinely, honestly on your mind right now.", cat:"Bold", lv:3 },
];

/* ═══════════════════════════════════════════════════════════
   CONFIG
   ═══════════════════════════════════════════════════════════ */
const CHAP_NAMES  = { 1:'First Impression', 2:'Getting Real', 3:'The Whole Truth' };
const CHAP_PILLS  = { 1:'📖 Ch.1', 2:'📖📖 Ch.2', 3:'📖📖📖 Ch.3' };
const GIRL_EMOJIS = ['🌸','🌹','💖','🦋','🐱','✨','👑','💎','🌷','🎀'];
const ALI_EMOJIS  = ['🏎️','🏍️','💪','🔥','⚡','🏆','🦁','🎯','⚽','🌑'];

function getPool(type, lv) {
  const all = type==='truth' ? TRUTHS : LOVES;
  return all.filter(c => c.lv <= lv);
}

/* ═══════════════════════════════════════════════════════════
   APP STATE
   ═══════════════════════════════════════════════════════════ */
let playMode    = 'local';
let localState  = null;
let myRole      = 'p1';
let roomCode    = null;
let roomChannel = null;     // Supabase realtime channel
let roomSnap    = null;
let timerInt    = null;
let selLevel    = 1;
let localLevel  = 1;
let favorites   = [];

const $ = id => document.getElementById(id);

/* ── Unified state layer ── */
function getState() { return playMode==='local' ? localState : roomSnap; }

async function setState(updates) {
  if (playMode==='local') {
    applyUpdates(localState, updates);
    syncGame(localState);
  } else {
    const row = pathsToRow(updates);
    const { error } = await sb.from('rooms').update(row).eq('code', roomCode);
    if (error) console.error('setState error:', error);
    // Realtime subscription triggers onUpdate automatically
  }
}

function applyUpdates(obj, updates) {
  for (const [path, value] of Object.entries(updates)) {
    const parts = path.split('/');
    let t = obj;
    for (let i=0; i<parts.length-1; i++) {
      if (t[parts[i]]==null||typeof t[parts[i]]!=='object') t[parts[i]]={};
      t = t[parts[i]];
    }
    t[parts[parts.length-1]] = value;
  }
}

/* ── Screen nav ── */
let cur = 's-landing';
function goTo(id) {
  const prev = document.getElementById(cur);
  if (prev) { prev.classList.remove('active'); prev.classList.add('exit-left'); setTimeout(()=>prev.classList.remove('exit-left'),600); }
  cur = id; document.getElementById(id).classList.add('active'); window.scrollTo(0,0);
}

/* ── Particles ── */
function initParticles() {
  const gc=$('girl-particles'), ac=$('ali-particles');
  const gSym=['🌸','💖','✨','🐱','🌷','♥'];
  const aSym=['⚡','🔥','💨','•','›','»'];
  for (let i=0;i<10;i++) {
    const gp=document.createElement('div'); gp.className='girl-p';
    gp.textContent=gSym[i%gSym.length];
    gp.style.left=(Math.random()*90)+'%';
    gp.style.animationDuration=(14+Math.random()*18)+'s';
    gp.style.animationDelay=(Math.random()*16)+'s';
    gp.style.fontSize=(10+Math.random()*10)+'px';
    gc.appendChild(gp);
    const ap=document.createElement('div'); ap.className='ali-p';
    ap.textContent=aSym[i%aSym.length];
    ap.style.left=(Math.random()*90)+'%';
    ap.style.animationDuration=(12+Math.random()*16)+'s';
    ap.style.animationDelay=(Math.random()*16)+'s';
    ap.style.fontSize=(9+Math.random()*9)+'px';
    ap.style.color=Math.random()>.5?'rgba(41,121,255,.4)':'rgba(255,61,0,.35)';
    ac.appendChild(ap);
  }
}

/* ── Identity ── */
function saveId()  { localStorage.setItem('cga_role',myRole); localStorage.setItem('cga_room',roomCode); }
function loadId()  { myRole=localStorage.getItem('cga_role')||'p1'; roomCode=localStorage.getItem('cga_room'); }
function clearId() { localStorage.removeItem('cga_role'); localStorage.removeItem('cga_room'); }
function genCode() { return Math.random().toString(36).substr(2,6).toUpperCase(); }
function codeFromURL() { return window.location.hash.slice(1).toUpperCase()||null; }
function setURL(code)  { window.location.hash=code; }

/* ── Card picking ── */
function shuffle(a) {
  const b=[...a];
  for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}
  return b;
}
function pickCard(type, lv, usedStr) {
  const pool=getPool(type,lv);
  const used=usedStr?usedStr.split(',').map(Number).filter(n=>!isNaN(n)):[];
  const avail=pool.reduce((a,_,i)=>{ if(!used.includes(i))a.push(i); return a; },[]);
  const final=avail.length>0?avail:pool.map((_,i)=>i);
  const idx=shuffle(final)[0];
  const card=pool[idx];
  const newUsed=(avail.length>0?[...used,idx]:[idx]).join(',');
  return { card, newUsed };
}

/* ══════════════════════════════════════
   LOCAL GAME
══════════════════════════════════════ */
function initLocalGame(p1Name, p1Emoji, p2Name, p2Emoji, level) {
  myRole='p1'; playMode='local';
  localState = {
    p1:{name:p1Name,emoji:p1Emoji,ready:true},
    p2:{name:p2Name,emoji:p2Emoji,ready:true},
    game:{phase:'playing',turn:'p1',round:1,cardsPlayed:0,level,card:null,cardPhase:'idle',cardDrawnAt:0,p1Cards:0,p2Cards:0},
    usedT:'',usedL:'',
  };
  updateBarNames(localState);
  syncGame(localState);
  goTo('s-game');
}

/* ══════════════════════════════════════
   SUPABASE — ONLINE MULTIPLAYER
══════════════════════════════════════ */

/* Fetch current room state and trigger onUpdate */
async function fetchRoom() {
  if (!sb || !roomCode) return;
  const { data, error } = await sb.from('rooms').select().eq('code', roomCode).single();
  if (error) { console.error('fetchRoom error:', error); return; }
  if (data) { roomSnap = rowToState(data); onUpdate(roomSnap); }
}

/* Subscribe to real-time changes for this room */
function attachListener() {
  if (!sb || !roomCode) return;
  // Remove any previous channel
  if (roomChannel) { sb.removeChannel(roomChannel); roomChannel=null; }

  roomChannel = sb
    .channel('room-' + roomCode)
    .on('postgres_changes', {
      event:  '*',
      schema: 'public',
      table:  'rooms',
      filter: `code=eq.${roomCode}`
    }, payload => {
      if (payload.new) {
        roomSnap = rowToState(payload.new);
        onUpdate(roomSnap);
      }
    })
    .subscribe((status) => {
      // Once subscribed, do an initial fetch to get current state
      if (status === 'SUBSCRIBED') fetchRoom();
    });
}

/* Track presence — mark player as connected, clean up on close */
function trackPresence() {
  if (!sb || !roomCode || !myRole) return;
  const col = myRole + '_connected';
  sb.from('rooms').update({ [col]: true }).eq('code', roomCode);
  window.addEventListener('beforeunload', () => {
    sb.from('rooms').update({ [col]: false }).eq('code', roomCode);
  });
}

/* Create a new room as P1 */
async function createRoom(name, emoji, level) {
  if (!sb) { $('config-warn').classList.remove('hidden'); return; }
  const code = genCode();
  const { error } = await sb.from('rooms').insert({
    code,
    p1_name: name,     p1_emoji: emoji, p1_ready: true, p1_connected: true,
    p2_name: '',       p2_emoji: '',    p2_ready: false, p2_joined: false, p2_connected: false,
    game_phase: 'waiting_p2', game_turn: 'p1',
    game_round: 1,     game_cards_played: 0, game_level: level,
    game_card: null,   game_card_phase: 'idle', game_card_drawn_at: 0,
    game_p1_cards: 0,  game_p2_cards: 0,
    used_t: '',        used_l: '',
    created_at: Date.now(),
  });
  if (error) { alert('Could not create room. Check your Supabase config.'); console.error(error); return; }
  myRole='p1'; roomCode=code;
  saveId(); setURL(code);
  attachListener();
  trackPresence();
  $('share-code').textContent=code;
  goTo('s-waiting');
}

/* Join an existing room as P2 */
async function joinRoom(code) {
  if (!sb) { $('config-warn').classList.remove('hidden'); return; }
  code=code.toUpperCase().trim();
  if (!code||code.length<4) { showJoinErr('Enter a valid code.'); return; }

  const { data, error } = await sb.from('rooms').select().eq('code', code).single();
  if (error||!data) { showJoinErr('Room not found. Check the code.'); return; }
  if (data.p2_joined && data.p2_connected) { showJoinErr('Room is full right now.'); return; }

  myRole='p2'; roomCode=code;
  saveId(); setURL(code);
  attachListener();
  trackPresence();

  // If P2 already set up (rejoining), go straight to waiting
  if (data.p2_joined && data.p2_name) {
    $('share-code').textContent=code; goTo('s-waiting'); return;
  }

  // First-time P2: show setup screen
  const tag=$('setup-role-tag');
  tag.textContent='⚡ Player 2 — Him';
  tag.style.cssText='color:#7eb3ff;background:rgba(41,121,255,.12);border-color:rgba(41,121,255,.35)';
  $('setup-avatar').classList.add('ali-style');
  buildEmojiGrid('p2','emoji-grid','setup-emoji');
  $('setup-name').placeholder='His name';
  $('setup-room-code').textContent=code;
  $('chap-section').classList.add('hidden');
  goTo('s-setup');
}

function showJoinErr(msg) {
  const el=$('join-err'); el.textContent=msg; el.classList.remove('hidden');
  setTimeout(()=>el.classList.add('hidden'),4000);
}

/* P2 submits their name/emoji after setup */
async function submitSetup(name, emoji) {
  if (!sb||!roomCode||!myRole) return;
  const updates = {
    [myRole+'_name']:  name,
    [myRole+'_emoji']: emoji,
    [myRole+'_ready']: true,
  };
  if (myRole==='p2') { updates.p2_joined=true; updates.p2_connected=true; }

  await sb.from('rooms').update(updates).eq('code', roomCode);

  // If P2 just confirmed and P1 is ready, start the game
  if (myRole==='p2') {
    const { data } = await sb.from('rooms').select().eq('code', roomCode).single();
    if (data && data.p1_ready) {
      await sb.from('rooms').update({ game_phase: 'playing' }).eq('code', roomCode);
    }
  }
  $('share-code').textContent=roomCode; goTo('s-waiting');
}

/* React to any incoming state update */
function onUpdate(data) {
  if (!data) return;
  const g = data.game||{};

  if (cur==='s-waiting') {
    const other = myRole==='p1'?'p2':'p1';
    const partner = data[other]||{};
    if (partner.joined||partner.connected) {
      $('p-status-text').textContent=(partner.name||'Partner')+' connected! 💗';
      $('p-dot').classList.add('on');
    }
    if (g.phase==='playing') { updateBarNames(data); initGameUI(data); goTo('s-game'); return; }
    // Both ready but phase not yet playing — P1 triggers start
    if (myRole==='p1' && data.p1?.ready && data.p2?.ready && g.phase!=='playing' && g.phase!=='ended') {
      sb.from('rooms').update({ game_phase:'playing' }).eq('code', roomCode);
    }
    return;
  }
  if (cur==='s-setup') { if (g.phase==='playing') { updateBarNames(data); initGameUI(data); goTo('s-game'); } return; }
  if (cur==='s-game') syncGame(data);
  if (g.phase==='ended' && cur==='s-game') { buildEnd(data); goTo('s-end'); }
}

/* ══════════════════════════════════════
   GAME UI
══════════════════════════════════════ */
function updateBarNames(data) {
  const p1=data.p1||{}, p2=data.p2||{};
  $('bar-p1-emoji').textContent=$('mp-p1-emoji').textContent=p1.emoji||'🌸';
  $('bar-p1-name').textContent =$('mp-p1-name').textContent =p1.name||'Her';
  $('bar-p2-emoji').textContent=$('mp-p2-emoji').textContent=p2.emoji||'🏎️';
  $('bar-p2-name').textContent =$('mp-p2-name').textContent =p2.name||'Him';
}
function initGameUI(data) { updateBarNames(data); syncGame(data); }

function syncGame(data) {
  if (!data) return;
  const g=data.game||{}, p1=data.p1||{}, p2=data.p2||{};
  const mine = playMode==='local' ? true : g.turn===myRole;
  const tp = g.turn==='p1'?p1:p2;
  const isGirl = g.turn==='p1';

  const strip=$('turn-strip');
  strip.className='turn-strip '+(isGirl?'t-girl':'t-ali');
  $('turn-avi').textContent=tp.emoji||'🌸';
  $('turn-label').textContent=mine?'Your turn':'Their turn';
  $('turn-name').textContent=tp.name||(mine?'You':'Them');
  $('chap-pill').textContent=CHAP_PILLS[g.level||1]||'📖 Ch.1';
  $('mp-p1-cards').textContent=g.p1Cards||0;
  $('mp-p2-cards').textContent=g.p2Cards||0;
  $('mp-round').textContent=g.round||1;
  $('mp-chap').textContent=g.level||1;

  const wd=$('watch-dot');
  if (wd) wd.className='watch-dot '+(isGirl?'ali-dot':'girl-dot');

  const cp=g.cardPhase||'idle';
  if (cp==='idle') {
    show('idle-mine',mine); show('idle-theirs',!mine);
    hide('game-card'); hide('row-actions'); hide('watch-footer');
    stopTimer();
    if (!mine) { $('wc-icon').textContent=tp.emoji||'⌛'; $('wc-text').textContent=(tp.name||'They')+' is choosing…'; }
  } else if (cp==='shown') {
    hide('idle-mine'); hide('idle-theirs');
    show('game-card'); show('row-actions',mine);
    show('watch-footer',!mine&&playMode==='online');
    renderCard(g.card,g.turn);
    if (g.cardDrawnAt) syncTimer(g.cardDrawnAt);
    if (!mine&&playMode==='online') $('watch-text').textContent='Watching '+(tp.name||'their')+' turn…';
  } else if (cp==='done') {
    hide('idle-mine'); hide('idle-theirs');
    show('game-card'); hide('row-actions'); hide('watch-footer');
    stopTimer();
    if (g.card) renderCard(g.card,g.turn);
  }
}

function renderCard(card, turn) {
  if (!card) return;
  const isGirl=turn==='p1';
  const el=$('game-card');
  el.className='game-card '+(card.type==='truth'?'truth-card':'love-card')+' '+(isGirl?'t-girl':'t-ali');
  $('gc-type').textContent=card.type==='truth'?'❤️ TRUTH':'⚡ DARE';
  $('gc-cat').textContent=card.cat||'—';
  $('gc-text').textContent=card.text||'…';
  const s=getState();
  $('gc-num').textContent='#'+(s&&s.game?s.game.cardsPlayed:'?');
  const isFav=favorites.some(f=>f.text===card.text);
  $('fav-btn').textContent=isFav?'♥':'♡';
  $('fav-btn').classList.toggle('fav-active',isFav);
}

function show(id,vis=true) { if(vis)$(id).classList.remove('hidden'); else $(id).classList.add('hidden'); }
function hide(id) { $(id).classList.add('hidden'); }

function syncTimer(drawnAt) {
  stopTimer();
  const fill=$('timer-fill'),num=$('timer-num'),wrap=$('timer-wrap');
  wrap.classList.add('vis');
  const tick=()=>{
    const left=Math.max(0,60-((Date.now()-drawnAt)/1000));
    fill.style.width=(left/60*100)+'%';
    num.textContent=left<=0?'⏰':Math.ceil(left);
    if(left<=15)fill.classList.add('warn'); else fill.classList.remove('warn');
  };
  tick(); timerInt=setInterval(tick,500);
}
function stopTimer() { clearInterval(timerInt); timerInt=null; $('timer-wrap').classList.remove('vis'); }

/* ══════════════════════════════════════
   GAME ACTIONS
══════════════════════════════════════ */
async function actionDraw(type) {
  const s=getState(); if(!s)return;
  const g=s.game||{};
  if (playMode==='online'&&g.turn!==myRole) return;
  if (g.cardPhase!=='idle') return;
  const lv=g.level||1;
  const usedKey=type==='truth'?'usedT':'usedL';
  const {card,newUsed}=pickCard(type,lv,s[usedKey]||'');
  const cardKey=g.turn==='p1'?'p1Cards':'p2Cards';
  await setState({
    'game/card':        {type,text:card.text,cat:card.cat},
    'game/cardPhase':   'shown',
    'game/cardDrawnAt': Date.now(),
    'game/cardsPlayed': (g.cardsPlayed||0)+1,
    ['game/'+cardKey]:  (g[cardKey]||0)+1,
    [usedKey]:          newUsed,
  });
}

async function actionSkip() {
  const s=getState(); if(!s)return;
  const g=s.game||{};
  if (playMode==='online'&&g.turn!==myRole) return;
  if (g.cardPhase!=='shown') return;
  const type=g.card?g.card.type:'truth';
  const lv=g.level||1;
  const usedKey=type==='truth'?'usedT':'usedL';
  const {card,newUsed}=pickCard(type,lv,s[usedKey]||'');
  await setState({ 'game/card':{type,text:card.text,cat:card.cat}, 'game/cardDrawnAt':Date.now(), 'game/cardsPlayed':(g.cardsPlayed||0)+1, [usedKey]:newUsed });
}

async function actionDone() {
  const s=getState(); if(!s)return;
  const g=s.game||{};
  if (playMode==='online'&&g.turn!==myRole) return;
  if (g.cardPhase!=='shown') return;
  await setState({'game/cardPhase':'done'});
  setTimeout(()=>advanceTurn(), playMode==='local'?400:1800);
}

async function advanceTurn() {
  const s=getState(); if(!s)return;
  const g=s.game||{};
  const next=g.turn==='p1'?'p2':'p1';
  await setState({
    'game/turn':next, 'game/card':null, 'game/cardPhase':'idle', 'game/cardDrawnAt':0,
    'game/round':g.turn==='p2'?(g.round||1)+1:(g.round||1),
  });
  if (playMode==='local') {
    myRole=next;
    const np=next==='p1'?localState.p1:localState.p2;
    showPassPhone(np.name, np.emoji, next);
  }
}

function showPassPhone(name, emoji, role) {
  const box=$('pass-box');
  const isGirl=role==='p1';
  box.className='pass-box '+(isGirl?'girl-pass':'ali-pass');
  $('pass-world-icon').textContent=emoji;
  $('pass-decos').textContent=isGirl?'🌸 💖 🐱':'🏎️ ⚡ 💪';
  $('pass-name').textContent=name;
  $('btn-pass-ready').textContent=isGirl?'I\'m Ready 💗':'I\'m Ready ⚡';
  $('ov-pass').classList.remove('hidden');
}

async function actionFav() {
  const s=getState(); if(!s||!s.game||!s.game.card) return;
  const card=s.game.card;
  const i=favorites.findIndex(f=>f.text===card.text);
  if(i>=0){favorites.splice(i,1);$('fav-btn').textContent='♡';$('fav-btn').classList.remove('fav-active');}
  else{favorites.push(card);$('fav-btn').textContent='♥';$('fav-btn').classList.add('fav-active');}
}

async function endSession() {
  if (playMode==='local') { buildEnd(localState); goTo('s-end'); }
  else if (sb&&roomCode) {
    await sb.from('rooms').update({ game_phase:'ended' }).eq('code', roomCode);
  }
}

/* ══════════════════════════════════════
   END SCREEN
══════════════════════════════════════ */
function buildEnd(data) {
  const g=data.game||{};
  $('stat-cards').textContent=g.cardsPlayed||0;
  $('stat-chap').textContent=CHAP_NAMES[g.level||1]||'First Impression';
  if (favorites.length>0) {
    $('fav-summary').classList.remove('hidden');
    $('fav-list').innerHTML=favorites.map(f=>`<div class="fav-item"><strong>${f.type==='truth'?'❤️ TRUTH':'⚡ DARE'} · ${f.cat}</strong>${f.text}</div>`).join('');
  }
  const c=$('end-confetti'); c.innerHTML='';
  const cols=['#ff4d9e','#ff85c2','#ffd6ec','#2979ff','#7eb3ff','#ff3d00','#f5c842','#ffffff'];
  for(let i=0;i<60;i++){
    const p=document.createElement('div'); p.className='conf-p';
    p.style.left=Math.random()*100+'vw';
    p.style.background=cols[i%cols.length];
    p.style.animationDuration=(1.5+Math.random()*3)+'s';
    p.style.animationDelay=(Math.random()*2)+'s';
    p.style.borderRadius=Math.random()>.5?'50%':'2px';
    c.appendChild(p);
  }
}

/* ══════════════════════════════════════
   EMOJI GRIDS
══════════════════════════════════════ */
function buildEmojiGrid(role, gridId, displayId) {
  const grid=$(gridId), disp=$(displayId);
  const list=role==='p1'?GIRL_EMOJIS:ALI_EMOJIS;
  const selClass=role==='p1'?'sel-girl':'sel-ali';
  grid.innerHTML=''; disp.textContent=list[0];
  list.forEach((em,i)=>{
    const s=document.createElement('span');
    s.textContent=em; if(i===0)s.classList.add(selClass);
    s.addEventListener('click',()=>{ grid.querySelectorAll('span').forEach(x=>x.classList.remove(selClass)); s.classList.add(selClass); disp.textContent=em; });
    grid.appendChild(s);
  });
}
function buildLocalGrid(role, gridId, displayId) { buildEmojiGrid(role, gridId, displayId); }

function initChapGrid(gridId, onChange) {
  document.querySelectorAll('#'+gridId+' .chap-card').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('#'+gridId+' .chap-card').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      onChange(parseInt(btn.dataset.level,10));
    });
  });
}

/* ══════════════════════════════════════
   RESET
══════════════════════════════════════ */
function resetAll() {
  clearId(); favorites=[]; localState=null;
  if (roomChannel && sb) { sb.removeChannel(roomChannel); roomChannel=null; }
  roomCode=null; myRole='p1'; roomSnap=null; playMode='local';
  window.location.hash='';
  hide('game-card'); hide('row-actions'); hide('watch-footer');
  show('idle-mine'); hide('idle-theirs');
}

/* ══════════════════════════════════════
   EVENT LISTENERS
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  buildEmojiGrid('p1','emoji-grid','setup-emoji');
  buildLocalGrid('p1','lp1-grid','lp1-emoji');
  buildLocalGrid('p2','lp2-grid','lp2-emoji');
  if (!SB_READY) $('config-warn').classList.remove('hidden');

  const uc=codeFromURL();
  if (uc&&uc.length>=4) $('join-input').value=uc;

  initChapGrid('local-chap-grid',  lv=>{ localLevel=lv; });
  initChapGrid('online-chap-grid', lv=>{ selLevel=lv; });

  /* Landing */
  $('btn-begin').addEventListener('click',()=>goTo('s-mode'));
  $('btn-back-mode').addEventListener('click',()=>goTo('s-landing'));

  /* Play mode */
  $('btn-local').addEventListener('click',()=>{ playMode='local'; goTo('s-local-setup'); });
  $('btn-online').addEventListener('click',()=>{ playMode='online'; goTo('s-room'); });

  /* Local setup */
  $('btn-back-local').addEventListener('click',()=>goTo('s-mode'));
  $('btn-start-local').addEventListener('click',()=>{
    const n1=$('lp1-name').value.trim()||'Cutie';
    const e1=$('lp1-emoji').textContent;
    const n2=$('lp2-name').value.trim()||'Ali';
    const e2=$('lp2-emoji').textContent;
    initLocalGame(n1,e1,n2,e2,localLevel);
  });

  /* Online room */
  $('btn-back-room').addEventListener('click',()=>goTo('s-mode'));
  $('btn-create').addEventListener('click',()=>{
    myRole='p1';
    $('setup-role-tag').textContent='💗 Player 1 — Her';
    $('setup-role-tag').style.cssText='';
    $('chap-section').classList.remove('hidden');
    buildEmojiGrid('p1','emoji-grid','setup-emoji');
    $('setup-name').placeholder='Her name';
    $('setup-room-code').textContent='—';
    goTo('s-setup');
  });
  $('btn-join').addEventListener('click', async()=>{
    const code=$('join-input').value.toUpperCase().trim();
    if (!code) { $('join-err').textContent='Enter the code first.'; $('join-err').classList.remove('hidden'); return; }
    await joinRoom(code);
  });
  $('join-input').addEventListener('keydown',e=>{ if(e.key==='Enter')$('btn-join').click(); });

  /* Online setup */
  $('btn-ready').addEventListener('click', async()=>{
    const name=$('setup-name').value.trim()||(myRole==='p1'?'Cutie':'Ali');
    const emoji=$('setup-emoji').textContent;
    if (myRole==='p1'&&!roomCode) { await createRoom(name,emoji,selLevel); }
    else { await submitSetup(name,emoji); }
  });

  /* Copy link */
  $('btn-copy').addEventListener('click',()=>{
    const link=window.location.origin+window.location.pathname+'#'+(roomCode||$('share-code').textContent);
    navigator.clipboard.writeText(link).then(()=>{
      const btn=$('btn-copy'); btn.classList.add('copied');
      btn.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Copied!';
      setTimeout(()=>{ btn.classList.remove('copied'); btn.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg> Copy Link'; },2500);
    });
  });

  /* Game */
  $('btn-truth').addEventListener('click',()=>actionDraw('truth'));
  $('btn-love').addEventListener('click', ()=>actionDraw('love'));
  $('btn-skip').addEventListener('click', actionSkip);
  $('btn-done').addEventListener('click', actionDone);
  $('fav-btn').addEventListener('click',  actionFav);

  /* Pass phone */
  $('btn-pass-ready').addEventListener('click',()=>{ $('ov-pass').classList.add('hidden'); syncGame(localState); });

  /* Menu */
  $('btn-menu').addEventListener('click',()=>$('ov-menu').classList.remove('hidden'));
  $('close-menu').addEventListener('click',()=>$('ov-menu').classList.add('hidden'));
  $('ov-menu').addEventListener('click',e=>{ if(e.target===$('ov-menu'))$('ov-menu').classList.add('hidden'); });
  $('btn-end-session').addEventListener('click', async()=>{ $('ov-menu').classList.add('hidden'); await endSession(); });

  /* End */
  $('btn-again').addEventListener('click',()=>{ resetAll(); goTo('s-mode'); });
  $('btn-home').addEventListener('click', ()=>{ resetAll(); goTo('s-landing'); });

  /* Auto-rejoin on page load if we have a saved room */
  loadId();
  if (roomCode && myRole && SB_READY) {
    playMode='online'; setURL(roomCode); $('share-code').textContent=roomCode;
    attachListener(); trackPresence(); goTo('s-waiting');
  } else if (!roomCode) {
    const uc2=codeFromURL();
    if (uc2&&SB_READY) { playMode='online'; joinRoom(uc2); }
  }
});
