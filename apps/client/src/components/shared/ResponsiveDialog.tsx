"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export interface ResponsiveDialogProps {
  /** Determine whether the dialog is open */
  open?: boolean;
  /** Triggered when the dialog open state changes */
  onOpenChange?: (open: boolean) => void;
  /** The element that triggers the dialog/drawer (optional if controlled) */
  trigger?: React.ReactNode;
  /** The title of the dialog/drawer */
  title?: React.ReactNode;
  /** The description of the dialog/drawer */
  description?: React.ReactNode;
  /** The content to be rendered inside the dialog/drawer */
  children: React.ReactNode;
  /** Content wrapper CSS class */
  className?: string;
}

export function ResponsiveDialog({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  className,
}: ResponsiveDialogProps) {
  const isMobile = useIsMobile();
  const [internalOpen, setInternalOpen] = React.useState(false);

  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setIsOpen =
    isControlled && onOpenChange ? onOpenChange : setInternalOpen;

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        {trigger && (
          <DrawerTrigger
            render={React.isValidElement(trigger) ? trigger : undefined}
          >
            {!React.isValidElement(trigger) ? trigger : undefined}
          </DrawerTrigger>
        )}
        <DrawerContent className={cn("max-h-[92vh] flex flex-col rounded-t-2xl", className)}>
          <div className="overflow-y-auto flex flex-col gap-3.5 px-3.5 sm:px-6 pb-5 pt-1.5">
            {(title || description) && (
              <DrawerHeader className="text-left sm:text-center px-0 pt-1 pb-1.5 border-b border-border/40">
                {title && (
                  <DrawerTitle className="text-base font-bold text-foreground">
                    {title}
                  </DrawerTitle>
                )}
                {description && (
                  <DrawerDescription className="text-xs text-muted-foreground mt-0.5">
                    {description}
                  </DrawerDescription>
                )}
              </DrawerHeader>
            )}
            {children}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && (
        <DialogTrigger
          render={React.isValidElement(trigger) ? trigger : undefined}
        >
          {!React.isValidElement(trigger) ? trigger : undefined}
        </DialogTrigger>
      )}
      <DialogContent
        className={cn(
          "sm:rounded-2xl max-h-[90vh] p-0 flex flex-col sm:max-w-2xl",
          className,
        )}
      >
        {/* Scrollable inner area */}
        <div className="overflow-y-auto flex flex-col gap-5 p-5 sm:p-7">
          {(title || description) && (
            <DialogHeader className="text-left sm:text-left pb-2 border-b border-border/40">
              {title && (
                <DialogTitle className="text-lg sm:text-xl font-bold text-foreground">
                  {title}
                </DialogTitle>
              )}
              {description && (
                <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  {description}
                </DialogDescription>
              )}
            </DialogHeader>
          )}
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
