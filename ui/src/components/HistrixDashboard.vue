<template>
  <q-page>
    <q-toolbar>
      <q-toolbar-title>{{ schema.title }}</q-toolbar-title>
    </q-toolbar>
    <div class="row q-col-gutter-sm q-ma-xs q-mr-sm">
      <div
        class="col-lg-6 col-md-6 col-sm-12 col-xs-12"
        v-for="widget in schema.widgets"
        v-bind:key="widget.id"
      >
        <q-card>
          <HistrixApp
            v-if="widget.target.xml"
            :path="getWidgetUrl(widget)"
            query=""
            styles="height:450px"
          />
          <div v-if="widget.iframe" :style="widget.style">
            <h5>{{ widget.title }}</h5>
            <iframe
              v-if="widget.iframe"
              :src="widget.iframe"
              style="width: 100%; height: 450px"
            />
          </div>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineAsyncComponentCompat } from '../services/asyncComponents.js';

export default {
  name: 'HistrixDashboard',
  props: {
    schema: {},
    resources: {}
  },
  components: {
        HistrixApp: defineAsyncComponentCompat(import('./HistrixApp.vue'))
  },
  mounted() {
    //
  },
  methods: {
    getWidgetUrl(widget) {
      return `${widget.target.dir}/${widget.target.xml}`;
    }
  }
};
</script>
