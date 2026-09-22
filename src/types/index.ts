import type { ComponentType, ReactNode } from "react";

export interface Dictionary {
  sidebar?: {
    dashboard?: string;
    collapse?: string;
    announcementTitle?: string;
    announcementSubtitle?: string;
  };
  [key: string]: unknown;
}

export interface ShellProps {
  readonly children: ReactNode;
  readonly dict?: Dictionary;
  readonly lang?: string;
}

export interface SidebarProps {
  readonly onClose?: () => void;
  readonly dict?: Dictionary;
  readonly lang?: string;
}

export interface NavItem {
  readonly name: string;
  readonly path: string;
  readonly exact?: boolean;
  readonly icon: ComponentType<{ size?: number; className?: string }>;
  readonly count?: number | string;
}

export interface SidebarAnnouncement {
  readonly imageSrc: string;
  readonly imageAlt: string;
  readonly title: string;
  readonly subtitle: string;
  readonly href: string;
}
