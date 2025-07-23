import { fileURLToPath, URL } from 'node:url'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { defineConfig } from 'vite'
// import Icons from 'unplugin-icons/vite'
import vue from '@vitejs/plugin-vue'
// import IconsResolver from 'unplugin-icons/resolver'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      // 自动导入 Vue 相关函数，如：ref, reactive, toRef 等
      imports: ['vue'],
      resolvers: [
        ElementPlusResolver(),
        // IconsResolver({
        //   prefix: 'Icon',
        // }),
      ],
    }),
    Components({

      resolvers: [
        // IconsResolver({
        //   enabledCollections: ['ep'],
        // }),
        ElementPlusResolver()
      ],
    }),
    // Icons({
    //   autoInstall: true,
    // }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
