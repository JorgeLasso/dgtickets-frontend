import { useState, useCallback, useEffect } from "react";
import useFetch from "./useFetch";
import { Rating, RatingResponse } from "../types/rating/rating.types";
interface UseRatingsProps {
  ticketId: number;
  initialRating?: Rating | null;
}

const useRatings = ({ ticketId, initialRating = null }: UseRatingsProps) => {
  const [rating, setRating] = useState<Rating | null>(initialRating);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { post, put, isLoading: fetchLoading } = useFetch<RatingResponse>();

  // Initialize rating from props if available
  useEffect(() => {
    if (initialRating) {
      setRating(initialRating);
    }
  }, [initialRating]); // Get rating by ticket ID

  // Create a new rating
  const createRating = useCallback(
    async (value: number, description: string) => {
      setLoading(true);
      setError(null);
      try {
        const ratingData: Omit<Rating, "id" | "createdAt" | "updatedAt"> = {
          value,
          description,
          ticketId,
        };

        const response = await post("/ratings", ratingData);
        if (response && response.rating) {
          setRating(response.rating);
        }
        return response?.rating;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [post, ticketId]
  );

  // Update an existing rating
  const updateRating = useCallback(
    async (ratingId: number, value: number, description: string) => {
      setLoading(true);
      setError(null);
      try {
        const ratingData = {
          value,
          description,
        };

        const response = await put(`/ratings/${ratingId}`, ratingData);
        if (response && response.rating) {
          setRating(response.rating);
        }
        return response?.rating;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [put]
  );
  return {
    rating,
    loading: loading || fetchLoading,
    error,
    createRating,
    updateRating,
    setRating,
  };
};

export default useRatings;
