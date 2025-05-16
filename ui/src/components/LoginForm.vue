<template>
  <q-card>
    <q-card-section>
      <FormLoginNotStyles
        :nextUrl="nextUrl"
        :login="login"
        :isRegister="isRegister"
        :isSelectDataBase="isSelectDataBase"
        :formLoginAlter="formLoginAlter"
        :redirectParent="redir"
        :eventAfter="eventAfter"
      />
    </q-card-section>
  </q-card>
</template>

<script>
import FormLoginNotStyles from './FormLoginNotStyles.vue';

export default {
  props: {
    /**
     * @description Url para redirecionar despues de login
     * @type {String} - Url
     * @default null
     * @example
     * nextUrl="/"
     */
    nextUrl: {
      required: false,
      default: null,
      type: String || Boolean
    },

    /**
     * @description Pasarle ya el email o username para que se loguee
     * @type {String} - Email o username
     * @default null
     * @example
     * login="histrix"
     */
    login: {
      required: false,
      default: null,
      type: String
    },

    /**
     * @description Si es true, muestra el boton de registro
     * @type {Boolean}
     * @default false
     * @example
     * isRegister="true"
     */
    isRegister: {
      required: false,
      default: false,
      type: Boolean
    },

    /**
     * @description Si es true, muestra el select de base de datos
     * @type {Boolean}
     * @default false
     * @example
     * isSelectDataBase="true"
     */
    isSelectDataBase: {
      required: false,
      default: false,
      type: Boolean
    },

    /**
     * @description Mandarle con que datos se va a loguear
     * @type {Object}
     * @default {email: null, password: null}
     * @example
     * formLoginAlter="{email: 'histrix', password: 'histrix'}"
     */
    formLoginAlter: {
      required: false,
      default: () => ({
        email: null,
        password: null
      }),
      type: Object
    }
  },
  name: 'LoginForm',
  components: {
    FormLoginNotStyles
  },
  mixins: [],
  data() {
    return {
      /**
       * @description Url para redirecionar despues de login pasado por evento
       * @type {String} - Url
       * @default null
       */
      redir: null,
      /**
       * @description Evento para ejecutar despues de login
       * @type {String} - Evento
       * @default null
       */
      eventAfter: null
    };
  },
  mounted() {
    //
  },
  computed: {},
  watch: {},
  methods: {},
  events: {
    /**
     * @description Evento para redirecionar despues de login
     * @param {String | null} redirect - Url para redirecionar despues de login default null
     * @param {String | null} eventAfter - Evento para ejecutar despues de login default null
     * @returns {void}
     * @example
     * this.$events.fire('login-modal', '/home', 'event-after');
     */
    'login-modal'(redirect = null, eventAfter = null) {
      this.redir = redirect;
      this.eventAfter = eventAfter;
    },
    /**
     * @description Evento para ejecutar despues de login
     * @param {String | null} eventAfter - Evento para ejecutar despues de login default null
     * @returns {void}
     * @example
     * this.$events.fire('event-after', 'event-after');
     */
    'event-after'(eventAfter) {
      this.redir = null;
      this.eventAfter = eventAfter;
    }
  }
};
</script>

<style scoped></style>
