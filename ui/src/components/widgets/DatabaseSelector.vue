<template>
  <div>
    <q-select map-options
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
import histrixApi from '../../services/histrixApi.js'

export default {
  name: 'DatabaseSelector',
  props: {
    host: null,
    value: {},
  },
  data() {
    return {
      dbinfo: [],
      state: 'success',
      message: '¡¡Histrix Connected!!',
    };
  },
  mounted() {
      this.getData(this.host);
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
      histrixApi.getHostDb(host)
        .then((response) => {
          const data = [];
          console.log(response.data);
          Object.entries(response.data).filter(data => data[1].hidden !== "true").map((info) => {
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
  }
};
</script>
