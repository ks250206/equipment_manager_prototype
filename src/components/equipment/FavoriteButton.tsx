"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { toggleFavoriteAction } from "@/application/actions/favorite";
import { toast } from "sonner";

type Props = {
  equipmentId: string;
  initialIsFavorite: boolean;
  noBorder?: boolean;
};

export function FavoriteButton({
  equipmentId,
  initialIsFavorite,
  noBorder = false,
}: Props) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      // Optimistic update
      setIsFavorite(!isFavorite);

      const result = await toggleFavoriteAction(equipmentId);

      if (!result.success) {
        // Revert on failure
        setIsFavorite(initialIsFavorite);
        toast.error(result.error || "Failed to update favorite");
      } else {
        setIsFavorite(result.isFavorite!);
        toast.success(
          result.isFavorite ? "Added to favorites" : "Removed from favorites",
        );
      }
    });
  };

  return (
    <Button
      variant={noBorder ? "ghost" : "outline"}
      size="icon"
      onClick={handleToggle}
      disabled={isPending}
      className={`transition-colors duration-200 ${
        noBorder ? "border-none" : ""
      } ${
        isFavorite
          ? "text-red-500 hover:text-red-600" +
            (noBorder ? "" : " border-red-200 bg-red-50")
          : "text-slate-400 hover:text-slate-600"
      }`}
    >
      <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
    </Button>
  );
}
