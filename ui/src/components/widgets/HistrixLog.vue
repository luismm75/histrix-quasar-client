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
import histrixApi from '../../services/histrixApi.js';

export default {
  name: 'HistrixLog',
  data() {
    return {
      data: []
    };
  },
  methods: {
    subscribeWamp() {
      if (this.$wamp) {
        this.$wamp.subscribe(`${histrixApi.currentDb()}.histrix.log`, (_args, kwArgs, _details) => {
          this.data.push(kwArgs.data.data.log);
        });
      }
    }
  },
  mounted() {
    this.data = [];
    this.subscribeWamp();
  }
};
</script>
