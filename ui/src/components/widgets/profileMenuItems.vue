<template>
  <q-list>
       <q-expansion-item
      dense
      :content-inset-level="0.3"
      :_header-inset-level="1"
        group="Personal"
        expand-separator
        icon="person"
        :label-lines="1"
        label="Configuración Personal"
        caption="Menú de usuario"
        class="capitalize"
      >

      <HistrixMenu level="phpmen-fsm" :filter="false" :mini="mini"/>
    
      </q-expansion-item>
        <q-item v-for="item in items" :key="item.to.name" tag="a" :to="item.to">
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label>
              <span v-text="item.label"></span>
            </q-item-label>
            <q-item-label caption></q-item-label>
          </q-item-section>
        </q-item>
  </q-list>
</template>

<script>

export default {
  name: 'profileMenuItems',
  components: {
    HistrixMenu: () => import('./HistrixExpansionMenu.vue'),
  },
  props: ['mini'],
  methods: {
  },
  data() {
    return {
      items: [
        {
          icon: 'person',
          label: 'Mis Datos',
          caption: 'Datos personales',
          to: { name: 'profile' }
        },
        /*
        {
          icon: 'settings',
          label: 'Settings',
          caption: 'Configuración',
          to: { name: 'systemSettings' }
        },
        */
        {
          icon: 'info',
          label: 'Acerca',
          caption: 'Acerca de Histrix',
          to: { name: 'about' }
        }
      ]
    };
  }
};
</script>
