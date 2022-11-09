<template>
        <q-card style="width: 700px; max-width: 80vw;">
            <q-card-section class="bg-primary text-white">
                <h2 class="text-h6 q-ma-xs">Modificar Contraseña</h2>
            </q-card-section>
            <q-card-section>
  <q-form _v-if="!okPassword" @submit.prevent="submit" >
    <q-list _class="row">
        <q-item  class="col-12   q-pa-sm">
            <q-item-section>
                <q-input label="Contraseña Actual" id="password"
                    filled
                    required
                    type="password"
                    v-model="form.old_password"
                    name="password" 
                    :before="[{ icon: 'lock' }]"
                    :error="$v.form.old_password.$error"
                    />
            </q-item-section>
        </q-item>

        <q-item  class="col-12   q-pa-sm">
            <q-item-section>

                          <InputPasswordVue :labelShow="'wer'" v-model="form.new_password"
                                    placeholder="Ingrese su nueva contraseña"
                                    :toggle="true"
                                    required
                                    @score="showScore"
                                    class="full-width"
                                  :error-label="passwordErrorMsg"
                                    >
                          </InputPasswordVue>
            </q-item-section>
        </q-item>
        <q-item  class="col-12   q-pa-sm">
        <q-item-section>

                     <InputPasswordVue :labelShow="'wer'" v-model="form.confirm_password"
                                    placeholder="Repita su nueva contraseña"
                                    :toggle="true"
                                    required
                                    @score="showScore"
                                    class="full-width"
                                  :error-label="passwordErrorMsg"
                                    >
                          </InputPasswordVue>
            </q-item-section>
        </q-item>
        
                <br>
        <div class="col-xs-12 q-mb-sm text-center">
            <q-btn icon="chevron_right" class="q-pl-md q-pr-md q-pt-sm q-pb-sm full-width"
                :disable="btnLoading" type="submit"
                :loading="btnLoading"
                color="primary" size="md" label="Modificar"
                    >
            </q-btn>

        </div>

    </q-list>
  </q-form>
            </q-card-section>
        </q-card>
</template>
<script>
// import Vue from 'vue'
import { required, email, minLength, sameAs, requiredIf } from 'vuelidate/lib/validators';
import InputPasswordVue from './InputPassword.vue';
import api from '../services/histrixApi.js';
import config from '../services/config.js';

export default {
  name: 'HistrixPasswordChange',
  components: {
    InputPasswordVue
  },
  props: {
    
    closable: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    user: '',
    btnLoading: false,
    form: {
      user_id: null,
      old_password: null,
      new_password: null,
      confirm_password: null,
      db: config.db,
    },
    loading: true,
  }),
  validations: {
    form: {
      old_password: { required },
      new_password: { required, minLength: minLength(6) },
      confirm_password: { required, sameAsPassword: sameAs('new_password') },
    },
  },
  computed: {
      passwordErrorMsg() {
        if (this.form.old_password === '') {
          return ''
        }
        // if (!this.warning && this.warning.suggestions.length) {
          return 'Ingrese contraseña correcta'
        // }

        // let msg = this.warning.suggestions[0]
        // switch (msg) {
        //   case 'Add another word or two. Uncommon words are better.': 
        //   msg = 'Agregue otra palabra. Preferiblemente palabras no comunes.'
        //   break
        //   default:
        //   msg = 'Ingrese contraseña correcta'
        //   break
        // }
        // return msg
      },
      passwordError() {
        return this.$v.form.old_password.$error
      },    
  },
  mounted() {
    this.user = JSON.parse(localStorage.getItem('user'));
    this.form.user_id = this.user.user_id      
  },
  methods: {
    showScore(score) {
      console.log('💯', score)
    },
    validateForm() {
      return (this.form.new_password == this.form.confirm_password) 
    },
    submit() {
        if (!this.validateForm()) {
          return
        }
        this.btnLoading = true;
        const redirect = this.$auth.redirect();
        

        api.changePassword(this.form).then(resp => {
          this.response = resp.data.responseText
          this.form.old_password = null
          this.form.new_password = null
          this.form.confirm_password = null
          this.okPassword = resp.data.responseText
          this.$q.notify({
            message: resp.data.responseText,
            type: 'positive',
            timeout: 8000,
            position: 'top'
          });
          this.$emit('close')
        }).catch(error => {
          // console.log(error.response)
          const resp = error.response.data.responseText || 'Ha ocurrido un error reseteando contraseña'
          this.$q.notify({
          // message: `${error.response.data.responseText}`,
          message: resp,
          type: 'negative',
          timeout: 8000,
          position: 'top'
        });          
          this.btnLoading = false;
        })
    }
  },
};
</script>
<style scoped>
.Password {
    max-width: 100%;
  }

</style>
