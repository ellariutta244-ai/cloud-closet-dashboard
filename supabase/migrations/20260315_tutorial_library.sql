-- Create tutorials table
CREATE TABLE IF NOT EXISTS public.tutorials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  steps text[] NOT NULL DEFAULT '{}',
  pro_tips text[] NOT NULL DEFAULT '{}',
  best_for_tags text[] NOT NULL DEFAULT '{}',
  difficulty text DEFAULT 'Easy',
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create saved_captions table
CREATE TABLE IF NOT EXISTS public.saved_captions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  caption text,
  alternate_caption text,
  seo_note text,
  hashtag_set_1 text,
  hashtag_set_2 text,
  posting_time text,
  video_topic text,
  goal text,
  generated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tutorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_captions ENABLE ROW LEVEL SECURITY;

-- Tutorials: readable by all authenticated users, writable by admin
CREATE POLICY "tutorials_read" ON public.tutorials FOR SELECT TO authenticated USING (true);
CREATE POLICY "tutorials_admin_write" ON public.tutorials FOR ALL TO authenticated USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin','wisconsin_admin')));

-- Saved captions: readable/writable by owner or admin
CREATE POLICY "saved_captions_own" ON public.saved_captions FOR ALL TO authenticated USING (creator_id = auth.uid() OR auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin','wisconsin_admin')));

-- Seed the 7 tutorials
INSERT INTO public.tutorials (title, description, steps, pro_tips, best_for_tags, difficulty, sort_order) VALUES
(
  'How to Use Green Screen in TikTok',
  'Show an image or outfit behind you, or display the Cloud Closet app screen while you talk.',
  ARRAY[
    'Open TikTok and tap the + button to create a new video',
    'Tap Effects in the bottom left',
    'Search "Green Screen" in the effects search bar',
    'Select Green Screen or Green Screen Video',
    'If using Green Screen: tap the image icon to choose a photo from your camera roll — pull up a screenshot of the Cloud Closet app, an outfit flat lay, or any fashion image',
    'If using Green Screen Video: choose a short video clip from your camera roll to play behind you',
    'Position yourself so your face and upper body are visible in front of the background',
    'Record as normal — you are now standing in front of your chosen image'
  ],
  ARRAY[
    'Wear a solid color that contrasts with your background',
    'Make sure lighting is even so the green screen effect looks clean',
    'Look at the camera, not the screen'
  ],
  ARRAY['App walkthroughs', 'Outfit reactions', 'Showing inspiration images while talking'],
  'Easy',
  1
),
(
  'How to Add a Voiceover in TikTok',
  'Record your voice over B-roll footage or screen recordings — great for faceless content.',
  ARRAY[
    'Film your video first — B-roll of your closet, outfit flat lay, or Cloud Closet app screen recording',
    'After filming, tap the checkmark to go to the editing screen',
    'Tap the Voiceover button (microphone icon) in the top right',
    'Press and hold the red record button while speaking — release to stop',
    'You can record in sections — pause and resume as needed',
    'Tap Save when done',
    'To remove background noise: tap Volume and slide Original all the way to zero'
  ],
  ARRAY[
    'Film in a quiet room for the clearest audio',
    'Speak clearly and at a normal pace',
    'Write out what you want to say before recording so you do not stumble'
  ],
  ARRAY['Faceless content', 'App walkthroughs', 'Outfit carousels with narration'],
  'Easy',
  2
),
(
  'How to Make a Before and After Video in TikTok',
  'Perfect for showing a messy closet vs. an organized Cloud Closet profile, or an old morning routine vs. a new one.',
  ARRAY[
    'Film your BEFORE clip first — messy closet, old way of getting dressed, the problem',
    'Film your AFTER clip — Cloud Closet app open, organized profile, the solution',
    'In the TikTok editor tap Add Sound and select a trending sound first',
    'Tap the red record button and upload your before clip, then your after clip back to back',
    'Use TikTok''s text tool to add "BEFORE" text over the first clip and "AFTER" text over the second clip',
    'Add a transition between clips by tapping Transitions in the editor and selecting a simple cut or fade'
  ],
  ARRAY[
    'Keep before and after clips roughly equal length',
    'Use the same camera angle for both for maximum impact',
    'Add text immediately so viewers know what they are watching from the first frame'
  ],
  ARRAY['Cloud Closet transformation', 'Wardrobe organization', 'Morning routine improvement'],
  'Easy',
  3
),
(
  'How to Record Your Screen in TikTok',
  'Show the Cloud Closet app in action — the easiest and most compelling format for app walkthroughs.',
  ARRAY[
    'On iPhone: swipe down from the top right corner to open Control Center, then tap Screen Recording',
    'A 3-second countdown starts — then your screen is recording',
    'Open the Cloud Closet app and navigate naturally — browse outfits, organize your wardrobe, get suggestions',
    'When done, tap the red recording indicator at the top and tap Stop',
    'The screen recording saves to your camera roll automatically',
    'Open TikTok, tap +, tap Upload, and select your screen recording',
    'Add voiceover, text, or music on top in the TikTok editor'
  ],
  ARRAY[
    'Clean up your home screen before recording so it looks polished',
    'Turn on Do Not Disturb so no notifications pop up mid-recording',
    'Navigate slowly and deliberately so viewers can follow along'
  ],
  ARRAY['App walkthroughs', 'Showing specific Cloud Closet features', 'Outfit suggestion reveals'],
  'Very Easy',
  4
),
(
  'How to Add Text on Screen in TikTok',
  'Add captions, hooks, or commentary as text overlays — essential for stopping the scroll.',
  ARRAY[
    'After filming, tap the Text button (Aa) at the bottom of the editor',
    'Type your text — keep it short, one line maximum per text block',
    'Choose a font style — the bold chunky fonts perform best for hooks',
    'Tap and drag to position the text — hook text goes at the top or center, CTAs go at the bottom',
    'Tap the text block and select Set Duration to control exactly when text appears and disappears',
    'Add multiple text blocks for different moments in the video'
  ],
  ARRAY[
    'Use contrasting colors so text is readable against your background',
    'Do not put text in the bottom right corner — TikTok''s UI overlaps there',
    'Use the auto-caption feature for full subtitles on talking head videos'
  ],
  ARRAY['Adding hooks before you speak', 'Highlighting key moments', 'Faceless content'],
  'Very Easy',
  5
),
(
  'How to Use TikTok Auto Captions',
  'Automatically generate subtitles for your talking head videos — increases watch time significantly.',
  ARRAY[
    'After filming, tap Captions in the right side toolbar',
    'TikTok automatically transcribes everything you said',
    'Review the captions and tap any word to correct errors',
    'Tap the style options to change the font and color',
    'Captions are now baked into your video — tap Done'
  ],
  ARRAY[
    'Always use captions — most people watch TikTok on mute',
    'Speak clearly during filming for more accurate auto-captions',
    'Review before posting to fix any errors — wrong words look unprofessional'
  ],
  ARRAY['Talking head videos', 'Any video where you speak', 'Accessibility'],
  'Very Easy',
  6
),
(
  'How to Use a Trending Sound in TikTok',
  'Trending sounds give your video a small distribution boost from TikTok''s algorithm — worth doing every time.',
  ARRAY[
    'Before filming: tap the + button, then tap Add Sound at the top to browse trending sounds',
    'After filming: in the editor tap Add Sound, search by song name or browse Trending',
    'To find what is trending: go to TikTok Creative Center at ads.tiktok.com/creative-center/music and filter by fashion or lifestyle',
    'Select a sound and trim it to the best part using the scissors icon',
    'Tap Volume and balance the Original and Added Sound sliders so the music does not overpower your voice'
  ],
  ARRAY[
    'Use sounds that are trending but not yet oversaturated',
    'Sounds with a beat drop work well for reveal moments and before/afters',
    'Check TikTok Creative Center weekly for new trending sounds in your niche'
  ],
  ARRAY['Any video format', 'Reveal moments', 'Before and after transitions'],
  'Easy',
  7
)
ON CONFLICT DO NOTHING;
