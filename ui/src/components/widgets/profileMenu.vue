<template>
  <q-btn round flat>
    <q-avatar icon="account_circle">
      <q-menu anchor="bottom left" self="top left">
        <q-item>
          <HistrixMenu level="phpmen-fsm" :filter="false"/>
        </q-item>

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

        <q-item tag="a" exact @click="this.exit" class="bg-primary text-white">
          <q-item-section avatar>
            <q-icon :name="'logout'" />
          </q-item-section>
          <q-item-section>
            <q-item-label>
              <span v-text="'Cerrar la Sesion'"></span>
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-menu>
    </q-avatar>
    <q-tooltip>Account</q-tooltip>
  </q-btn>
</template>

<script>

export default {
  name: 'profileMenu',
  components: {
    HistrixMenu: () => import('./HistrixExpansionMenu.vue'),
  },
  methods: {
    exit() {
      this.$auth.logout();
    },
  },
  data() {
    return {
      items: [
        {
          icon: 'person',
          label: 'Mis Datos',
          caption: 'Datos personales',
          to: { name: 'profile' },
        },
        {
          icon: 'settings',
          label: 'Settings',
          caption: 'Configuración',
          to: { name: 'systemSettings' },
        },
        {
          icon: 'info',
          label: 'Acerca',
          caption: 'Acerca de Histrix',
          to: { name: 'about' },
        },
      ],
    };
  },
};
</script>
