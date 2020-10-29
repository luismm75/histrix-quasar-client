import { QBadge } from 'quasar'

export default {
  name: 'HistrixClient',

  render (h) {
    return h(QBadge, {
      staticClass: 'HistrixClient',
      props: {
        label: 'HistrixClient'
      }
    })
  }
}
