"use client";

import { useState } from "react";
import Testimonials from "@/components/Testimonials";
import ShareTestimonial from "@/components/ShareTestimonial";
import type { Review } from "@/lib/reviews-shared";

type ReviewsPageContentProps = {
  initialReviews: Review[];
};

export default function ReviewsPageContent({ initialReviews }: ReviewsPageContentProps) {
  const [reviews, setReviews] = useState(initialReviews);

  return (
    <>
      <Testimonials reviews={reviews} />
      <ShareTestimonial onPublished={setReviews} />
    </>
  );
}
