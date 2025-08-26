import { Notify } from 'quasar';
import config from './config';
import { axiosInstance } from '@mundoit-lib/plugin-vue-axios';
import { useAuth } from '@mundoit-lib/plugin-vue-auth';

export default function useApi() {
  /**
   * Histrix Methods
   */
  const auth = useAuth();
  const axios = axiosInstance;

  // Helper functions que antes usaban 'this'
  const currentDb = () => {
    return localStorage.getItem('database') || config.db;
  };

  const host = () => {
    //TODO: Change fixApi to config.apiUrl in production
    return localStorage.getItem('host') || config.fixApi;
  };

  const apiUrl = () => {
    if (currentDb()) {
      return `${host()}/api/db/${currentDb()}`;
    }
    return config.apiUrl;
  };

  const getData = async (url) => {
    return axios.get(url);
  };

  const getBasicDataUser = (_scope) => {
    return axios.get(`${apiUrl()}/me`);
  };

  // Definir getUser como función helper antes del return
  const getUser = async (_verify = false) => {
    return getBasicDataUser().then((resp) => {
      const userObject = resp.data;
      localStorage.setItem('user', JSON.stringify(resp.data));
      auth.user(userObject);
      if (userObject.verified == null) {
        return '/auth/verify';
      }
      return true;
    });
  };

  return {
    getHostDb(host) {
      const url = `${host}/api/db/`;
      return axios.get(url);
    },

    currentDb,

    async info() {
      const hostUrl = host();
      return getData(`${hostUrl}/api/info/`);
    },

    async getDatabaseInfo(db) {
      const hostUrl = host();
      return getData(`${hostUrl}/api/db/${db}`);
    },

    host,
    apiUrl,

    /**
     * User Methods
     */
    changePassword(data) {
      return axios.post(`${apiUrl()}/change-password/`, data);
    },

    reSendConfirmationMail(data) {
      return axios.post(`${apiUrl()}/resend-confirmation/`, data);
    },

    confirmRegistration(data) {
      return axios.post(`${apiUrl()}/confirm-registration/`, data);
    },

    register(form) {
      return axios.post(`${apiUrl()}/registration/`, form);
    },

    updateUser(form, userId) {
      return axios
        .put(`${apiUrl()}/app/users/current_user_form.xml`, {
          data: {
            Nombre: form.Nombre,
            name: form.Nombre,
            apellido: form.apellido,
            lastName: form.apellido,
            email: form.email,
            telefono: form.telefono,
            keys: {
              Id_usuario: userId
            }
          },
          keys: {
            Id_usuario: userId
          }
        })
        .then((response) => {
          if (response.id !== null || response.id !== undefined) {
            return {
              error: false,
              html: false,
              msg: 'Usuario actualizado exitosamente',
              detail: ''
            };
          }
          return {
            error: true,
            html: false,
            msg: 'Error actualizando usuario'
          };
        });
    },

    getBasicDataUser,

    /**
     * Login
     * @param {string} username
     * @param {string} password
     */
    async login(username, password, redirect) {
      const token = null;
      return auth
        .login({
          url: `${apiUrl()}/token`,
          data: {
            username,
            password,
            grant_type: 'password',
            client_id: config.clientId,
            client_secret: config.clientSecret,
            notification_token: token
          },
          method: 'POST',
          rememberMe: true,
          staySignedIn: true,
          headers: {
            Accept: 'application/json, text/plain',
            'Content-Type': 'application/json'
          },
          redirect: redirect ? redirect : '',
          fetchUser: false
        })
        .then((_success) => {
          return getUser();
        });
    },

    getData,

    /**
     * System Methods
     */
    /**
     * Get Menu
     * @param {string} level
     */
    async getMenu(level) {
      const url = `${apiUrl()}/menu/${level}`;
      return getData(url);
    },

    async getUserNotifications() {
      const url = `${apiUrl()}/user/notifications/`;
      return getData(url);
    },

    async getUsers() {
      const url = `${apiUrl()}/users/`;
      return getData(url);
    },

    async getUserInfo() {
      const url = `${apiUrl()}/me/`;
      return getData(url);
    },

    getUser,

    async getValidToken(id) {
      return axios
        .get(`${apiUrl()}/app/users/valid_token.xml?login=${id}`, {
          params: {
            token: 'magic_token',
            redirect: false
          }
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
     */
    /**
     * getSchema
     * @param {string} path App Xml Path
     */
    async getAppSchema(path, params) {
      return axios.get(`${apiUrl()}/schema/${path}`, { params });
    },

    async getAppData(path, params) {
      return axios({
        method: 'GET',
        url: `${apiUrl()}/app/${path}`,
        params
      });
    },

    async getAppPdf(path, params) {
      return axios.get(`${apiUrl()}/pdf/${path}`, { params, responseType: 'arraybuffer' });
    },

    upload(files) {
      files
        .filter((file) => file.data.name)
        .map((file) => {
          const formData = new FormData();
          formData.append('file', file.data);
          axios({
            method: 'POST',
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            url: `${apiUrl()}/files/${file.path}`,
            data: formData
          });
        });
    },

    async insertAppData(path, data) {
      return axios({
        method: 'POST',
        url: `${apiUrl()}/app/${path}`,
        data
      });
    },

    async updateAppData(path, data) {
      return axios({
        method: 'PUT',
        url: `${apiUrl()}/app/${path}`,
        data
      });
    },

    async processAppForm(path, data) {
      return axios({
        method: 'PATCH',
        url: `${apiUrl()}/app/${path}`,
        data: { data }
      });
    },

    async processApp(path, data) {
      return axios({
        method: 'PATCH',
        url: `${apiUrl()}/app/${path}`,
        data: {
          jsonData: data
        }
      });
    },

    async deleteAppData(path, keys) {
      return axios({
        method: 'DELETE',
        url: `${apiUrl()}/app/${path}`,
        data: {
          keys
        }
      });
    },

    queryStringToObject(query) {
      const params = new URLSearchParams(query);
      const result = {};
      for (const [key, value] of params.entries()) {
        const cleanKey = key.replace(/\[\]$/, '');
        if (result[cleanKey]) {
          result[cleanKey].push(value);
        } else {
          result[cleanKey] = [value];
        }
      }
      return result;
    },

    getFiles(path) {
      const url = `${apiUrl()}/dir/${path}`;
      return axios.get(url, {});
    },

    async deleteFile(path) {
      return axios({
        method: 'DELETE',
        url: `${apiUrl()}/files/${path}`
      });
    },

    // Favorites
    async getFavoritesOption() {
      const url = `${apiUrl()}/app/favorito_qry`;
      try {
        const response = await getData(url);
        return JSON.parse(response.data.data[0].option_value);
      } catch (_error) {
        return [];
      }
    },

    async getFavorites() {
      const url = `${apiUrl()}/app/favorito_qry`;
      try {
        const response = await getData(url);
        return { id: response.data.data[0].id_option, keys: JSON.parse(response.data.data[0].option_value) };
      } catch (_error) {
        return { id: null, keys: [] };
      }
    },

    async setFavorit(menuId, uri, name, idOption) {
      if (!idOption) {
        return axios({
          method: 'POST',
          url: `${apiUrl()}/app/favorito`,
          data: {
            option_value: JSON.stringify([{ menuId, uri, name }])
          }
        });
      }

      // Crear una referencia a getFavoritesOption para poder usarla aquí
      const getFavoritesOption = async () => {
        const url = `${apiUrl()}/app/favorito_qry`;
        try {
          const response = await getData(url);
          return JSON.parse(response.data.data[0].option_value);
        } catch (_error) {
          return [];
        }
      };

      const options = await getFavoritesOption();
      options.push({ menuId, uri, name });
      console.log(options);
      return axios({
        method: 'PUT',
        url: `${apiUrl()}/app/favorito`,
        data: {
          data: {
            option_value: JSON.stringify(options)
          },
          keys: {
            id_option: idOption
          }
        }
      });
    },

    async removeFavorit(idOption, menuId) {
      // Crear una referencia a getFavoritesOption para poder usarla aquí
      const getFavoritesOption = async () => {
        const url = `${apiUrl()}/app/favorito_qry`;
        try {
          const response = await getData(url);
          return JSON.parse(response.data.data[0].option_value);
        } catch (_error) {
          return [];
        }
      };

      const options = await getFavoritesOption();
      const index = options.findIndex((item) => item.menuId === menuId);
      if (index > -1) {
        options.splice(index, 1);
      }
      return axios({
        method: 'PUT',
        url: `${apiUrl()}/app/favorito`,
        data: {
          data: {
            option_value: JSON.stringify(options)
          },
          keys: {
            id_option: idOption
          }
        }
      });
    },

    downloadAppData(path, query, fileFormat, fileName) {
      const url = `${apiUrl()}/export/${fileFormat}/${path}`;
      axios
        .get(url, {
          params: query,
          responseType: 'blob'
        })
        .then((response) => {
          const fileURL = window.URL.createObjectURL(new Blob([response.data]));
          const fileLink = document.createElement('a');
          fileLink.href = fileURL;
          fileLink.setAttribute('download', fileName);
          document.body.appendChild(fileLink);
          fileLink.click();
        })
        .catch((_err) => {
          Notify.create({
            message: 'Error downloading File',
            type: 'negative',
            textColor: 'white',
            color: 'negative',
            icon: 'error',
            closeBtn: 'close',
            position: 'top'
          });
        });
    },

    async apiDBQuery() {
      const { data } = await axios.get(config.mainUrl);
      const infoDB = [];
      for (const db in data) {
        const aux = data[db];
        if (aux.hidden !== 'true') {
          aux.name = aux.name ? aux.name : db;
          infoDB.push({
            value: aux.id,
            label: aux.description,
            img: aux.logo
          });
        }
      }
      return infoDB;
    }
  };
}
