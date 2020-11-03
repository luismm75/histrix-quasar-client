<template>
  <div >
    
    <!--
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
    -->

    <q-list >
      <div v-for="node in data" v-bind:key="node.key">

      <q-expansion-item
      
      dense
      :content-inset-level="0.2"
      :_header-inset-level="1"
        :group="level"
        expand-separator
        :icon="node.icon || 'arrow_right'"
        :label-lines="1"
        :label="node.label.toLowerCase()"
        :_caption="node.title"
        v-if="node.children"
        class="capitalize"
      >
      <q-separator />

        <histrixExpansionMenu :tree="node.children" _class="bg-grey-9" :mini="mini" />


      </q-expansion-item>
      <q-item v-else :to="nodeUri(node)" _dense>
        <q-item-section avatar  v-if="node.icon">
          <q-icon    :name="node.icon" style="font-size: 2rem;" />
       </q-item-section >
          <q-item-section _v-if="!mini" class="capitalize" v-html="node.label.toLowerCase()"></q-item-section>
      </q-item>
      </div>
    </q-list>    


  </div>
</template>

<script>
import histrixApi from '../../services/histrixApi.js'

export default {
  name: 'HistrixExpansionMenu',
  props: {
    level: String,
    filter: Boolean,
    tree: { type: Array },
    mini: Boolean,
  },
  components: {
     HistrixExpansionMenu: () => import("./HistrixExpansionMenu.vue"),
  },  
  data() {
    return {
      open: [],
      filterString: '',
      data: [],
      expanded: [],
      loading: true
    };
  },
  computed: {

  },
  watch: {
    filterString(newval, oldval) {
      if (newval != '') {
        this.$refs.qtree.expandAll();
      }
    }
  },
  methods: {
    nodeUri(node) {
      const path = (`/auth/${  node.uri}`).replace('//', '/')
      return { path, query: { _title: node.label } }
    },
    getData() {
      histrixApi.getMenu(this.level)
        .then((response) => {
          this.loading = false
          this.data = response.data.tree;
        })
        .catch(console.log);
    }
  },
  mounted() {
    if (this.tree) {
      this.data = this.tree
    } else {
      this.getData()
    }
  }

};
</script>

<style>
.capitalize {
  text-transform: capitalize;
}
</style>