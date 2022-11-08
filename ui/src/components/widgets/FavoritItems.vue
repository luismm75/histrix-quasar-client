<template>
  <div>
    <div class="content__header">
      <h1 class="content__title">Favoritos</h1>
    </div>
    <div class="content">
      <q-btn v-for="item in favoritItems.keys" :key="item.menuId" :to="{ path: `/auth${item.uri}` }">{{item.name}}</q-btn>
    </div>
  </div>
</template>

<script>
import histrixApi from '../../services/histrixApi.js';
export default {
  name: 'FavoritItems',
  data() {
    return {
      favoritItems: [],
    };
  },
  methods: {
    async getFavoritItems() {
      const response = await histrixApi.getFavorites();
      this.favoritItems = response;
    },
  },
  created() {
    this.getFavoritItems();
  },
  event: {
    'update-favorit': function() {
      this.getFavoritItems();
    },
  },
}
</script>

<style scoped>
.content {
  display: flex;
  gap: 0.5rem;
  flex-direction: row;
}
.content__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
.content__title {
  font-size: 1.5rem;
  font-weight: 500;
  color: #000;
}
@media (max-width: 600px) {
  .content {
    flex-direction: column;
  }
}
</style>