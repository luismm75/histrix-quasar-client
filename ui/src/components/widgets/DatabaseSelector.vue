<template>
  <div>
    <q-select
     v-model="localValue" :options="dbinfo" v-bind="$attrs" :disabled="state == 'error'" map-options
     />
    <q-banner dense inline-actions class="bg-red text-white" v-if="state == 'error'">
      {{message}}
    </q-banner>
    <q-banner dense inline-actions class="bg-green text-white" v-else>
      {{message}}
    </q-banner>
  </div>
</template>

<script>
import api from '../../services/histrixApi.js';

export default {
  name: 'DatabaseSelector',
  props: {
    host: String,
    value: String,
  },
  data() {
    return {
      dbinfo: [],
      state: 'success',
      message: '¡¡Histrix Connected!!',
    };
  },
  mounted() {
    if (this.host) {
      this.getData(this.host);
    }
  },
  computed: {
    localValue: {
      get() { return this.value; },
      set(localValue) { this.$emit('input', localValue.value); },
    },
  },
  watch: {
    host(newVal, oldVal) {
      this.getData(newVal);
    },
  },
  methods: {
    getData(host) {
      api.getHostDb(host)
        .then((response) => {
          const data = [];
          Object.entries(response.data).map((info) => {
            data.push({
              value: info[1].id,
              label: info[1].description,
              description: info[1].name,
            });
          });
          this.dbinfo = data;
          this.state = 'success';
          this.message = '¡¡Histrix Connected!!';
        })
        .catch((e) => {
          this.state = 'error';
          this.message = 'No Histrix Server Available';
        });
    },
  },
  mounted() {
    this.getData(host);
  },
};
</script>
