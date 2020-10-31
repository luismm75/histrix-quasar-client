
import Vue from 'vue';
import { Notify } from 'quasar';

export default {
  /**
   * Histrix Methods
   */
  getHostDb(host) {
    const url = `${host}/api/db/`;
    return Vue.prototype.$axios.get(url);
  },
  currentDb() {
    return localStorage.getItem('database');
  },
  async info() {
    return this.getData('/api/info/');
  },
  async getDatabaseInfo(db) {
    return this.getData(`/api/db/${db}`);
  },
  host () {
    return localStorage.getItem('host') || process.env.API_URL
  },
  apiUrl() {
    if (this.currentDb()) {
      return `${this.host()}api/db/${this.currentDb()}`;
    } else {
      return process.env.API_URL;
    }
  },

  /**
   * User Methods
   */
  changePassword(data) {
    return Vue.prototype.$axios
      .post(
        `${this.apiUrl()}/change-password/`,
        data,
      );
  },
  reSendConfirmationMail(data) {
    return Vue.prototype.$axios
      .post(
        `${this.apiUrl()}/resend-confirmation/`,
        data,
      );
  },
  confirmRegistration(data) {
    return Vue.prototype.$axios
      .post(
        `${this.apiUrl()}/confirm-registration/`,
        data,
      );
  },
  register(form) {
    return Vue.prototype.$axios
      .post(
        `${this.apiUrl()}/registration/`,
        form,
      );
    /*
      .then(response => {
        if (response.id !== null || response.id !== undefined) {
          return {
            error: false,
            html: false,
            msg: 'Usuario registrado exitosamente',
            detail: ''
            // 'Recibirá un mail de confirmación y deberá esperar aprobación por parte del consignatario'
          };
        } else {
          return {
            error: true,
            html: false,
            msg: response
          };
        }
      })
      .catch(e => {
        const error = e.response.data.split('</br>');
        return {
          error: true,
          html: true,
          msg: error[0],
          detail: error[1]
        };
      });
      */
  },

  //

  updateUser(form, userId) {
    return Vue.prototype.$axios
      .put(`${this.apiUrl()}/app/users/current_user_form.xml`, {
        data: {
          Nombre: form.Nombre,
          name: form.Nombre,
          apellido: form.apellido,
          lastName: form.apellido,
          email: form.email,
          telefono: form.telefono,
          keys: {
            Id_usuario: userId,
          },
        },
        keys: {
          Id_usuario: userId,
        },
      })
      .then((response) => {
        if (response.id !== null || response.id !== undefined) {
          return {
            error: false,
            html: false,
            msg: 'Usuario actualizado exitosamente',
            detail: '',
          };
        }
        return {
          error: true,
          html: false,
          msg: 'Error actualizando usuario',
        };
      });
  },

  getBasicDataUser(scope) {
    return Vue.prototype.$axios
      .get(`${this.apiUrl()}/app/users/current_user_form.xml`)
      .then((resp) => {
        if (!resp.data || resp.data.errors) {
          return null;
        }
        scope.$events.fire('got-user');
        localStorage.setItem('user', JSON.stringify(resp.data.data[0]));
        return resp.data.data[0];
      })
      .catch(e =>
        // console.log('error')
        null);
  },
  /*
  getCuitData(cuit) {
    return Vue.prototype.$axios
      .get(`${this.apiUrl()}/app/cuit/cuit.xml`, {
        params: {
          cuit: cuit,
          token: 'magic_token',
          redirect: false
        }
      })
      .then(({ data }) => {
        if (!data || data.errors) {
          return null;
        }
        // console.log(data);
        return data
      }).catch(e => {
        return null;
      });
    },
    */
  /**
     * Login
     * @param {string} username
     * @param {string} password
     */
  login(username, password) {
    const token = null;
    return Vue.auth.login({
      url: `${this.apiUrl()}/token`,
      data: {
        username,
        password,
        grant_type: 'password',
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        notification_token: token,
      },
      method: 'POST',
      rememberMe: true,
      staySignedIn: true,
      headers: {
        Accept: 'application/json, text/plain',
        'Content-Type': 'application/json',
      },
      redirect: '/auth',
      fetchUser: false,
    }).then((success) => {
      this.getUser().then((ok) => {
        // this.$router.push(this.redirect);
        // Vue.emit('close');
      }).catch((error) => {
        throw error;
      });
    });
  },
  async getData(url) {
    return Vue.prototype.$axios
      .get(url)
      .then(response => response)
      .catch((error) => {
        console.log(error);
      });
  },
  /**
   * System Methods
   * */

  /**
   * Get Menu
   * @param {string} level
   */
  async getMenu(level) {
    const url = `${this.apiUrl()}/menu/${level}`;
    return this.getData(url);
  },
  async getUserNotifications() {
    const url = `${this.apiUrl()}/user/notifications/`;
    return this.getData(url);
  },
  async getUsers() {
    const url = `${this.apiUrl()}/users/`;
    return this.getData(url);
  },
  async getUserInfo() {
    const url = `${this.apiUrl()}/me/`;
    return this.getData(url);
  },

  async getUser(verify = false) {
    try {
      if (Vue.auth.check()) {
        const userObject = await api.getBasicDataUser(this);

        this.$auth.user(userObject);
        this.user = userObject;
        //                this.$q.localStorage.set('user', JSON.stringify(userObject))
        this.$events.fire('loaded-user');
        this.showLoginModal = false;

        if (userObject.verified == null) {
          this.$q.notify({
            message: 'Usuario no Verificado, por favor revise su casilla de correo y confirme su registro.',
            type: 'negative',
            timeout: 50000,
            position: 'top',
          });
          this.redir = 'auth/verify';

          return;
        }
      }
    } catch (e) {
      console.log(e);
    }
  },
  async getValidToken(id) {
    return Vue.prototype.$axios
      .get(`${this.apiUrl()}/app/users/valid_token.xml?login=${id}`, {
        params: {
          token: 'magic_token',
          redirect: false,
        },
      })
      .then((resp) => {
        if (!resp.data || resp.data.errors) {
          return null;
        }
        return resp.data.data[0];
      })
      .catch((e) => {
        console.log(e);
        return null;
      });
  },
  /**
   * Application related methods
   * */
  /**
   * getSchema
   * @param {string} path App Xml Path
   */
  async getAppSchema(path, query) {
    return Vue.prototype.$axios
      .options(`${this.apiUrl()}/app/${path}`, { params: query });
  },
  async getAppData(path, params) {
    return Vue.prototype.$axios({
      method: 'GET',
      url: `${this.apiUrl()}/app/${path}`,
      params,
    });
  },
  async getAppPdf(path, params) {
    return Vue.prototype.$axios
      .get(`${this.apiUrl()}/pdf/${path}`, { params, responseType: 'arraybuffer' });
  },
  async insertAppData(path, data) {
    return Vue.prototype.$axios({
      method: 'POST',
      url: `${this.apiUrl()}/app/${path}`,
      data,
    });
  },
  async updateAppData(path, data) {
    return Vue.prototype.$axios({
      method: 'PUT',
      url: `${this.apiUrl()}/app/${path}`,
      data,
    });
  },
  async processAppForm(path, data) {
    return Vue.prototype.$axios({
      method: 'PATCH',
      url: `${this.apiUrl()}/app/${path}`,
      data: { data },
    });
  },
  async processApp(path, data) {
    return Vue.prototype.$axios({
      method: 'PATCH',
      url: `${this.apiUrl()}/app/${path}`,
      data: {
        jsonData: data,
      },
    });
  },
  async deleteAppData(path, keys) {
    return Vue.prototype.$axios({
      method: 'DELETE',
      url: `${this.apiUrl()}/app/${path}`,
      data: {
        keys,
      },
    });
  },
  downloadAppData(path, query, fileFormat, fileName) {
    const url = `${this.apiUrl()}/export/${fileFormat}/${path}`;
    Vue.prototype.$axios
      .get(url, {
        params: query,
        responseType: 'blob',
      })
      .then((response) => {
        const fileURL = window.URL.createObjectURL(new Blob([response.data]));
        const fileLink = document.createElement('a');
        fileLink.href = fileURL;
        fileLink.setAttribute('download', fileName);
        document.body.appendChild(fileLink);
        fileLink.click();
      })
      .catch((err) => {
        this.$q.notify({
          message: 'Error downloading File',
          type: 'negative',
          textColor: 'white',
          color: 'negative',
          icon: 'error',
          closeBtn: 'close',
          position: 'top',
        });
      });
  },
};
