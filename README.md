# 在线教育智慧教学平台（前端）

Vue 3 单页应用，包含学员端、讲师端和运营管理端。直播页面保留界面入口，但直播 SDK 与服务端直播模块不在本次实现范围内。

## 环境要求

- Node.js 22.18+ 或 24.12+
- 后端默认运行于 `http://localhost:8080`

开发环境由 Vite 将 `/api` 和 `/uploads` 代理到后端。生产环境可设置 `VITE_API_BASE_URL=/api`。认证令牌由请求拦截器添加到 `Authorization: Bearer <token>`。

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```
