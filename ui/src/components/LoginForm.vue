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
                                color="primary" size="md" label="Ingresar"
                                  >
                          </q-btn>
                          <q-btn v-if="!login" sixe="sm" flat class="q-ma-md bg-accent" color="white" align="left"
                              :to="{ name: 'register', query: { t: new Date().getTime() }}">
                              <span class="q-ml-xs">Registrarme</span>
                          </q-btn>

                          <q-btn sixe="sm" flat class="q-ma-md" color="primary" align="left"
                            v-close-popup
                              :to="{ name: 'mail-reset-password' }">
                              <span class="q-ml-xs">Recuperar contraseña</span>
                          </q-btn>
                        </div>
                  </div>                  
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
  props: ['nextUrl', 'login'],
  name: 'LoginForm',
  components: {

  },
  mixins: [],
  data() {
    return {
      form: {
        email: null,
        password: null,
      },
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
