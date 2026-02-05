import { LoaderIcon } from "lucide-react";

export const LoadingIndicator = () => {
  return (
    <div className="flex justify-center py-8">
      <LoaderIcon className="size-5 animate-spin" />
    </div>
  );
};
