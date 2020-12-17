
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
    return localStorage.getItem('database') || process.env.DB;
  },
  async info() {
    return this.getData('/api/info/');
  },
  async getDatabaseInfo(db) {
    return this.getData(`/api/db/${db}`);
  },
  host () {
    return localStorage.getItem('host') || process.env.MAIN_URL
  },
  apiUrl() {
    if (this.currentDb()) {
      return `${this.host()}/api/db/${this.currentDb()}`;
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
      .get(`${this.apiUrl()}/me`)
      /*      
      .then((resp) => {
        console.log(resp.data)
        scope.$events.fire('got-user');
        //localStorage.setItem('user', JSON.stringify(resp.data.data[0]));
        localStorage.setItem('user', JSON.stringify(resp.data));
        return resp.data;
      })
      .catch(e =>
        // console.log('error')
        null);
        */
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
  async login(username, password, redirect) {
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
      // redirect: '/auth',
      redirect: redirect,
      fetchUser: false,
    }).then((success) => {
      return this.getUser()
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
    return this.getBasicDataUser(this)
          .then((resp) => {
            const userObject = resp.data;              
            // this.$events.fire('got-user');
            localStorage.setItem('user', JSON.stringify(resp.data));

            Vue.auth.user(userObject);
            // this.$q.localStorage.set('user', JSON.stringify(userObject))
            // Vue.events.fire('loaded-user');
            if (userObject.verified == null) {
              /*  'Usuario no Verificado, por favor revise su casilla de correo y confirme su registro.',
              */
              return '/auth/verify';
            }
            return true;
    })
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
  async getAppSchema(path, params) {
    return Vue.prototype.$axios
      .options(`${this.apiUrl()}/app/${path}`, { params});
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
  upload(files) {
    files.map(file => {
      let formData = new FormData();
      formData.append('file', file.data);      
      Vue.prototype.$axios({
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data'
        },        
        url: `${this.apiUrl()}/files/${file.path}`,
        data: formData,
      });
    })
//    return 

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
  queryStringToObject(query) {
    const urlParams =  new URLSearchParams(query);

    const obj = {}
    urlParams.forEach(function(value, key) {
      var newkey = key.replace('[]','');
      obj[newkey] = urlParams.getAll(key);
    });
    return obj;
  },
  getFiles(path) {
    const url = `${this.apiUrl()}/dir/${path}`;
    return Vue.prototype.$axios
      .get(url, {})
  },
  async deleteFile(path) {
    return Vue.prototype.$axios({
      method: 'DELETE',
      url: `${this.apiUrl()}/files/${path}`
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
        Notify.create({
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
