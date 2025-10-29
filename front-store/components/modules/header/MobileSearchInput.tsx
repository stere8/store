import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import * as React from "react";

export default function MobileSearchInput({
  className,
}: {
  className?: string;
}) {
  return (
    <div className={cn("", className)}>
      <Dialog>
        <DialogTrigger>
          <Search />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Search here</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
