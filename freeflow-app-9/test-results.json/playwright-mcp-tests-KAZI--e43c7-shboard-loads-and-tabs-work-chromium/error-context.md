# Page snapshot

```yaml
- dialog "Unhandled Runtime Error":
  - navigation:
    - button "previous" [disabled]:
      - img "previous"
    - button "next" [disabled]:
      - img "next"
    - text: 1 of 1 error Next.js (14.2.30) is outdated
    - link "(learn more)":
      - /url: https://nextjs.org/docs/messages/version-staleness
  - button "Close"
  - heading "Unhandled Runtime Error" [level=1]
  - paragraph: "TypeError: Cannot read properties of undefined (reading 'recentlyCreatedOwnerStacks')"
  - heading "Call Stack" [level=2]
  - heading "ReactSharedInternals" [level=3]
  - text: node_modules/.pnpm/@stagewise+toolbar-next@0.5.0_@types+react@18.3.3_next@14.2.30_@babel+core@7.28.0_@openteleme_msvrbzrcdbfzzmt7e4saviabsq/node_modules/@stagewise/toolbar-next/dist/index.js (285:36)
  - heading "jsx" [level=3]
  - text: node_modules/.pnpm/@stagewise+toolbar-next@0.5.0_@types+react@18.3.3_next@14.2.30_@babel+core@7.28.0_@openteleme_msvrbzrcdbfzzmt7e4saviabsq/node_modules/@stagewise/toolbar-next/dist/index.js (335:44)
  - group:
    - img
    - img
    - text: React
```