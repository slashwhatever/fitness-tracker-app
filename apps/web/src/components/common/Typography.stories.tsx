import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Typography } from './Typography';

const meta: Meta<typeof Typography> = {
  title: 'Components/Typography',
  component: Typography,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['title1', 'title2', 'title3', 'body', 'caption'],
    },
    children: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Title1: Story = {
  args: {
    variant: 'title1',
    children: 'Main Page Title',
  },
};

export const Title2: Story = {
  args: {
    variant: 'title2',
    children: 'Section Title',
  },
};

export const Title3: Story = {
  args: {
    variant: 'title3',
    children: 'Subsection Title',
  },
};

export const Body: Story = {
  args: {
    variant: 'body',
    children: 'This is body text used for regular content and descriptions.',
  },
};

export const Caption: Story = {
  args: {
    variant: 'caption',
    children: 'This is caption text for small details and metadata.',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <Typography variant="title1">Title 1 - Main Headlines</Typography>
      <Typography variant="title2">Title 2 - Section Headers</Typography>
      <Typography variant="title3">Title 3 - Subsections</Typography>
      <Typography variant="body">
        Body text - Used for regular content, descriptions, and general reading material. 
        This is the most commonly used text variant throughout the application.
      </Typography>
      <Typography variant="caption">
        Caption text - Small details, metadata, timestamps, and secondary information.
      </Typography>
    </div>
  ),
};