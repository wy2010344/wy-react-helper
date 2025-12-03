---
title: Native包简介
sidebar_position: 1
---

# Native包简介

`wy-react-native` 包提供了一系列专为 React Native 应用设计的 Hooks 和工具函数，这些功能只能在 React Native 环境中使用。

## 主要功能

### 平台特定功能
- 提供对原生功能的便捷访问
- 处理平台差异和兼容性
- 优化移动设备上的性能表现

### 常用 Hooks

#### useNativeEvent

专门为 React Native 环境优化的事件处理 Hook。

#### useKeyboardAvoid

处理键盘弹出时的视图适配，避免输入框被键盘遮挡。

#### useSafeArea

处理安全区域（如刘海屏、底部手势条等）的适配。

#### useAnimated

封装 React Native Animated API，提供更简便的动画创建方式。

#### useDeviceInfo

获取设备信息，如设备型号、系统版本等。

### 工具函数

#### 导航相关
- 提供简化的导航操作函数

#### 存储相关
- 封装 AsyncStorage 等存储 API

#### 传感器相关
- 简化对设备传感器（如加速度计、陀螺仪）的访问

## 使用示例

### 安装

```bash
# 使用 npm
npm install wy-react-native

# 使用 yarn
yarn add wy-react-native
```

### 基本用法

```tsx
import { useKeyboardAvoid, useSafeArea } from 'wy-react-native';
import { View, TextInput, StyleSheet } from 'react-native';

function LoginScreen() {
  // 处理键盘弹出
  const { paddingBottom } = useKeyboardAvoid();
  
  // 获取安全区域
  const insets = useSafeArea();
  
  return (
    <View 
      style={[
        styles.container, 
        { paddingTop: insets.top, paddingBottom: paddingBottom + insets.bottom }
      ]}
    >
      <TextInput style={styles.input} placeholder="用户名" />
      <TextInput style={styles.input} placeholder="密码" secureTextEntry />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  input: {
    height: 40,
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  }
});
```

## 注意事项

- 该包只能在 React Native 环境中使用，无法在 Web 或其他环境中工作
- 使用前确保已经正确配置了 React Native 开发环境
- 部分功能可能需要链接原生模块，请按照文档指引进行配置