# The story: chapters, facts and voice-over

12 chapters, from 1955 to today. The subtitles in `stories/einstein/story.js` are a first draft:
replace them with the lines of the final voice-over script.

## Voice-over: how to plug it in
1. Split the final script into **12 parts**, one per chapter (the table below).
2. Record or generate one audio file per part: `chapter-01.mp3` ... `chapter-12.mp3`.
3. Put them in `public/audio/`. Done: each file starts when the user scrolls into its chapter.
4. Copy the sentences of each part into the `lines` of that chapter in `story.js`
   (one sentence per line; `*word*` = shown in gold).
5. If a chapter's audio is long, give it more scroll: increase its `screens` (3 = about 3 screen heights).
   Rule of thumb: ~1 screen per 10–12 seconds of voice.

## Chapters
| # | Title | Place & date | What happens | Set (file) |
|---|---|---|---|---|
| 1 | The Last Wish | Princeton, April 1955 | Einstein, the most famous mind on Earth, wants no grave, no shrine: cremation, ashes scattered in secret. Dies April 18, 1955, 1:15 a.m., aged 76. | `01-study.js` |
| 2 | The Autopsy | Princeton Hospital | Pathologist Thomas Harvey does the autopsy, removes the brain, and keeps it. | `02-autopsy.js` |
| 3 | Permission, Too Late | Princeton | Body cremated the same day without the brain. The family learns it from the press. Hans Albert gives permission afterwards, only "for science". | `03-permission.js` |
| 4 | The Eyes | New York | Einstein's eye doctor Henry Abrams receives his eyes, keeps them in a safe-deposit box. | `04-eyes.js` |
| 5 | 240 Pieces | Philadelphia, 1955 | Brain weighed (1,230 g), cut into ~240 blocks sealed in celloidin, slices on glass slides. | `05-lab.js` |
| 6 | Fired | Princeton, ~1960 | No study comes out. Harvey refuses to return the brain, loses his job, moves west with it. | `06-fired.js` |
| 7 | The Cider Box | Wichita, Kansas, 1978 | Journalist Steven Levy finds Harvey; the brain is in a "Costa Cider" box under a beer cooler. | `07-wichita.js` |
| 8 | Counting Cells | Berkeley, 1985 | Marian Diamond studies 4 blocks: more glial cells per neuron (area 39) than in 11 other men. Many scientists doubt it. | `08-diamond.js` |
| 9 | Driving Mr. Albert | Across America, 1997 | Harvey, 84, and writer Michael Paterniti drive a Buick across the country, the brain in the trunk in Tupperware. | `09-road.js` |
| 10 | She Didn't Want It | Berkeley, 1997 | They reach Evelyn Einstein, Albert's granddaughter. She doesn't take it. | `10-evelyn.js` |
| 11 | Back to Princeton | Princeton Hospital, 1998 | After 43 years Harvey gives the rest to pathologist Elliot Krauss. Harvey dies in 2007, aged 94. | `11-return.js` |
| 12 | Still Arguing | Mütter Museum, Philadelphia, today | 46 slides on public display. Einstein wanted no shrine. What made him a genius? Scientists are still arguing. | `12-museum.js` |

## To double-check before the presentation
These details are widely reported but worth a quick check in your sources:
- the eyes "still" being in a safe-deposit box (it's reported, not proven)
- the exact scene with Evelyn in 1997 (Paterniti's book *Driving Mr. Albert* tells it)
- the 46 slides at the Mütter Museum (received 2011, on display since 2013)

## Sources to read
- Michael Paterniti, *Driving Mr. Albert: A Trip Across America with Einstein's Brain* (2000)
- Steven Levy, "My Search for Einstein's Brain", *New Jersey Monthly* (1978)
- Diamond, Scheibel, Murphy & Harvey, "On the brain of a scientist: Albert Einstein",
  *Experimental Neurology* 88 (1985)
- Brian Burrell, *Postcards from the Brain Museum* (2004)
