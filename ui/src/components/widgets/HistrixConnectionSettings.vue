<template>

      <div
        class="col q-pa-md
                 text-center "
      >
        <h5>Datos de Conexión</h5>
        <q-form @submit="save">
          <q-input
            v-model="host"
            class="q-mt-sm"
            label="Ruta de su Histrix"
            hint="Indique la Ruta al servidor Histrix. Ej: http://localhost/"
          ></q-input>

          <DatabaseSelector
            :host="host"
            label="Base de datos"
            v-model="database"
            hint="Base de Datos por defecto"
          />
          <br />

          <q-btn
            class="  bg-primary"
            text-color="white"
            icon="save"
            v-close-popup="3"
            type="submit"
            :label="'Guardar'"
          ></q-btn>
                    <q-btn
            flat
            text-color="primary"
            v-close-popup="3"

            label="Cancelar"
          ></q-btn>
        </q-form>
      </div>
  
</template>

<script>

export default {
  name: 'HistrixConectionSettings',
  data() {
    return {
      host: null,
      database: null
    };
  },
  mounted() {
    this.host = localStorage.getItem('host');
    this.database = localStorage.getItem('database');
  },
  methods: {
    async save() {
      localStorage.setItem('host', this.host);
      localStorage.setItem('database', this.database);
      this.$emit('change-database');
      // this.$router.push('/');
      /*
          this.$store.dispatch(AUTH_REQUEST, { username, password, database }).then(() => {
            this.$router.push('/auth/home')
           });

      */
    }
  }
};
</script>
