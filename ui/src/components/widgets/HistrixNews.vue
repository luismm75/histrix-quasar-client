<template>
  <div>
    <q-card flat bordered>
      <q-toolbar class="bg-orange text-white shadow-2">
        <q-toolbar-title
          ><q-avatar text-color="white" icon="rss_feed" /> Últimas
          Noticias</q-toolbar-title
        >
      </q-toolbar>
      <q-card-section>
        <q-list>
          <q-item
            dense
            v-for="post in data.slice(0, numberOfPosts)"
            :key="post.id"
            class="q-my-sm"
          >
            <q-item-section avatar>
              <q-avatar color="primary" text-color="white" icon="rss_feed">
                <img
                  v-if="post.image.length == 0"
                  alt=""
                  :src="HOST + post.foto"
                />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label>{{ post.title }}</q-item-label>
              <q-item-label caption lines="2" v-html="post.downText">{{
                post.downText
              }}</q-item-label>
              <q-item-label caption lines="10" v-html="post.news">{{
                post.news
              }}</q-item-label>
            </q-item-section>

            <q-chip side>
              {{ post.newsDate }}
            </q-chip>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
const histrixApi = Vue.prototype.$histrixApi

export default {
  name: 'HistrixNews',
  data() {
    return {
      numberOfPosts: 2,
      data: [],
      HOST: process.env.BASE_URL,
    };
  },
  methods: {
    getData() {
      const url = '/news/htx_news.xml';
      histrixApi.getAppData(url)
        .then((response) => {
          this.data = response.data.data;
        })
        .catch((e) => {
          console.log(e);
        });
    },
  },
  mounted() {
    
    this.getData();
  },
};
</script>
