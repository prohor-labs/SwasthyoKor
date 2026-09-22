"use client"

import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"

import { cn } from "@/lib/utils"
import { ArrowDown2 as ChevronDownIcon, Check as CheckIcon, ArrowUp2 as ChevronUpIcon } from "@/components/icons"

function findItemsFromChildren(node: React.ReactNode, map: Map<any, React.ReactNode> = new Map()): Map<any, React.ReactNode> {
  if (!node) return map;
  if (Array.isArray(node)) {
    node.forEach((child) => findItemsFromChildren(child, map));
    return map;
  }
  if (React.isValidElement(node)) {
    const props = node.props as any;
    if (props) {
      if ("value" in props && props.value !== undefined) {
        map.set(props.value, props.children);
      }
      if (props.children) {
        findItemsFromChildren(props.children, map);
      }
    }
  }
  return map;
}

interface SelectItemsContextValue {
  registerItem: (value: any, label: React.ReactNode) => void;
  unregisterItem: (value: any) => void;
  getLabel: (value: any) => React.ReactNode | undefined;
}

const SelectItemsContext = React.createContext<SelectItemsContextValue | null>(null);

function Select<Value = any, Multiple extends boolean | undefined = false>({
  children,
  ...props
}: SelectPrimitive.Root.Props<Value, Multiple>) {
  const itemsRef = React.useRef<Map<any, React.ReactNode>>(new Map());

  // Recursively scan static children to extract item labels immediately without waiting for popup mount
  const staticItemMap = React.useMemo(() => {
    return findItemsFromChildren(children);
  }, [children]);

  const registerItem = React.useCallback((val: any, label: React.ReactNode) => {
    itemsRef.current.set(val, label);
  }, []);

  const unregisterItem = React.useCallback((val: any) => {
    itemsRef.current.delete(val);
  }, []);

  const getLabel = React.useCallback((val: any) => {
    return itemsRef.current.get(val) ?? staticItemMap.get(val);
  }, [staticItemMap]);

  const contextValue = React.useMemo(
    () => ({ registerItem, unregisterItem, getLabel }),
    [registerItem, unregisterItem, getLabel]
  );

  return (
    <SelectItemsContext.Provider value={contextValue}>
      <SelectPrimitive.Root {...props}>
        {children}
      </SelectPrimitive.Root>
    </SelectItemsContext.Provider>
  );
}

function SelectGroup({ className, ...props }: SelectPrimitive.Group.Props) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn("scroll-my-1 p-1", className)}
      {...props}
    />
  )
}

function SelectValue({ className, children, ...props }: SelectPrimitive.Value.Props) {
  const itemsContext = React.useContext(SelectItemsContext);

  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn("flex flex-1 text-left", className)}
      {...props}
    >
      {(val: any) => {
        if (typeof children === "function") {
          return children(val);
        }
        if (children != null) {
          return children;
        }
        if (itemsContext && val !== undefined) {
          const registeredLabel = itemsContext.getLabel(val);
          if (registeredLabel !== undefined) {
            return registeredLabel;
          }
        }
        return val;
      }}
    </SelectPrimitive.Value>
  )
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: SelectPrimitive.Trigger.Props & {
  size?: "sm" | "default"
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "flex w-fit items-center justify-between gap-1.5 rounded-md border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon className="pointer-events-none flex size-4 shrink-0 items-center justify-center text-muted-foreground">
        <ChevronDownIcon className="size-4" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  side = "bottom",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  alignItemWithTrigger = true,
  ...props
}: SelectPrimitive.Popup.Props &
  Pick<
    SelectPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset" | "alignItemWithTrigger"
  >) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        className="isolate z-50"
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          data-align-trigger={alignItemWithTrigger}
          className={cn("relative isolate z-50 max-h-(--available-height) w-(--anchor-width) min-w-36 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-md bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[align-trigger=true]:animate-none data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95", className )}
          {...props}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.List>{children}</SelectPrimitive.List>
          <SelectScrollDownButton />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={cn("px-2 py-1.5 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  value,
  ...props
}: SelectPrimitive.Item.Props) {
  const itemsContext = React.useContext(SelectItemsContext);

  React.useEffect(() => {
    if (itemsContext && value !== undefined) {
      itemsContext.registerItem(value, children);
      return () => {
        itemsContext.unregisterItem(value);
      };
    }
  }, [itemsContext, value, children]);

  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      value={value}
      className={cn(
        "relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText className="flex flex-1 shrink-0 gap-2 whitespace-nowrap">
        {children}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
        <CheckIcon className="pointer-events-none size-4" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: SelectPrimitive.Separator.Props) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("pointer-events-none -mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) {
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-button"
      className={cn(
        "top-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpArrow>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) {
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot="select-scroll-down-button"
      className={cn(
        "bottom-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownArrow>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
