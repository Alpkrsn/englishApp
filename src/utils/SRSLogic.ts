import { Card } from '../types';

export const SRSLogic = {
    calculateNextReview: (card: Card, rating: 'again' | 'good' | 'easy'): Card => {
        const now = Date.now();
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
