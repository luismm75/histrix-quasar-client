<template>
<div>
  <div >
    <q-toolbar class="bg-primary text-white ">
      <q-toolbar-title><q-avatar  text-color="white" icon="rss_feed" />{{ schema.title}}</q-toolbar-title>
    </q-toolbar>
    <div v-if="schema.filters[0]" dense>
      <HistrixFilters dense :schema="schema" v-on:filter-data="getData(xmlUrl($event))"/>
    </div>
  </div>
  <div class="_q-pa-md q-gutter-md" outline >
    <q-list outline  bordered>
      <q-item v-for="(row, index) in data" v-bind:key="index" clickable @click="editItem(row)">
        <q-item-section v-for="(field, index) in row" v-bind:key="index">
          <q-item-label v-html="field._">
            {{ field._ }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</div>
</template>

<script>
import histrixApi from '../services/histrixApi.js'

export default {
  name: 'HistrixList',
  props: {
    path: null,
    schema: {},
    resources: {},
  },
  components: {
    HistrixFilters: () => import('./HistrixFilters.vue'),
  },
  mounted() {
    const url = this.xmlUrl();
    this.getData(url);
  },
  watch: {
    path(newVal, oldVal) {
      const url = this.xmlUrl();
      this.getData(url);      
    },
  },
  computed: {
    visibleColumns() {
      return this.schema.columns.filter(
        (column) => {return !column.hidden}
      ).map((column, index, array) => {
        return column.name; 
      });
    },

    filteredData(cols) {
      return this.data.filter((row) => {
        return !row.value
      });
    },
  },
  methods: {
    xmlUrl(query) {
      return `${this.path}?${query || '' }&_dt=list`;
    },
    deleteItem(item) {
      const index = this.data.indexOf(item);
      confirm('Are you sure you want to delete this item?')
        && this.data.splice(index, 1);
    },
    editItem(item) {
      this.editedIndex = this.data.indexOf(item);

      const item2 = {}; let 
        key;
      for (key in item) {
        item2[key] = (item[key].value || item[key]._);
      }

      this.editedItem = Object.assign({}, item2);
      this.$router.push({
        name: 'form',
        params: {
          path: this.path,
          editedItem: item2,
          schema: this.schema,
          resources: this.resources,
        },
      });
    },
    close() {
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      }, 300);
    },
    getData(url) {
      histrixApi.getAppData(url)
        .then((response) => {
          this.data = response.data.data;
        })
        .catch((e) => {
          this.dialog = true;
          this.message = 'Error de Carga de Datos';
        });
    },
  },
  data() {
    return {
      message: null,
      dialog: false,
      mode: 'list',
      editedItem: [],
      dataContainer: null,
      data: [],
      pagination: {
        sortBy: 'desc',
        descending: false,
        page: 1,
        rowsPerPage: 10,
        // rowsNumber: xx if getting data from a server
      },

    };
  },
};
</script>
