import React from 'react'
import clsx from 'clsx'
import { useBaseUrlUtils } from '@docusaurus/useBaseUrl'
import Layout from '@theme/Layout'
import Link from '@docusaurus/Link'
import CodeBlock from '@theme/CodeBlock'
import styles from './index.module.css'

function HomepageHeader() {
  const { withBaseUrl } = useBaseUrlUtils()

  return (
    <header className={clsx('hero hero--primary', styles.hero)}>
      <div className="container">
        <h1 className="hero__title">wy-react-helper</h1>
        <p className="hero__subtitle">
          实用的React辅助库，提供丰富的Hooks和工具函数，简化React应用开发
        </p>
        <div className={styles.heroButtons}>
          <Link
            className="button button--primary button--lg"
            to={withBaseUrl('/docs/intro')}
          >
            开始使用
          </Link>
          <Link
            className="button button--secondary button--lg"
            href="https://github.com/wy2010344/wy-react-helper"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </Link>
        </div>
      </div>
    </header>
  )
}

function Feature({
  title,
  description,
  items,
}: {
  title: string
  description?: string
  items?: string[]
}) {
  return (
    <div className={styles.feature}>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {items && (
        <ul>
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

function FeaturesSection() {
  return (
    <section className={styles.featureSection}>
      <div className="container">
        <h2>核心功能</h2>
        <div className={styles.features}>
          <Feature
            title="Base 包"
            description="适用于所有React环境的基础工具集"
            items={[
              '通用Hooks集合',
              '类型工具和辅助函数',
              '跨平台兼容的状态管理',
            ]}
          />
          <Feature
            title="DOM 包"
            description="专门为Web平台设计的工具集"
            items={['浏览器相关的Hooks', 'DOM操作辅助函数', 'Web API封装']}
          />
          <Feature
            title="Native 包"
            description="为React Native开发优化的工具集"
            items={['移动平台特定Hooks', '原生组件辅助函数', '跨平台数据同步']}
          />
        </div>
      </div>
    </section>
  )
}

function GettingStartedSection() {
  return (
    <section className={styles.gettingStartedSection}>
      <div className="container">
        <h2>快速开始</h2>
        <div className="row">
          <div className="col col--6">
            <h3>安装</h3>
            <CodeBlock className="language-bash">
              {`# 安装全部包
npm install wy-react-helper

# 或选择性安装
npm install @wy-react-helper/base
npm install @wy-react-helper/dom
npm install @wy-react-helper/native`}
            </CodeBlock>
          </div>
          <div className="col col--6">
            <h3>基础使用</h3>
            <CodeBlock className="language-jsx">
              {`// 导入所需的hooks或工具函数
import { useLocalStorage } from 'wy-react-helper';

function MyComponent() {
  // 使用hook
  const [count, setCount] = useLocalStorage('count', 0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}`}
            </CodeBlock>
          </div>
        </div>
        <div
          className="text-center"
          style={{ marginTop: 'var(--ifm-spacing-vertical-lg)' }}
        >
          <Link className="button button--primary button--lg" to="/docs/intro">
            查看完整文档
          </Link>
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <Layout
      title="wy-react-helper"
      description="React 辅助库 - 提供实用的Hooks和工具函数"
    >
      <HomepageHeader />
      <main>
        <FeaturesSection />
        <GettingStartedSection />
      </main>
    </Layout>
  )
}
