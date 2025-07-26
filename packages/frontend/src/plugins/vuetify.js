// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// Material Design Icons
import '@mdi/font/css/materialdesignicons.css'

const vuetify = createVuetify({
  components,
  directives,
  defaults:{
    VSelect: {
      color: 'primary'
    },
    VTextField:{
      color:'primary'
    }
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#20B2AA',
          secondary: '#5CBBF6',
          accent: '#4CAF50',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FB8C00',
        },
      },
    },
  },
  icons: {
    defaultSet: 'mdi',
  },
})

export default vuetify