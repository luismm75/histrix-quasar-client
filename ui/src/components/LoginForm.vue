<template>
        <q-card>
            <q-separator />
            <q-card-section>
                <q-form @submit.prevent="submitLogin">
                  <div class="row">
                      <div class="col-xs-12 q-mb-sm">
                          <q-input
                          inverted-light
                          :label="'Ingrese su correo electrónico'" id="email" autofocus
                          required
                          type="text" v-model="form.email" name="email" class="full-width"
                          :before="[
                              {
                              icon: 'person',
                              }
                          ]"
                        
                          >
                          <template v-slot:prepend>
                            <q-icon name="email" />
                          </template>
                      </q-input>
                      </div>
                      <div class="col-xs-12 q-mb-sm">
                          <q-input :label="'Ingrese contraseña'" id="password"
                             inverted-light
                             :type="isPwd ? 'password' : 'text'"
                              v-model="form.password"
                              name="password" class="full-width"
                              :before="[{ icon: 'lock' }]"
                        
                        >
                          <template v-slot:prepend>
                            <q-icon name="vpn_key" />
                          </template>
                          <template v-slot:append>
                            <q-icon
                              :name="isPwd ? 'visibility_off' : 'visibility'"
                              class="cursor-pointer"
                              @click="isPwd = !isPwd"
                            />
                          </template>
                        </q-input>
                      </div>
                      <br>
                        <div class="col-xs-12 q-mb-sm text-center">
                          <q-btn icon="chevron_right" class="q-pl-md q-pr-md q-pt-sm q-pb-sm full-width"
                                :disable="btnLoading" type="submit"
                                :loading="btnLoading"
                                color="positive" size="md" label="Ingresar"
                                  >
                          </q-btn>
                          <div class="row text-center"> 
                            <q-btn v-if="!login" size="sm"  flat class="col q-ma-md bg-accent" color="white" 
                                :to="{ name: 'register', query: { t: new Date().getTime() }}">
                                <span class="q-ml-xs">Registrarme</span>
                            </q-btn>

                            <q-btn size="sm" flat class="q-ma-md col" color="primary" 
                              v-close-popup
                                :to="{ name: 'mail-reset-password' }" >
                                <span class="q-ml-xs">Recuperar contraseña</span>
                            </q-btn>

                            <q-btn v-if="settings"
                              icon="settings"
                              @click="config = true"
                              class="col-1"
                              color="primary"
                              flat
                            />
                          </div>

                        </div>
                  </div>                  

                  <q-dialog  v-model="config">
                    <q-card style="width: 700px; max-width: 80vw;">
                      <HistrixConnectionSettings v-on:change-database="$emit('change-database')" />
                    </q-card>
                  </q-dialog>


                </q-form>
            </q-card-section>
        </q-card>
</template>

<script>

import Vue from 'vue';
import vuelidate from 'vuelidate'
import { required, email } from 'vuelidate/lib/validators'

// import validate from '../mixins/validate.js'
import histrixApi from '../services/histrixApi.js'

export default {
  props: ['nextUrl', 'login', 'settings'],
  name: 'LoginForm',
  components: {
    HistrixConnectionSettings:() => import('./widgets/HistrixConnectionSettings.vue'),
  },
  mixins: [],
  data() {
    return {
      form: {
        email: null,
        password: null,
      },
      config: false,
      btnLoading: false,
      showRecaptcha: false,
      processEnv: process.env,
      loading: false,
      redir: '',
      // redirect: (this.$route.params.nextUrl) ? `#${this.$route.params.nextUrl}` : null,
      isPwd: true,
    };
  },
  mounted() {

    this.form.email = this.login;
  },
  validations: {
    form: {
      email: { required },
      password: { required },
    },
  },
  computed: {
    redirect() {
      if (this.redir !== '') {
        return this.redir;
      }
      return (this.$route.params.nextUrl) ? { path: `${this.$route.params.nextUrl}` } : { path: this.nextUrl, query: { t: new Date().getTime() } };
    },
  },
  methods: {
    submitLogin() {
      /*
      if (!this.validateForm()) {
        return;
      }
      */
      if (this.showRecaptcha && !this.recaptcha()) {
        return;
      }
      
      this.btnLoading = true;

      histrixApi.login(this.form.email, this.form.password, this.redirect)
      .then((success) => {
        this.$events.fire('loaded-user');
        this.$router.push(success)
        this.btnLoading = false;
      }).catch((error) => {
        this.btnLoading = false;
        this.$q.notify({
            message: 'email o contraseña incorrectos ',
            type: 'negative',
            timeout: 40000,
            position: 'top',
        })

      })
      this.form.password = null;
  
    },
  },
  events: {
    /*
    'get-user': function () {
      this.getUser(true);
    },
    */
    'login-modal': function (redirect) {
      this.redirect = redirect;
    },
  },
};
</script>

<style scoped>
</style>
