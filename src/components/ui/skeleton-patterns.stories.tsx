import type { Meta, StoryObj } from '@storybook/react';
import {
  PageSkeleton,
  MovementListSkeleton,
  MovementDetailSkeleton,
  SettingsSkeleton,
  LibrarySkeleton,
  CardSkeleton
} from './skeleton-patterns';

const meta: Meta = {
  title: 'UI/Skeleton Patterns',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

export const Page: StoryObj = {
  name: 'Page Skeleton',
  render: () => <PageSkeleton />,
};

export const MovementList: StoryObj = {
  name: 'Movement List Skeleton',
  render: () => (
    <div className="p-4">
      <MovementListSkeleton />
    </div>
  ),
};

export const MovementDetail: StoryObj = {
  name: 'Movement Detail Skeleton',
  render: () => <MovementDetailSkeleton />,
};

export const Settings: StoryObj = {
  name: 'Settings Skeleton',
  render: () => (
    <div className="min-h-screen bg-background p-4">
      <SettingsSkeleton />
    </div>
  ),
};

export const Library: StoryObj = {
  name: 'Library Skeleton',
  render: () => (
    <div className="min-h-screen bg-background p-4">
      <LibrarySkeleton />
    </div>
  ),
};

export const Card: StoryObj = {
  name: 'Card Skeleton',
  render: () => (
    <div className="p-4">
      <CardSkeleton />
    </div>
  ),
};