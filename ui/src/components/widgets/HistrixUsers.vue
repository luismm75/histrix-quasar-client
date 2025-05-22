<template>
    <div  class="q-gutter-md" flat >
    <q-list class="q-px-sm" >
      <q-item-label header><q-avatar   icon="people" /> Contactos ({{total}}) Online ({{online.length}})</q-item-label>
      <q-input v-model="search" type="search"  dense >
        <template v-slot:append >
          <q-icon name="search" />
        </template>
      </q-input>
      <q-item
        dense
        v-for="contact in filteredItems"
        :key="contact.id"
        clickable
        v-ripple
      >
        <q-item-section avatar>
          <q-avatar
            color="primary"
            text-color="white"
          >
            <img
              v-if="contact.foto.length == 0"
              alt=""
              :src="HOST + contact.foto"
            />
            <span v-else>
              {{ contact.Nombre[0] }}
            </span>
          </q-avatar>
        </q-item-section>

        <q-item-section>
          <q-item-label>{{ contact.fullname }}</q-item-label>
          <!--          <q-item-label caption lines="1">{{ contact.email }}</q-item-label>
          <q-item-label caption lines="1">{{ contact.telefono }}</q-item-label> -->
        </q-item-section>

        <q-item-section
          side
          top
        >
          <q-item-label caption>{{ contact.time}}</q-item-label>
          <q-icon
            name="chat_bubble"
            :color="contact.isUp?'green':'black'"
          />
        </q-item-section>
      </q-item>
    </q-list>

  </div>

</template>


<script>
import { date } from 'quasar';
import useApi from '../../services/histrixApi.js';

export default {
  name: 'HistrixUsers',
  setup() {
    const { getUsers } = useApi();
    return { getUsers };
  },
  props: {
    online: Array
  },
  data() {
    return {
      search: '',
      total: 0,
      users: []
    };
  },
  computed: {
    onlineCount() {
      return this.filteredItems.filter((item) => {
        return item.isUp;
      }).length;
    },
    filteredItems() {
      return this.users
        .map((item) => {
          item.isUp = this.online.filter((up) => {
            const online = JSON.parse(up);
            return item.Id_usuario === online.id;
          }).length;
          const newDate = new Date();
          const lastlog = new Date(item.ultimolog);
          const daydiff = date.getDateDiff(newDate, lastlog, 'days');
          if (daydiff > 0) {
            item.time = `${daydiff} días`;
          } else {
            const mindiff = date.getDateDiff(newDate, lastlog, 'minutes');
            if (mindiff > 60) {
              const hourdiff = date.getDateDiff(newDate, lastlog, 'hours');
              item.time = `${hourdiff} hs`;
            } else {
              item.time = `${mindiff} min`;
            }
          }

          return item;
        })
        .filter((item) => {
          const name = item.fullname || item.Nombre;
          return name.toLowerCase().indexOf(this.search.toLowerCase()) > -1;
        });
    }
  },
  mounted() {
    // this.subscribeWamp();
    this.getUsers().then((response) => {
      this.users = response.data.users;
      this.total = response.data.total;
    });
  },
  methods: {}
};
</script>
