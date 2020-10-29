<template>
  <div>
  <q-expansion-item
      v-model="open"
      icon="search"
      :label="schema.title"
      caption="búsqueda avanzada" >
        <!-- <q-expansion-item dense dense-toggle icon="filter_list" label="Filtros"> -->
        <q-item v-for="field in filters" v-bind:key="field.uid" class=" col-xs-12 col-sm-6 col-md-6" dense>
           <HistrixField dense v-model="field.valor" :schema="field" clearable  filled/>
        </q-item>
          <q-btn
            v-if="schema.filters[0]"
            v-close-popup

            class="fit"
            color="secondary"
            label="Buscar"
            icon="search"
            v-on:click="filterData"
          />

    </q-expansion-item>
<!--
    <q-btn icon="filter_list" :class="(open?'bg-accent ':'')" flat round _label="Filtros">
      <q-menu v-model="open" anchor="bottom left" self="top middle" dense ref="filter" >

        <q-card class="q-pa-md row">

        <q-item v-for="field in filters" v-bind:key="field.uid" class=" col-xs-12 col-sm-6 col-md-6" dense>
           <HistrixField dense v-model="field.valor" :schema="field" clearable  filled/>
        </q-item>
          <q-btn
            v-if="schema.filters[0]"
            v-close-popup

            class="fit"
            color="secondary"
            label="Buscar"
            icon="search"
            v-on:click="filterData"
          />
        </q-card>
      </q-menu>
    </q-btn>
    -->
  </div>
</template>

<script>
export default {
  name: 'HistrixFilters',
  props: ['schema', 'show'],
  components: {
    HistrixField: () => import('./HistrixField.vue'),
  },
  mounted() {
    this.initFilters();
    this.open = this.show;
  },
  data() {
    return {
      filters: [],
      open: false,
    };
  },
  methods: {
    filterData() {
      this.$emit('filter-data', this.getFilterData());
    },
    initFilters() {
      // filter local fields
      const filteredFilters = this.schema.filters.filter(e => e.local != 'true');
      const customFields = [];

      this.filters = filteredFilters.map(function (f) {
        f.disabled = f.deshabilitado;
        f.readonly = f.deshabilitado;
        const item = this.schema.fields[f.id];
        return { ...item, ...f };
      }, this);
    },
    getFilterData() {
      let query = '';
      this.filters.map((filter) => {
        if (filter.valor) {
          query
            += `&_f[]=${
              filter.campo
            }&_o[]=${
              filter.operador
            }&_v[]=${
              filter.valor}`;
        }
      });
      return query;
    },
  },
};
</script>
