<template>
  <q-form @submit.prevent="submitLogin">
    <slot name="format">
        <div class="row">
          <div class="col-xs-12 q-mb-sm">
            <div class="img" v-if="isSelectDataBase">
            <q-img
          :src="imglogo"
          class="logo"
        />
      </div>
            <q-select v-if="isSelectDataBase" outlined v-model="db" map-options emit-value :options="infoDB" label="Database" />
            <q-input
              inverted-light
              :label="'Ingrese su correo electrónico'"
              id="email"
              autofocus
              required
              type="text"
              autocomplete="username"
              v-model="form.email"
              name="email"
              class="full-width"
              :before="[
                {
                  icon: 'person',
                },
              ]"
            >
              <template v-slot:prepend>
                <q-icon name="email" />
              </template>
            </q-input>
          </div>
          <div class="col-xs-12 q-mb-sm">
            <q-input
              :label="'Ingrese contraseña'"
              id="password"
              inverted-light
              autocomplete="current-password"
              :type="IsPasswordView ? 'password' : 'text'"
              v-model="form.password"
              name="password"
              class="full-width"
              :before="[{ icon: 'lock' }]"
            >
              <template v-slot:prepend>
                <q-icon name="vpn_key" />
              </template>
              <template v-slot:append>
                <q-icon
                  :name="IsPasswordView ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="IsPasswordView = !IsPasswordView"
                />
              </template>
            </q-input>
          </div>
          <br />
          <div class="col-xs-12 q-mb-sm text-center">
            <q-btn
              icon="chevron_right"
              class="q-pl-md q-pr-md q-pt-sm q-pb-sm full-width"
              :disable="btnLoading"
              type="submit"
              :loading="btnLoading"
              color="positive"
              size="md"
              label="Ingresar"
            >
            </q-btn>
            <div class="row text-center">
              <q-btn
                v-if="!isRegister"
                size="sm"
                flat
                class="col q-ma-md bg-accent"
                color="white"
                :to="{ name: 'register', query: { t: new Date().getTime() } }"
              >
                <span class="q-ml-xs">Registrarme</span>
              </q-btn>

              <q-btn
                size="sm"
                flat
                class="q-ma-md col"
                color="primary"
                v-close-popup
                :to="{ name: 'mail-reset-password' }"
              >
                <span class="q-ml-xs">Recuperar contraseña</span>
              </q-btn>
            </div>
          </div>
        </div>
      </slot>
      </q-form>
</template>

<script>
import { required } from '@vuelidate/validators';
import { useVuelidate } from '@vuelidate/core';

import config from '../services/config.js';
import histrixApi from '../services/histrixApi.js';

