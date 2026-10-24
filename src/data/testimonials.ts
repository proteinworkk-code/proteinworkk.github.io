/**
 * Member stories. EMPTY ON PURPOSE.
 *
 * The homepage "Member stories" section renders only entries with `consented: true`.
 * Add genuine testimonials only, with the member's written consent to publish.
 * Never add star ratings or Review/AggregateRating markup unless real, verifiable reviews are
 * visible on the page.
 */
export interface Testimonial {
  quote: string;
  name: string;
  detail?: string;
  consented: boolean;
}

export const testimonials: Testimonial[] = [];
