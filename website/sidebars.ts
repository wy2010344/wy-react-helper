import type { SidebarsConfig } from '@docusaurus/plugin-content-docs'

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  // 为wy-react-helper库创建侧边栏
  docsSidebar: [
    'intro',
    {
      type: 'category',
      label: '基础包 (wy-react-helper)',
      items: ['base/hooks', 'base/components', 'base/utilities'],
    },
    {
      type: 'category',
      label: 'DOM包 (wy-react-dom-helper)',
      items: ['dom/hooks', 'dom/utilities'],
    },
    {
      type: 'category',
      label: 'Native包 (wy-react-native)',
      items: ['native/index'],
    },
    { type: 'doc', id: 'deployment' },
  ],
}

export default sidebars
