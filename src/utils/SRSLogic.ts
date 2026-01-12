import { Card } from '../types';

export const SRSLogic = {
    calculateNextReview: (card: Card, rating: 'again' | 'good' | 'easy'): Card => {
        const now = Date.now();
        const isEarlyReview = card.dueDate && card.dueDate > now;

        // If it's an early review (cramming)
        if (isEarlyReview) {
            // If user forgot, we must penalty them even if it was early
            if (rating === 'again') {
                return Object.assign({}, card, {
                    interval: 0,
                    easeFactor: Math.max(1.3, (card.easeFactor || 2.5) - 0.2),
                    dueDate: now, // Reset to now
                    reviewCount: (card.reviewCount || 0) + 1,
                });
            } else {
                // If they remembered, great! But since it wasn't due, we don't extend the interval.
                // We keep the old schedule.
                // Optional: We could slightly bump easeFactor if it was 'easy'? 
                // For now, let's keep it simple and just return the card as-is 
                // effectively treating this as a "read-only" review for scheduling 
                // but we might want to track that they reviewed it (reviewCount).
                // Let's increment review count for stats but keep scheduling same.
                return Object.assign({}, card, {
                    reviewCount: (card.reviewCount || 0) + 1,
                });
            }
        }

        // Standard SRS Logic (Card was Due or New)
        let newInterval = 0;
        let newEaseFactor = card.easeFactor || 2.5;
        let newReviewCount = (card.reviewCount || 0) + 1;

        if (rating === 'again') {
            newInterval = 0; // Review immediately (or very soon)
            newEaseFactor = Math.max(1.3, newEaseFactor - 0.2);
        } else if (rating === 'good') {
            if (newReviewCount === 1) {
                newInterval = 1;
            } else if (newReviewCount === 2) {
                newInterval = 6;
            } else {
                newInterval = Math.round((card.interval || 1) * newEaseFactor);
            }
        } else if (rating === 'easy') {
            if (newReviewCount === 1) {
                newInterval = 4;
            } else {
                newInterval = Math.round((card.interval || 1) * newEaseFactor * 1.3);
            }
            newEaseFactor += 0.15;
        }

        // Calculate due date (milliseconds)
        // 1 day = 86400000 ms
        const newDueDate = now + (newInterval * 86400000);

        return Object.assign({}, card, {
            interval: newInterval,
            easeFactor: newEaseFactor,
            dueDate: newDueDate,
            reviewCount: newReviewCount,
        });
    }
};
