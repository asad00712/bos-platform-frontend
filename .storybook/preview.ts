import type { Preview } from '@storybook/react-vite'
import '../src/index.css'
import '../src/i18n'

const preview: Preview = {
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'app',
      values: [
        { name: 'app', value: 'oklch(1 0 0)' },
        { name: 'app dark', value: 'oklch(0.129 0.042 264.695)' },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: { test: 'todo' },
  },
  globalTypes: {
    theme: {
      description: 'Color scheme',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'sun', title: 'Light' },
          { value: 'dark', icon: 'moon', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme as string
      const root = document.documentElement
      root.classList.toggle('dark', theme === 'dark')
      root.dataset.theme = theme
      return Story()
    },
  ],
}

export default preview
