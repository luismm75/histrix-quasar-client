<template>
  <div >
    <q-input dense standout v-model="filterString" class="q-ma-md" v-if="filter">
      <template v-slot:append>
        <q-icon v-if="filterString === ''" name="search" />
        <q-icon
          v-else
          name="clear"
          class="cursor-pointer"
          @click="filterString = ''"
        />
      </template>
    </q-input>
    <q-skeleton  square height="300px" v-if="loading"/>
    <q-tree
      v-if="!loading"
      :nodes="tree"
      ref="qtree"
      node-key="nodeKey"
      no-connectors
      dense
      accordion
      :expanded.sync="expanded"
      :filter="filterString"
    >
      <template v-slot:default-header="prop">
        <q-item
          clickable
          dense
          :to="nodeUri(prop)"
          v-if="prop.node.uri != ''"
          
        >
        <q-icon v-if="prop.node.icon" :name="prop.node.icon" color="blue-8" _size="28px" class="q-mr-sm" />
          <span class="capitalize" v-html="prop.node.label.toLowerCase()"></span>
        </q-item>
        <q-item  dense v-else >
          <q-icon v-if="prop.node.icon" :name="prop.node.icon" color="blue-8" _size="28px" class="q-mr-sm" />
          <span class="capitalize" v-html="prop.node.label.toLowerCase()"></span></q-item>

      </template>
    </q-tree>
  </div>
</template>

<script>
import histrixApi from '../../services/histrixApi.js';

export default {
  name: 'HistrixMenu',
  props: {
    level: '',
    filter: true
  },
  data() {
    return {
      filterString: '',
      tree: [{ nodeKey: '0', label: 'Buscando ...' }],
      expanded: [],
      loading: true
    };
  },
  watch: {
    filterString(newval, _oldval) {
      if (newval !== '') {
        this.$refs.qtree.expandAll();
      }
    }
  },
  methods: {
    nodeUri(prop) {
      const path = `/auth/${prop.node.uri}`.replace('//', '/');
      return { path, query: { _title: prop.node.label } };
    }
  },
  mounted() {
    histrixApi
      .getMenu(this.level)
      .then((response) => {
        this.loading = false;
        this.tree = response.data.tree;
      })
      .catch(console.log);
  }
};
</script>

<style>
.capitalize {
  text-transform: capitalize;
}
</style>