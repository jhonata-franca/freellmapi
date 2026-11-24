"use client"

import * as React from "react"
import * as TabsPrimitive from "@base-ui/react/tabs"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Tabs.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Tabs.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Tabs.List>
>(({ className, children, ...props }, ref) => (
  <TabsPrimitive.Tabs.List
    ref={ref}
    data-slot="tabs-list"
    className={cn(
      "flex h-9 items-center justify-center gap-1 rounded-2xl bg-muted p-1 text-muted-foreground",
      className
    )}
    {...props}
  >
    {children}
    <TabsPrimitive.Tabs.Indicator
      className={cn(
        "h-full flex items-center justify-center rounded-xl bg-background text-foreground shadow-xs transition-transform duration-200 ease-out"
      )}
    />
  </TabsPrimitive.Tabs.List>
))
TabsList.displayName = TabsPrimitive.Tabs.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Tabs.Tab>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Tabs.Tab>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Tabs.Tab
    ref={ref}
    data-slot="tabs-trigger"
    className={cn(
      "relative data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-3 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Tabs.Tab.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Tabs.Panel>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Tabs.Panel>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Tabs.Panel
    ref={ref}
    data-slot="tabs-content"
    className={cn(
      "mt-2 ring-offset-background focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-none focus-visible:ring-3",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Tabs.Panel.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }