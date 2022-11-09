<template>
  <div>
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

    <q-list>
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
          <template v-slot:header>
            <q-item-section avatar>
              <q-avatar :icon="node.icon || 'arrow_right'" />
            </q-item-section>

            <q-item-section>
              <span v-html="node.label.toLowerCase()" />
            </q-item-section>
            <!--
          <q-item-section side>
            <div class="row items-center">
              <q-icon name="star" color="red" size="24px" />
            </div>
          </q-item-section>
-->
          </template>
          <q-separator />

          <histrixExpansionMenu
            :tree="node.children"
            :favorites="favorit"
            :is-favorite="isFavorite"
            _class="bg-grey-2"
            :mini="mini"
          />
        </q-expansion-item>
        <q-item
          v-else
          :to="nodeUri(node)"
          _dense
          @click="refrest(nodeUri(node))"
        >
          <q-item-section avatar v-if="node.icon">
            <q-icon :name="node.icon" style="font-size: 2rem;" />
          </q-item-section>
          <q-item-section
            _v-if="!mini"
            class="capitalize"
            v-html="node.label.toLowerCase()"
          ></q-item-section>
          <q-item-section side v-if="isFavorite" @click="setFavorit(node.menuId, node.uri, node.label.toLowerCase())">
            <q-btn flat round color="primary" :icon="setIconStart(node.menuId)" />
          </q-item-section>
        </q-item>
      </div>
    </q-list>
  </div>
</template>

<script>
import histrixApi from '../../services/histrixApi.js';

export default {
  name: 'HistrixExpansionMenu',
  props: {
    level: String,
    filter: Boolean,
    isFavorite: {
      type: Boolean,
      default: false,
    },
    tree: { type: Array },
    mini: Boolean,
    favorites: {
      type: Object,
      default: () => {},
    },
  },
  components: {
    HistrixExpansionMenu: () => import('./HistrixExpansionMenu.vue'),
  },
  data() {
    return {
      open: [],
      filterString: '',
      data: [],
      expanded: [],
      favorit: {},
      loading: true,
      locationCurrent: '',
    };
  },
  computed: {},
  watch: {
    filterString(newval, oldval) {
      if (newval != '') {
        this.$refs.qtree.expandAll();
      }
    },
    favorites(newval, oldval) {
      this.favorit = newval;
    },
  },
  methods: {
    setIconStart(idMenu) {
      if (this.favorit.keys.some((value) => value.menuId === idMenu)) {
        return 'star';
      } else {
        return 'star_border';
      }
    },
    async setFavorit(menuId, uri, name) {
      if (this.favorit.keys.some((value) => value.menuId === menuId)) {
        histrixApi.removeFavorit(this.favorit.id, menuId);
        const indexItem = this.favorit.keys.findIndex((item) => item.menuId == menuId);
        this.favorit.keys.splice(indexItem, 1);
        this.$events.fire('update-favorit');
        return;
      }
      histrixApi
      .setFavorit(menuId, uri, name, this.favorit.id)
      .then((response) => {
          this.$q.notify({
            message: 'Favorito guardado',
            color: 'positive',
            icon: 'check',
          });
          if (response.data.id) {
            this.favorit.id = response.data.id;
          }
          this.favorit.keys.push({menuId, uri, name});
        })
        .catch((error) => {
          this.$q.notify({
            message: 'El favorito no se pudo guardar',
            color: 'negative',
            icon: 'warning',
          });
        });
        this.$events.fire('update-favorit');
    },
    nodeUri(node) {
      // Si no tiene &vue= se devuelve el estandar
      if (!node.uri.includes('vue=')) {
        const path = `/auth/${node.uri}`.replace('//', '/');
        return { path, query: { _title: node.label } };
      }
      // recortar desde &vue= hasta el siguiente & o el final de la cadena (si no hay mas &)
      const vue = node.uri.match(/vue=(.*?)(&|$)/)[1];
      // transformar %2F en /
      const path = `/${vue}`.replace(/%2F/g, '/').replace('//', '/');
      return { path };
    },
    getData() {
      if (this.isFavorite) {
        histrixApi.getFavorites().then((response) => {
          this.favorit = response;
        });
      }
      histrixApi
        .getMenu(this.level)
        .then((response) => {
          this.loading = false;
          this.data = response.data.tree;
        })
        .catch(console.log);
    },
    refrest(url) {
      const localitation = location.hash;
      const queryIndex = localitation.indexOf('?');
      const newLocation = localitation.slice(1, queryIndex);
      if (newLocation === this.locationCurrent) {
        this.$router.replace({ ...url, hash: '#update' });
        this.$router.replace({ ...url, hash: ' ', params: { a: 100 } });
        return;
      }
      this.locationCurrent = url.path;
    },
  },
  mounted() {
    if (this.tree) {
      this.data = this.tree;
      this.favorit = this.favorites;
    } else {
      this.getData();
    }
  },
};
</script>

<style>
.capitalize {
  text-transform: capitalize;
}
</style>