export default {
  name: 'FormLoginNotStyles',
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
      type: String
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
    },

    /**
     * @description Direccion de redireccionamiento despues de login pasado por el padre
     * @type {String} - Url
     * @default ''
     * @example
     * redirectParent="/"
     */
    redirectParent: {
      required: false,
      default: '',
      type: String
    },

    /**
     * @description Evento que se ejecuta despues de loguearse
     * @type {String} - Evento
     * @default null
     * @example
     * eventAfter="eventAfterLogin"
     */
    eventAfter: {
      required: false,
      default: null,
      type: String
    }
  },
  setup() {
    return { v$: useVuelidate() };
  },
  watch: {
    /**
     * @description Si se cambia la base de datos, se guarda en el localStorage, se cambia la configuracion y se cambia la imagen
     * @param {String} newVal - Valor nuevo de la base de datos
     * @returns {void}
     */
    db(newVal) {
      if (!newVal) return;
      config.db = newVal;
      localStorage.setItem('database', newVal);
      this.img = this.infoDB.find((val) => val.value === newVal).img;
    },
    /**
     * @description Si se cambia el evento, se gurda en la copia del evento.
     * @param {String} newVal - Valor nuevo del evento
     * @returns {void}
     */
    eventAfter: {
      handler(newVal) {
        if (!newVal) return;
        this.copyEvent = newVal;
      },
      Immutable: true
    }
  },
  data() {
    return {
      /**
       * @description Formulario de login
       * @type {Object}
       * @default {email: null, password: null}
       */
      form: {
        email: null,
        password: null
      },
      /**
       * @description Si esta cargando el boton de login
       * @type {Boolean}
       * @default false
       */
      btnLoading: false,
      /**
       * @description Lista de bases de datos que se pueden seleccionar para loguearse
       * @type {Array}
       * @default []
       */
      infoDB: [],
      /**
       * @description Si esta mostrando la contraseña
       * @type {Boolean}
       * @default false
       */
      IsPasswordView: true,
      /**
       * @description Copia del evento que se ejecuta despues de loguearse
       * @type {String}
       * @default ''
       */
      copyEvent: '',
      /**
       * @description Base de datos seleccionada
       * @type {String}
       * @default ''
       */
      db: '',
      /**
       * @description Imagen de la base de datos seleccionada
       * @type {String}
       * @default ''
       */
      img: ''
    };
  },
  mounted() {
    this.form.email = this.login;
    if (this.isSelectDataBase) {
      histrixApi.apiDBQuery().then((response) => {
        this.infoDB = response;
        if (config.db) {
          this.db = this.infoDB.find((val) => val.value === config.db).value;
        }
      });
    }
  },
  validations() {
    return {
      form: {
        email: { required },
        password: { required }
      }
    };
  },
  computed: {
    /**
     * @description Redirecciona a la url que se le pase por el padre, por la url o por la url por defecto que se le pase al componente
     * @returns {Object} - Url {path: '/'}
     */
    redirect() {
      if (this.redirectParent && this.redirectParent !== '') return this.redirectParent;
      if (this.redirectParent === false) return null;
      if (this.nextUrl === false) return null;
      return this.$route.params.nextUrl
        ? { path: `${this.$route.params.nextUrl}` }
        : { path: this.nextUrl, query: { t: new Date().getTime() } };
    },
    /**
     * @description Imagen de la base de datos seleccionada
     * @returns {String} - Url de la imagen
     */
    imglogo() {
      return `${config.fixApi}${this.img}`;
    }
  },
  methods: {
    /**
     * @description Lleva acabo el login del usuario
     * @returns {void}
     * @example
     * this.submitLogin();
     */
    submitLogin() {
      const formData = this.formatDataPostLogin();
      this.btnLoading = true;
      histrixApi
        .login(formData.email, formData.password, this.redirect)
        .then((_success) => {
          this.$events.fire('loaded-user');
          this.$events.fire('login-ok');
          this.runEventAfter();
        })
        .catch((_error) => {
          this.$q.notify({
            message: 'email o contraseña incorrectos ',
            type: 'negative',
            timeout: 4000,
            position: 'top',
            actions: [{ icon: 'close', color: 'white' }]
          });
        })
        .finally(() => {
          this.btnLoading = false;
          this.form.password = null;
        });
    },
    /**
     * @description Formatea los datos que se le pasan al login
     * @returns {Object} - Datos del login
     * @example
     * const formData = this.formatDataPostLogin();
     */
    formatDataPostLogin() {
      let formData = {
        email: this.form.email,
        password: this.form.password
      };
      if (this.formLoginAlter.email && this.formLoginAlter.password) {
        formData = {
          email: this.formLoginAlter.email,
          password: this.formLoginAlter.password
        };
      }
      return formData;
    },
    /**
     * @description Ejecuta el evento que se le pase por el padre
     * @returns {void}
     * @example
     * this.runEventAfter();
     */
    runEventAfter() {
      if (this.copyEvent) this.$events.fire(this.copyEvent);
      this.copyEvent = '';
    }
  }
};
</script>

<style scoped>
.img{
  margin-left:auto;
  margin-right:auto;
  max-width: 300px;
  display: block;
  max-height: 300px;
}
</style>
