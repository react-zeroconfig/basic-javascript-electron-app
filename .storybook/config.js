import { configure } from '@storybook/react';

configure(() => {
  const req = require.context('../src', true, /\.stories\.(js|jsx)$/);
  req.keys().forEach(req);
}, module);