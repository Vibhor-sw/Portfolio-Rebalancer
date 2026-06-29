import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number | null;
  max?: number;
  size?: number;
  label?: string;
}

export function StarRating({ rating, max = 5, size = 12, label }: StarRatingProps) {
  if (rating === null) {
    return (
      <span className="text-xs text-gray-400 italic">{label ?? 'Not Rated'}</span>
    );
  }

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={i < rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}
        />
      ))}
    </div>
  );
}
