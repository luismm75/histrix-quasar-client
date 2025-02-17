<template>
  <div>
    <!--
    <picture-input v-if="histrixType === 'q-file'"
      ref="pictureInput"
      width="300"
      height="300"
      margin="16"
      accept="image/jpeg,image/png"
      size="10"
      buttonClass="button-shadow  rounded-borders	 bg-primary text-white"
       :removable="true"
      :custom-strings="{

      change: 'Cambiar Imagen',
      remove: 'Quitar Imagen',
      upload: 'Su dispositivo no soporta subir imágenes',
        drag: 'Arrastre imagen aqui'
      }"
      @change="onImageChange">
    </picture-input>
    -->
    <div v-if="isRadio">
      <div class="header-check">
        <b>{{ rowSchema.label }}</b>
      </div>
    </div>
    <div v-if="fieldComponent === 'HistrixApp'">
      <slot name="slot-top-field-histrixapp" :props="localValue" />
    </div>
    <div class="content-field">
      <component
        v-bind:is="fieldComponent"
        v-model="localValue"
        v-bind="$attrs"
        style="flex: 1;"
        v-on:computed-total="onComputedTotal"
        @v-on:keyup.113="showHelper()"
        @filter="filterFn"
        bottom-slots
        :name="fieldSchema.name"
        use-input
        :type="inputType"
        :path="helperPath"
        :headers="headers"
        :url="uploadUrl"
        :query="query"
        :options="options"
        emit-value
        map-options
        debounce="500"
        hide-bottom-space
        :rules="rules"
        :label="label"
        :inner="true"
        :mask="fieldMask"
        :reverse-fill-mask="isDecimal"
        :fill-mask="fillMask"
        :isFormulation="true"
        :filled="!isDisabled"
        :toolbar="toolbar"
        :disabled="isDisabled"
        :disable="isDisabled"
        :readonly="isDisabled"
        :counter="isMultiple"
        :fonts="{
          arial: 'Arial',
          arial_black: 'Arial Black',
          comic_sans: 'Comic Sans MS',
          courier_new: 'Courier New',
          impact: 'Impact',
          lucida_grande: 'Lucida Grande',
          times_new_roman: 'Times New Roman',
          verdana: 'Verdana',
        }"
        :size="size"
        :use-chips="isMultiple"
        :multiple="isMultiple"
        :autogrow="isTextarea"
        :style="style"
        :input-class="inputClass"
        :clearable="clearable"
        inline
        :borderless="isDisabled"
        :autocomplete="autoComplet"
      >
        <span
          v-if="histrixType === 'check'"
          v-html="hint"
          class="text-blue text-bold text-caption q-ml-md"
        ></span>
        <template v-slot:hint>
          <div v-html="hint" :title="hint" class="text-blue text-bold"></div>
        </template>

        <template v-slot:before v-if="histrixType === 'q-file'">
          <!--<q-btn   icon="folder"  @click="fileManager = true" />

          <q-dialog v-model="fileManager">
            <HistrixFileManager :path="path" />
          </q-dialog>
          -->
          <q-avatar size="100px">
            <q-img
              :src="previewUrl"
              v-if="previewUrl"
              @click="showImage = true"
            />
            <q-img
              _v-else-if="value"
              :src="thumb"
              spinner-color="grey"
              @click="showImage = true"
            />
          </q-avatar>
          <q-dialog v-model="showImage">
            <q-card style="width: 700px; max-width: 80vw">
              <q-card-section class="row items-center q-pb-none">
                <q-space />
                <q-btn icon="close" flat round dense v-close-popup />
              </q-card-section>
              <q-card-section>
                <q-img :src="previewUrl" v-if="previewUrl" spinner-color="grey" />
                <q-img :src="thumb" v-else spinner-color="grey"> </q-img>
              </q-card-section>
            </q-card>
          </q-dialog>
        </template>

        <template v-slot:prepend>
          <q-icon v-if="histrixType === 'q-file'" name="attach_file" />
          <span class="q-pa-xs text-caption" v-if="isRadio">
            {{ label }}
          </span>
        </template>

        <!-- in control button -->
        <template v-slot:append>
          <!-- EXTERNAL HELP POPUP -->

          <q-icon
            name="help"
            class="cursor-pointer"
            v-if="fieldSchema.helpContainer"
          >
            <q-popup-proxy
              ref="helperProxy"
              anchor="bottom left"
              self="top right"
              transition-show="scale"
              transition-hide="scale"
            >
              <HistrixApp
                :path="helpPath"
                :query="query"
                :title="'Seleccione ' + label"
                v-on:select-row="selectRow"
                :search="true"
              />
            </q-popup-proxy>
          </q-icon>

          <!-- DATE CONTROL POPUP -->
          <q-icon name="event" class="cursor-pointer" v-if="isDate">
            <q-popup-proxy
              ref="qDateProxy"
              transition-show="scale"
              transition-hide="scale"
            >
              <q-date
                mask="DD/MM/YYYY"
                :locale="dateLocale"
                v-model="localValue"
                @input="() => $refs.qDateProxy.hide()"
              />
            </q-popup-proxy>
          </q-icon>

          <!-- IMAGE FOLDER -->
          <q-icon
            v-if="histrixType === 'q-file'"
            name="close"
            @click.stop="localValue = null"
            class="cursor-pointer"
          />
          <!-- <q-icon name="create_new_folder" @click.stop v-if="histrixType === 'q-file'" /> -->

          <!-- TIME CONTROL POPUP -->
          <q-icon name="access_time" class="cursor-pointer" v-if="isTime">
            <q-popup-proxy
              ref="timeProxy"
              transition-show="scale"
              transition-hide="scale"
            >
              <q-time
                v-model="localValue"
                @input="() => $refs.timeProxy.hide()"
              />
            </q-popup-proxy>
          </q-icon>
          <!--
              <q-icon name="event" class="cursor-pointer" v-if="isDateTime">
              <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                <q-date mask="YYYY-MM-DD HH:mm:ss" :locale="dateLocale" v-model="localValue" @input="() => $refs.qDateProxy.hide()" />

              </q-popup-proxy>
            </q-icon>
              <q-icon name="access_time" class="cursor-pointer" v-if="isDateTime">
              <q-popup-proxy ref="timeProxy" transition-show="scale" transition-hide="scale">
                <q-time mask="YYYY-MM-DD HH:mm:ss" v-model="localValue" @input="() => $refs.timeProxy.hide()" format24h />
              </q-popup-proxy>
            </q-icon>
  -->
          <q-icon name="event" class="cursor-pointer" v-if="isDateTime">
            <q-popup-proxy transition-show="scale" transition-hide="scale">
              <q-date v-model="localValue" mask="YYYY-MM-DD HH:mm:ss">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Cerrar" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>

          <q-icon name="access_time" class="cursor-pointer" v-if="isDateTime">
            <q-popup-proxy transition-show="scale" transition-hide="scale">
              <q-time v-model="localValue" mask="YYYY-MM-DD HH:mm:ss" format24h>
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Cerrar" color="primary" flat />
                </div>
              </q-time>
            </q-popup-proxy>
          </q-icon>
        </template>

        <template v-slot:no-option>
          <q-item>
            <q-item-section class="text-grey"> No resultado </q-item-section>
          </q-item>
        </template>
      </component>
      <div v-if="isViewAddButton">
        <q-btn
          round
          class="q-ml-xs"
          dense
          color="green"
          icon="add"
          @click="openAdd"
        />
      </div>
    </div>

    <q-dialog v-model="openNew" ref="formDialog" full-width @input="showDialog">
        <HistrixApp
          :inner="false"
          :path="dialog.path"
          :query="dialog.query"
          :title="dialog.title"
          @process-finish="fetchData"
          class="bg-white"
          :editedIndex="-1"
        />
    </q-dialog>
  </div>
