<template>
  <q-btn round flat dense v-if="notificationCount">
    <q-badge color="red" text-color="white" floating _v-if="notificationCount">
      {{ notificationCount }}
    </q-badge>
    <q-avatar icon="notifications">
      <q-menu anchor="bottom left" self="top left">
        <div
          v-for="notification in notifications"
          v-bind:key="notification.idMensaje"
        >
          <q-item clickable>
            <q-item-section avatar>
              <q-icon :name="'person'" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>{{ notification.title }}</q-item-label>

              <q-item-label lines="2">
                {{ notification.mensaje }}
              </q-item-label>
              <q-item-label caption></q-item-label>
            </q-item-section>

            <q-item-section side top>
              <q-icon name="email" color="green" />
            </q-item-section>
          </q-item>
          <q-separator inset />
        </div>
        <q-chip v-if="notificationCount == 0" icon="notifications"
          >Sin Notificaciones</q-chip
        >
        <!--  </q-expansion-item> -->
      </q-menu>
    </q-avatar>
    <q-tooltip>Notifications</q-tooltip>
  </q-btn>
</template>

<script>
import api from '../../services/histrixApi.js';

export default {
  name: "notificationMenu",
  components: {},
  mounted() {
    this.getNotifications();
  },
  data() {
    return {
      notificationCount: 0,
      notifications: {}
    };
  },
  methods: {
    getNotifications() {
      api.getUserNotifications().then((response) => {
        this.notificationCount = response.data.messageCount;
        this.notifications = response.data.messages;
      })
    }
  }
};
</script>
