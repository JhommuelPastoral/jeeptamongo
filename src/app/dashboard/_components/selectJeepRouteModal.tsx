"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
type Position = [number, number];
import { memo } from "react";

type RouteMap = {
  jeepName: string;
  color: string;
  position: Position[];
}
type Props = {
  open: boolean;
  onClose: (open: boolean) => void;
  routes: RouteMap[];
  onSelect: (route: RouteMap) => void;
};

function SelectJeepRouteModal({ open, onClose, routes, onSelect }: Props) {

  return (
    <Dialog open={open} onOpenChange={onClose} modal>
      <DialogContent 
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Select Jeep Route</DialogTitle>
          <DialogDescription>
            Multiple routes found. Choose one.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {routes.map((route) => (
            <Button
              key={route.jeepName}
              onClick={() => onSelect(route)}
              className="w-full"
            >
              {route.jeepName}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
export default memo(SelectJeepRouteModal);