</template>

<script>
import { date } from 'quasar';

import histrixApi from '../services/histrixApi.js';
// import PictureInput from 'vue-picture-input'

export default {
  name: 'HistrixField',
  inheritAttrs: false,
  props: {
    schema: Object,
    rowSchema: Object,
    query: Object,
    value: null,
    row: null,
    submitting: null,
    path: null
  },
  watch: {
    localValue: {
      handler(newVal, _oldVal) {
        if (this.fieldSchema.helpContainer) {
          this.getFieldHelpData(newVal);
        }
        if (this.fieldSchema.histrix_type === 'File') {
          this.onFileChange(newVal);
        }
      },
      immediate: true,
      deep: true
    },

    schema: {
      handler(_newVal, _oldVal) {
        this.getOptions(true);
      },
      deep: true
    },
    query: {
      handler(newVal, oldVal) {
        if (!this.shallowEqual(newVal, oldVal)) {
          this.getOptions(true);
        }
      },
      deep: true
    },
    options: {
      handler(_newVal, _oldVal) {
        if (this.options.find((o) => o.value === this.localValue)) {
          return;
        }
        if (this.options.length === 1 && this.fieldSchema.innerContainer.empty === false) {
          this.localValue = this.options[0];
          return;
        }
        // @TODO: Verificar porque para rosgan tiene que estar comentado pero para mgp no
        // this.localValue = '';
      },
      deep: true
    }
  },
  components: {
    HistrixApp: () => import('./HistrixApp.vue'),
    HistrixFileManager: () => import('./widgets/HistrixFileManager.vue')
    // PictureInput
  },
  methods: {
    showDialog() {
      this.openNew = false;
    },
    fetchData() {
      this.getOptions(true);
      this.openNew = false;
    },
    openAdd() {
      const dialog = {};
      dialog.path = this.innerContainerUrl;
      dialog.query = { ...this.query };
      dialog.title = `Agregar ${this.label}`;
      this.dialog = dialog;
      this.openNew = true;
    },
    shallowEqual(object1, object2) {
      const keys1 = Object.keys(object1);
      const keys2 = Object.keys(object2);

      if (keys1.length !== keys2.length) {
        return false;
      }

      for (const key of keys1) {
        if (object1[key] !== object2[key]) {
          return false;
        }
      }

      return true;
    },

    /**
     * Filtra las opciones de la peticion, en caso que sea autocomplete, filtrara el input a partir del tercer caracter
     * @returns Prmosise<void>|String
     */
    async filterFn(val, update, _about) {
      if (this.autoComplet === 'true') {
        if (val.length < 3) {
          this.options = [];
          update();
          return;
        }
        await this.searchOptions(val);
        update();
        return;
      }

      update(() => {
        if (!val) {
          this.options = this.optionFixed;
          return;
        }
        const accent_map = {
          á: 'a',
          é: 'e',
          í: 'i',
          ó: 'o',
          ú: 'u',
          Á: 'a',
          É: 'e',
          è: 'e',
          Í: 'i',
          Ó: 'o',
          Ú: 'u'
        };
        const accent_fold = (data) => {
          let ret = '';
          for (let i = 0; i < data.length; i++) {
            ret += accent_map[data.charAt(i)] || data.charAt(i);
          }
          return ret;
        };
        const needle = accent_fold(val.toLowerCase());
        this.options = this.optionFixed.filter((v) => {
          const notAccent = accent_fold(v.label.toLowerCase());
          return notAccent.indexOf(needle) > -1;
        });
      });
    },
    uploadFn(_file) {
      return new Promise((resolve, _reject) => {
        // Retrieve JWT token from your store.
        // const token = "myToken";
        resolve({
          url: this.uploadUrl,
          method: 'POST',
          headers: this.headers
        });
      });
    },
    showHelper() {
      if (this.fieldSchema.helpContainer) {
        this.$refs.helperProxy.show();
      }
    },
    onImageChange(image) {
      console.log(image);
    },
    onFileChange: function (file) {
      this.previewUrl = 'entra';
      //const file = files[0]
      if (!file) {
        return false;
      }
      if (!file.type.match('image.*')) {
        return false;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    },
    onComputedTotal(data) {
      this.$emit('computed-total', data);
    },
    selectRow(args) {
      const targets = {};
      const { row } = args;

      if (row) {
        const firstkey = Object.keys(row)[0];
        targets[this.fieldSchema.name] = row[firstkey];
        this.helpFounded = true;
      } else {
        this.helpFounded = false;
      }

      Object.entries(this.fieldSchema.fields)
        .filter((field) => field[1].detail.length !== 0)
        .map((field) => {
          field[1].detail.map((target) => {
            targets[target] = row ? row[field[0]] : '';
          });
        });

      this.$emit('fill-fields', targets);
      this.$refs.helperProxy.hide();
    },
    setRules() {
      if (this.helpPath) {
        this.rules.push((_val) => this.helpFounded || 'Código Incorrecto');
      }
    },
    mapRemoteOptions(options) {
      const data = [];
      let flat = false;
      if (!options) return data;
      for (const optionData of options) {
        let counter = 0;
        let key = null;
        let label = '';
        for (const [, value] of Object.entries(optionData)) {
          if (counter === 0) {
            key = optionData.value ?? value;
          }
          if (counter === 1) {
            label = optionData.label ?? value;
          }
          counter++;
        }
        if (!label) continue;
        if (!flat && label.includes(' - ')) {
          const temp = label.slice(0, label.indexOf(' - '));
          if (temp.match(/^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/)) flat = true;
        }
        if (this.helperPath) {
          data.push({
            value: key,
            label
          });
        } else {
          data.push({
            value: key,
            label,
            description: label,
            data: optionData
          });
        }
      }
      if (this.fieldSchema.sortable !== false) {
        this.orderData(data, flat);
      }
      this.optionFixed = data;
      return data;
    },
    mapOptions(options) {
      const data = [];
      let flat = false;
      if (options) {
        options.map((option) => {
          const key = String(option._id);
          //const key = option[0];
          let label = option;
          if ((typeof label === 'object' || typeof label === 'function') && label !== null) {
            label = label[Object.keys(label)[0]];
          }

          if (!flat && label.includes(' - ')) {
            const temp = label.slice(0, label.indexOf(' - '));
            if (temp.match(/^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/)) flat = true;
          }
          if (this.helperPath) {
            data.push({
              value: key,
              label
            });
          } else {
            data.push({
              value: key,
              label,
              description: label,
              data: option
            });
          }
        });
        if (this.fieldSchema.sortable !== false) {
          this.orderData(data, flat);
        }
      }
      this.optionFixed = data;
      return data;
    },
    mapOptionsOld(options) {
      const data = [];
      let flat = false;
      if (options) {
        Object.entries(options).map((option) => {
          const key = option[0]?.trim?.() ?? option[0];
          let label = option[1];
          if ((typeof label === 'object' || typeof label === 'function') && label !== null) {
            label = label[Object.keys(label)[0]];
          }
          if (!flat && label.includes(' - ')) {
            const temp = label.slice(0, label.indexOf(' - '));
            if (temp.match(/^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/)) flat = true;
          }
          if (this.helperPath) {
            data.push({
              value: key,
              label,
              data: option[1] ?? {}
            });
          } else {
            data.push({
              value: key,
              label,
              description: label,
              data: option
            });
          }
        });
        this.orderData(data, flat);
      }
      this.optionFixed = data;
      return data;
    },

    orderData(data, flat) {
      if (!flat) {
        if (typeof data[0]?.data === 'object') {
          const keys = Object.keys(data[0].data);
          const order = keys.filter((key) => key.includes('orden'));
          if (order) {
            return data.sort((a, b) => (Number.parseInt(a.data[order]) > Number.parseInt(b.data[order]) ? 1 : -1));
          }
        }
        return data.sort((a, b) => (a.label > b.label ? 1 : -1));
      }
      data.sort((prev, next) => {
        const dateNextFormat = this.formatDate(next.label.slice(0, 10));
        const tempNext = new Date(dateNextFormat[0], dateNextFormat[1], dateNextFormat[2]);
        const datePrevFormat = this.formatDate(prev.label.slice(0, 10));
        const tempPrev = new Date(datePrevFormat[0], datePrevFormat[1], datePrevFormat[2]);
        if (tempPrev.getTime() > tempNext) return -1;
        if (tempPrev.getTime() < tempNext) return 1;
        return 0;
      });
    },

    formatDate(props) {
      const year = props.slice(6, 10);
      const month = Number.parseInt(props.slice(3, 5)) + 1;
      const day = props.slice(0, 2);
      return [year, month, day];
    },
    getHelpSchema(_url) {
      if (this.helpPath) {
        histrixApi
          .getAppSchema(this.helpPath)
          .then((response) => {
            this.helpSchema = response.data.schema;
          })
          .catch((e) => {
            // this.dialog = true;
            this.message = `Error de Carga${e}`;
          });
      }
    },
    getFieldHelpData(newVal) {
      clearTimeout(this.delayTimer);

      const params = this.query;
      const helpKey = this.fieldSchema.help_key;
      params[helpKey] = newVal;

      this.delayTimer = setTimeout(() => {
        histrixApi
          .getAppData(this.helpPath, params)
          .then((response) => {
            const row = response.data.data[0];
            const schema = this.helpSchema;
            this.selectRow({ row, schema });
          })
          .catch((_e) => {
            /*
            this.dialog = true;
            this.message = 'Error de Carga de Datos';
            */
          });
      }, 100); // Will do the ajax stuff after 1000 ms, or 1 s
    },
    /*
    getFieldSchema: function(query) {
      if (this.hasOptions) {
        if (query) {
                histrixApi.getAppSchema(this.innerContainerUrl, query)
                  .then(response => {
                    this.options = this.mapOptions(response.data.data);
                  })
                  .catch(e => {
                    console.log(e)
                  });
        } else {
          this.options = this.mapOptions(this.fieldSchema.options);
        }
      }
    },
    /**
     * Realiza la peticion de busqueda cuando autocomplete es 'true'
     * @param {*} valueSearch
     * @return Promise<Array>
     */

    async searchOptions(valueSearch) {
      try {
        let field = await histrixApi.getAppSchema(this.innerContainerUrl);
        field = Object.keys(field.data.schema.fields)[1];
        const response = await histrixApi.getAppData(this.innerContainerUrl, {
          '_f[]': `${field}`,
          '_o[]': 'like',
          '_v[]': valueSearch
        });
        // this.options = this.mapOptions(response.data.data);
        this.options = this.mapRemoteOptions(response.data.data);
        const option = this.options.find((obj) => obj.value === valueSearch);
        this.$emit('selectOption', {
          selected_option: option
        });
      } catch (error) {
        console.log(error);
      }
    },
    /**
     * Sirve para traer las opciones del campo
     * @returns void
     */
    getOptions(_refresh = false) {
      // this.$emit("refreshFieldSchema", {value: localValue.value, selected_option: option})
      // this.getFieldSchema(query)
      let refresh = _refresh;
      const opt = this.fieldSchema?.options_sorted ?? this.fieldSchema?.options;
      if (!refresh && this.rowSchema && opt) {
        this.options = this.mapOptionsOld(opt);
        refresh = false;
      } else {
        refresh = true;
      }

      const val = this.localValue ? this.localValue.value || this.localValue : null;

      if (this.hasOptions) {
        if (this.query !== undefined && Object.entries(this.query).length !== 0) {
          if (this.autoComplet === 'true') return;
          if (refresh || this.histrixType === 'radio') {
            histrixApi
              .getAppData(this.innerContainerUrl, this.query)
              .then((response) => {
                // this.options = this.mapOptions(response.data.data);
                this.options = this.mapRemoteOptions(response.data.data);

                const option = this.options.find((obj) => obj.value === val);
                this.$emit('selectOption', {
                  value: val,
                  selected_option: option
                });
              })
              .catch((e) => {
                console.log(e);
              });
          }
        } else {
          if (this.fieldSchema.full_options) {
            this.options = this.mapOptions(this.fieldSchema.full_options);
          } else {
            this.options = this.mapOptionsOld(opt);
          }

          const option = this.options.find((obj) => obj.value === val);
          if (option) {
            this.$emit('selectOption', { value: val, selected_option: option });
          }
        }
      }
    }
  },
  data() {
    return {
      delayTimer: 0,
      previewUrl: '--',
      fileManager: false,
      helpSchema: {},
      showImage: false,
      helpFoundes: true,
      options: [],
      optionFixed: [],
      rules: [],
      dialog: {},
      toolbar: [],
      openNew: false,
      type: 'q-input',
      dateLocale: {
        /* starting with Sunday */
        days: 'Domingo_Lunes_Martes_Miércoles_Jueves_Viernes_Sábado'.split('_'),
        daysShort: 'Dom_Lun_Mar_Mié_Jue_Vie_Sáb'.split('_'),
        months: 'Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre'.split('_'),
        monthsShort: 'Ene_Feb_Mar_Abr_May_Jun_Jul_Ago_Sep_Oct_Nov_Dic'.split('_'),
        firstDayOfWeek: 1
      }
    };
  },
  created() {
    // this.getOptions(true);
  },
  mounted() {
    this.setRules();
    this.getHelpSchema();
    this.getOptions(true);
  },
  computed: {
    /**
     * Se utiliza para indicar si el campo es autocompletable o no para la busqueda.
     * @options 'on'|'off'|'true'|'false'
     * @return String
     */
    autoComplet() {
      return this.fieldSchema.autocomplete;
    },
    hint() {
      return this.fieldSchema.placeholder !== this.fieldSchema.title ? this.fieldSchema.placeholder : '';
    },
    fieldSchema() {
      return { ...this.schema, ...this.rowSchema };
    },
    clearable() {
      return this.fieldComponent === 'q-select' && this.fieldSchema.innerContainer.empty === true;
    },
    inputClass() {
      return `text-${this.fieldSchema.align}`;
    },
    fieldMask() {
      let mask = '';
      if (this.isDate) {
        mask = '##/##/####';
      }

      if (this.isTime) {
        mask = 'time';
      }
      if (this.isDateTime) {
        mask = '####-##-## ##:##:##';
      }
      if (this.isDecimal) {
        if (this.totalDecimal === 0) {
          mask = '#';
        } else {
          mask = '#.';
          for (let i = 0; i < this.totalDecimal; i++) {
            mask += '#';
          }
        }
      }
      return mask;
    },
    /**
     *
     * @returns String
     */
    innerContainerUrl() {
      const { innerContainer } = this.schema;
      let url = `${innerContainer.dir}/${innerContainer.xml}`;
      if (this.fieldSchema.helperXml) {
        url = this.fieldSchema.helperXml;
      }
      return url;
    },
    isDisabled() {
      if (this.submitting) {
        return true;
      }
      if (this.histrixType === 'object') {
        return false;
      }
      if (this.row && this.fieldSchema.enabler) {
        return (
          this.row[this.fieldSchema.enabler] === '0' ||
          this.row[this.fieldSchema.enabler] === 0 ||
          this.row[this.fieldSchema.enabler] === 'false'
        );
      }
      if (this.fieldSchema.deshabilitado === 'true') {
        return true;
      }
      if (this.fieldSchema.deshabilitado === 'false') {
        return false;
      }
      return this.fieldSchema.disabled === 'disabled';
    },
    hasOptions() {
      const opt = this.fieldSchema?.options_sorted ?? this.fieldSchema?.options;
      return (opt && Object.keys(opt).length !== 0) || this.fieldSchema.isSelect;
    },
    renderHelper() {
      return this.fieldSchema.innerContainer && !this.hasOptions;
    },
    headers() {
      return [{ name: 'Authorization', value: `Bearer ${localStorage.accessToken}` }];
    },
    uploadUrl() {
      return `${histrixApi.apiUrl()}/files/${this.path}`;
    },
    thumb() {
      return `${histrixApi.apiUrl()}/thumb/${this.path}${this.value}`;
    },
    helperPath() {
      const helper = this.fieldSchema.innerContainer;
      const url = `${helper.dir}/${helper.xml}`;
      return url.replace('//', '/');
    },
    isViewAddButton() {
      if (!this.fieldSchema?.innerContainer) return false;
      const { innerContainer } = this.fieldSchema;
      const schema = innerContainer.schema;
      return schema?.type === 'fichaing';
    },
    helpPath() {
      if (this.fieldSchema.helpContainer) {
        const helper = this.fieldSchema.helpContainer;
        return `${helper.dir}/${helper.xml}`;
      }
      return null;
    },
    size() {
      return this.fieldSchema.size.toString();
    },
    isMultiple() {
      return this.fieldSchema
        ? this.fieldSchema.multiple === 1 || this.fieldSchema.multiple === 'multiple'
        : this.schema.multiple === 'multiple';
    },
    isTextarea() {
      return this.fieldSchema.size > 90;
    },
    isDate() {
      return this.schema['data-role'] === 'datebox' || this.histrixType === 'date';
    },
    isTime() {
      return this.fieldSchema.histrix_type === 'Time' || this.histrixType === 'time';
    },
    isDecimal() {
      return this.fieldSchema.histrix_type === 'decimal' || this.histrixType === 'decimal';
    },
    fillMask() {
      return this.isDecimal ? '0' : '';
    },
    totalDecimal() {
      return Number.parseInt(this.fieldSchema.decimales);
    },
    isDateTime() {
      return this.fieldSchema.histrix_type === 'Datetime' || this.histrixType === 'datetime';
    },
    label() {
      // if (!this.isDisabled) {
      if (this.fieldSchema.label || this.fieldSchema.title) {
        return this.fieldSchema.label || this.fieldSchema.title;
      }

      // }
    },
    fieldComponent() {
      let component = 'q-input';
      switch (this.histrixType) {
        case 'radio':
          component = 'q-option-group';
          break;
        case 'q-file':
          component = 'q-file';
          break;
        case 'check':
          component = 'q-checkbox';
          break;
        case 'toggle':
          component = 'q-toggle';
          break;
        case 'q-editor':
          component = 'q-editor';
          this.toolbar = [
            [
              {
                label: this.$q.lang.editor.align,
                icon: this.$q.iconSet.editor.align,
                fixedLabel: true,
                list: 'only-icons',
                options: ['left', 'center', 'right', 'justify']
              }
            ],
            ['bold', 'italic', 'strike', 'underline', 'subscript', 'superscript'],
            ['token', 'hr', 'link', 'custom_btn'],
            ['print', 'fullscreen'],
            [
              {
                label: this.$q.lang.editor.formatting,
                icon: this.$q.iconSet.editor.formatting,
                list: 'no-icons',
                options: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'code']
              },
              {
                label: this.$q.lang.editor.fontSize,
                icon: this.$q.iconSet.editor.fontSize,
                fixedLabel: true,
                fixedIcon: true,
                list: 'no-icons',
                options: ['size-1', 'size-2', 'size-3', 'size-4', 'size-5', 'size-6', 'size-7']
              },
              {
                label: this.$q.lang.editor.defaultFont,
                icon: this.$q.iconSet.editor.font,
                fixedIcon: true,
                list: 'no-icons',
                options: [
                  'default_font',
                  'arial',
                  'arial_black',
                  'comic_sans',
                  'courier_new',
                  'impact',
                  'lucida_grande',
                  'times_new_roman',
                  'verdana'
                ]
              },
              'removeFormat'
            ],
            ['quote', 'unordered', 'ordered', 'outdent', 'indent'],

            ['undo', 'redo'],
            ['viewsource']
          ];
          /*
          :fonts="{
            arial: 'Arial',
            arial_black: 'Arial Black',
            comic_sans: 'Comic Sans MS',
            courier_new: 'Courier New',
            impact: 'Impact',
            lucida_grande: 'Lucida Grande',
            times_new_roman: 'Times New Roman',
            verdana: 'Verdana'
          }"
          */
          break;
        case 'q-input':
          component = 'q-input';
          break;
        case 'q-select':
          component = 'q-select';
          break;
        case 'object':
          component = 'HistrixApp';
          break;
        default:
          component = 'q-input';
          break;
      }
      return component;
    },

    isRadio() {
      return this.histrixType === 'radio';
    },
    inputType() {
      if (this.fieldSchema.histrix_type === 'File') {
        return this.fieldSchema.histrix_type;
      }
      if (this.histrixType === 'radio') {
        return this.histrixType;
      }
      if (this.isDateTime) {
        return 'text';
      }
      if (this.fieldComponent === 'q-select' && this.hasOptions === true) {
        return 'text';
      }
      if (this.fieldSchema.TipoDato === 'integer') {
        return 'number';
      }
      return this.fieldSchema.type;
    },
    histrixType() {
      let { type } = this;

      if (this.hasOptions) {
        type = 'q-select';
      }

      if (this.fieldSchema.histrix_type === 'Radio') {
        type = 'radio';
      }

      if (this.fieldSchema.TipoDato) {
        type = this.fieldSchema.TipoDato;
      }

      if (type === 'select') {
        type = 'q-select';
      }

      if (this.renderHelper) {
        type = 'object';
      }

      if (this.fieldSchema.histrix_type === 'File') {
        type = 'q-file';
      }

      if (this.fieldSchema.histrix_type === 'Editor') {
        type = 'q-editor';
      }

      if (this.fieldSchema.histrix_type === 'Check') {
        type = 'check';
      }

      if (this.fieldSchema.histrix_type === 'Flipswitch') {
        type = 'toggle';
      }
      return type;
    },
    style() {
      const style = this.fieldSchema.style || '';
      return style;
    },
    dateMask() {
      return 'DD/MM/YYYY';
    },

    localValue: {
      get() {
        if (this.histrixType === 'check' || this.histrixType === 'toggle') {
          if (typeof this.value === 'boolean') {
            return this.value;
          }
          if (this.value === '') return false;
          return this.value !== '0';
        }
        if (this.isDate) {
          if (this.value === '' || !this.value) {
            return undefined;
          }
          if (this.value.length !== 10) {
            return this.value;
          }
          let value = this.value;
          if (this.value.includes('/')) {
            value = this.value.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$2/$1/$3');
          }
          const fecha = new Date(value);
          fecha.setMinutes(fecha.getMinutes() + fecha.getTimezoneOffset());
          return date.formatDate(fecha, this.dateMask);
        }

        if (this.histrixType === 'q-select' && this.options) {
          if (!this.isMultiple) {
            return this.value;
            // return this.options.find(obj => obj.value == this.value);
          }
          if (this.value === '' || this.value === null) {
            return undefined;
          }

          if (typeof this.value === 'string' || this.value instanceof String) {
            let items = JSON.parse(this.value);
            if (!Array.isArray(items)) {
              items = [this.value];
            }
            return items;
          }
        }

        // if (this.histrixType == 'q-file') {
        //   return null
        //  return this.value.name
        // }

        // if (this.histrixType == 'object') {
        //   return this.value;
        // }

        if (this.value) {
          return this.value.value !== undefined ? this.value.value : this.value;
        }

        return this.value;
      },
      set(localValue) {
        if (this.histrixType === 'q-select') {
          const val = localValue;
          if (localValue?.value) {
            this.$emit('input', localValue.value);
            const _val = localValue.value;
          } else {
            this.$emit('input', localValue);
          }

          const option = this.options.find((obj) => obj.value === val);
          this.$emit('selectOption', {
            value: localValue,
            selected_option: option
          });
          /*
                        console.log('select');

            if (this.isMultiple) {
              // this.$emit('input', localValue );

              const values = localValue.map(item =>  {
                 console.log(item) ;
                return item.value })

              this.$emit('input', values);

            } else {
              console.log('PUTO VALOR DE ENTRADA');
              console.log(localValue)
              this.$emit('input', localValue);

              const option = this.options.find(obj => obj.value == localValue);

        //      this.$emit('selectOption', { value: localValue, selected_option: option });

            }
            */
        } else {
          if (this.isDate) {
            let fecha = new Date();
            if (this.dateMask === 'DD/MM/YYYY') {
              if (localValue.length !== 10) {
                this.$emit('input', localValue);
                this.$emit('field-change', this.row);
                return;
              }
              fecha = new Date(localValue.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$2/$1/$3'));
              fecha.setMinutes(fecha.getMinutes() + fecha.getTimezoneOffset());
            } else {
              fecha = new Date(localValue);
              fecha.setMinutes(fecha.getMinutes() + fecha.getTimezoneOffset());
            }
            this.$emit('input', date.formatDate(fecha, 'YYYY-MM-DD'));
          } else {
            this.$emit('input', localValue);
          }
        }

        this.$emit('field-change', this.row);
      }
    }
  },
  events: {
    'reset-field'(names) {
      const namesArray = typeof names === 'string' ? [names] : names;
      if (namesArray.includes(this.fieldSchema.name)) {
        this.localValue = '';
      }
    }
  }
};
</script>
<style scoped>
.content-field {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
}
</style>
