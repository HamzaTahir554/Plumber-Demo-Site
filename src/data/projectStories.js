import { projectExamples } from './projectExamples.js';

// Preview topics, not completed jobs. Replace with approved records before publishing.
const preview = (image, category, summary) => ({
  id: image, status: 'preview', category, summary,
  title: projectExamples.find(item => item.image === image).title,
  photo: { ...projectExamples.find(item => item.image === image), verified: false },
  challenge: null, approach: null, result: null, comparison: null
});

export const projectStories = [
  preview('service-leak-repair', 'Leak repair', 'A preview of how a future pipe-repair story will connect the initial issue, the work and its verified outcome.'),
  preview('service-water-heater', 'Water heaters', 'A place for a documented equipment installation, with the decisions and results explained.'),
  preview('commercial-pipe-system', 'Commercial plumbing', 'A place to share the context and documented details behind work in a business setting.')
];

export const isPublishedStory = story => Boolean(story.status === 'published' && story.photo.verified && story.challenge && story.approach && story.result);

export function storyImage(photo, responsive = true) {
  const src = photo.src || `/assets/images/enhanced/${photo.image}.jpg`;
  return {
    src,
    srcSet: responsive ? photo.srcSet || (!photo.src ? `/assets/images/gallery/${photo.image}-640.jpg 640w, /assets/images/gallery/${photo.image}-960.jpg 960w, ${src} ${photo.width}w` : undefined) : undefined,
    alt: photo.alt, width: photo.width, height: photo.height
  };
}
