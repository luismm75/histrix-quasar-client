<template>
  <div  class="q-pa-md">
    <q-card bordered padding >
      <q-item v-for="log in data" v-bind:key="log">
       <q-item-section> {{ log }} </q-item-section>
      </q-item>
    </q-card>
  </div>
</template>

<script>
const histrixApi = Vue.prototype.$histrixApi

export default {
  name: 'HistrixLog',
  data() {
    return {
      data: [],
    };
  },
  methods: {
    subscribeWamp() {
      const that = this;
      if (this.$wamp) {
        this.$wamp.subscribe(`${histrixApi.currentDb()}.histrix.log`, (args, kwArgs, details) => {
          that.data.push(kwArgs.data.data.log);
        });
      }
    },
  },
  mounted() {
    this.data = [];
    this.subscribeWamp();
  },
};
</script>
