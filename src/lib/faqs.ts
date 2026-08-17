/**
 * FAQ content lives here so the rendered accordion and the FAQPage structured
 * data are generated from the same source — Google flags mismatches between
 * visible copy and schema markup.
 */
export interface Faq {
  question: string
  answer: string
}

export const FAQS: Faq[] = [
  {
    question: 'Do guests need to download an app?',
    answer:
      'No. Guests point their normal phone camera at the QR code on the table and the Ekthau camera opens straight in Safari or Chrome. There is nothing to install and no account to create.',
  },
  {
    question: 'What happens if the venue Wi-Fi or mobile signal drops?',
    answer:
      'Photos are saved to the guest’s own device the moment they are taken. If the connection is weak or disappears, uploads queue locally and send themselves automatically as soon as signal returns — even if the guest closes the tab and comes back later.',
  },
  {
    question: 'Does Ekthau compress or shrink the photos?',
    answer:
      'No. The original file is uploaded and stored exactly as the camera produced it, including large 4K video clips. Smaller copies are generated only for fast gallery browsing; your download always contains the untouched originals.',
  },
  {
    question: 'How does the live photo wall work?',
    answer:
      'Open the live wall link on any laptop plugged into the venue TV or projector. Newly approved guest photos fade in automatically every few seconds, so the celebration sees itself in real time.',
  },
  {
    question: 'Can I approve photos before guests see them?',
    answer:
      'Yes. Turn on moderation and every upload waits in your host dashboard until you approve it. Nothing reaches the shared gallery or the projector wall until you say so.',
  },
  {
    question: 'How long are the photos kept, and how do I download them?',
    answer:
      'Retention depends on your plan, from two days on the free tier up to a year on the multi-day package. At any point during that window you can download the complete album as a single ZIP of full-resolution files.',
  },
  {
    question: 'Who can see the photos from my event?',
    answer:
      'Only people who have your event code or QR card. Event links are unguessable, are never listed publicly, and are excluded from search engines.',
  },
]
