<template>
<div>

    <span class="q-pa-xs text-caption" v-if="isRadio" >
      {{  label }}
    </span>
    <!--
<picture-input 
    v-if="histrixType === 'q-file'" 
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
    <component
      v-bind:is="fieldComponent"
      v-model="localValue"
      :name="fieldSchema.name"
      v-bind="$attrs"
      
      :type="inputType"
      :path="helperPath"
      :headers="headers"
      :url="uploadUrl"
      :query="query"
      :options="options"
      :rules="rules"
      :label="label"
      :inner="true"
      :mask="fieldMask"
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
        verdana: 'Verdana'
      }"
      :size="size"

      :multiple="isMultiple"
      :autogrow="isTextarea"
      :style="style"
      @v-on:keyup.113="showHelper()"
      :input-class="inputClass"
      v-on:computed-total="onComputedTotal"
      :clearable="clearable"
      inline
      dense
    >
      <template v-slot:before v-if="histrixType === 'q-file'" >


        <!--<q-btn   icon="folder"  @click="fileManager = true" />

        <q-dialog v-model="fileManager">            
          <HistrixFileManager :path="path" />
        </q-dialog>                  
        -->
        <q-avatar size="100px">
          
          <q-img :src="previewUrl" v-if="previewUrl" @click="showImage = true" />
          <q-img  _v-else-if="value" :src="thumb" spinner-color="grey"  @click="showImage = true" />
        </q-avatar>
        <q-dialog  v-model="showImage">
          <q-card style="width:700px; max-width: 80vw;">
          <q-card-section class="row items-center q-pb-none">
              <q-space />
              <q-btn icon="close" flat round dense v-close-popup />
            </q-card-section>        
            <q-card-section>
              <q-img :src="previewUrl" v-if="previewUrl" spinner-color="grey" />
                <q-img  :src="thumb" v-else spinner-color="grey" >
                </q-img>
            </q-card-section>
          </q-card>
        </q-dialog>        
      </template>


      <template v-slot:prepend>
         <q-icon v-if="histrixType === 'q-file'" name="attach_file" />
      </template>


      <!-- in control button -->
      <template v-slot:append>
        <!-- EXTERNAL HELP POPUP -->

        <q-icon name="help" class="cursor-pointer" v-if="fieldSchema.helpContainer" >
          <q-popup-proxy  ref="helperProxy" anchor="bottom left" self="top right" transition-show="scale" transition-hide="scale">
            <HistrixApp  :path="helpPath" :query="query" :title="'Seleccione '+ label" v-on:select-row="selectRow" :search="true"/>
          </q-popup-proxy>
        </q-icon>

        <!-- DATE CONTROL POPUP -->
        <q-icon name="event" class="cursor-pointer"  v-if="isDate">
          <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale" >
            <q-date mask="DD/MM/YYYY" :locale="dateLocale" v-model="localValue" @input="() => $refs.qDateProxy.hide()"
            />
          </q-popup-proxy>
        </q-icon>

        <!-- IMAGE FOLDER -->
           <q-icon   v-if="histrixType === 'q-file'" name="close" @click.stop="localValue = null" class="cursor-pointer" /> 
          <!-- <q-icon name="create_new_folder" @click.stop v-if="histrixType === 'q-file'" /> -->

        <!-- TIME CONTROL POPUP -->
        <q-icon name="access_time" class="cursor-pointer" v-if="isTime">
            <q-popup-proxy ref="timeProxy" transition-show="scale" transition-hide="scale">
              <q-time  v-model="localValue" @input="() => $refs.timeProxy.hide()" />
            </q-popup-proxy>
          </q-icon>
      </template>

    </component>
</div>
</template>

<script>
import Vue from 'vue';
import { date } from 'quasar';

import histrixApi from '../services/histrixApi.js'
// import PictureInput from 'vue-picture-input'

export default {
  name: 'HistrixField',
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
      handler(newVal, oldVal) {
        if (this.fieldSchema.helpContainer) {
          this.getFieldHelpData(newVal);
        }
        if (this.fieldSchema.histrix_type == 'File') {
          this.onFileChange(newVal)
        }
      },
      deep: true
    },

    schema: {
      handler(newVal, oldVal) {
        this.getOptions();
      },
      deep: true
    },
    query: {
      handler(newVal, oldVal) {
        this.getOptions();
      },
      deep: true
    },
    options: {
      handler(newVal, oldVal) {
        if (this.options.length == 1 && this.fieldSchema.innerContainer.empty == false) {
          this.localValue = this.options[0]
        }
      },
      deep: true
    }

  },
  components: {
    HistrixApp: () => import('./HistrixApp.vue'),
    HistrixFileManager: () => import('./widgets/HistrixFileManager.vue'),
    // PictureInput
  },
  methods: {
    uploadFn (file) {
      return new Promise((resolve, reject) => {
        // Retrieve JWT token from your store.
        // const token = "myToken";
        resolve({
          url: this.uploadUrl,
          method: 'POST',
          headers: this.headers
        })
      })
    },
    showHelper() {
      if (this.fieldSchema.helpContainer) {
        this.$refs.helperProxy.show();
      }
    },
    onImageChange(image) {
      console.log(image)
    },
    onFileChange: function (file) {
      this.previewUrl = 'entra'
        //const file = files[0]
        if (!file) {
          return false
        }
        if (!file.type.match('image.*')) {
          return false
        }
        const reader = new FileReader()
        const that = this
        reader.onload = function (e) {
          that.previewUrl = e.target.result
        }
        reader.readAsDataURL(file)
    },    
    onComputedTotal(data) {
      this.$emit('computed-total', data);
    },
    selectRow(args) {
      const targets = {};
      const { row, schema } = args;

      if (row) {
        const firstkey = Object.keys(row)[0];
        targets[this.fieldSchema.name] = row[firstkey];
        this.helpFounded = true;
      } else {
        this.helpFounded = false;
      }

      Object.entries(fieldSchema.fields).filter(field => field[1].detail.length != 0).map((field) => {
        field[1].detail.map((target) => {
          targets[target] = (row) ? row[field[0]] : '';
        });
      });

      this.$emit('fill-fields', targets);
      this.$refs.helperProxy.hide();
    },
    setRules() {
      if (this.helpPath) {
        this.rules.push(val => this.helpFounded || 'Código Incorrecto');
      }
    },
    mapRemoteOptions(options) {
      const data = [];

      if (options) {
        options.map((optionData) => {
          let counter = 0;
          let key = null;
          let label = '';
          Object.entries(optionData).map((options) => {
            if (counter === 0) {
              key = options[1];
            }
            if (counter === 1) {
              label = options[1];
            }
            counter++;
          });
          data.push({
            value: key,
            label,
            description: label,
            data: optionData,
          });
        });
        data.sort((a, b) => ((a.label > b.label) ? 1 : -1));
        return data;
      }
    },
    mapOptions(options) {
      const data = [];
      if (options) {
        Object.entries(options).map((option) => {
          const key = option[0];
          let label = option[1];
          if (
            (typeof label === 'object' || typeof label === 'function')
            && label !== null
          ) {
            label = label[Object.keys(label)[0]];
          }

          data.push({
            value: key,
            label,
            description: label,
            data: option[1],
          });
        });
        data.sort((a, b) => ((a.label > b.label) ? 1 : -1));
      }
      return data;
    },
    getHelpSchema(url) {
      if (this.helpPath) {
        histrixApi.getAppSchema(this.helpPath)
          .then((response) => {
            this.helpSchema = response.data.schema;
          })
          .catch((e) => {
            this.dialog = true;
            this.message = `Error de Carga${e}`;
          });
      }
    },
    getFieldHelpData(newVal) {
      clearTimeout(this.delayTimer);

      const params = this.query;
      const helpKey = this.fieldSchema.help_key;
      params[helpKey] = newVal;

      const that = this;

      this.delayTimer = setTimeout(() => {
        histrixApi.getAppData(this.helpPath, params)
          .then((response) => {
            const row = response.data.data[0];
            const schema = that.helpSchema;
            that.selectRow({ row, schema });
          })
          .catch((e) => {
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
    */
    getOptions() {
      // this.$emit("refreshFieldSchema", {value: localValue.value, selected_option: option})
      // this.getFieldSchema(query)
      if (this.hasOptions) {
        if (this.query != undefined && Object.entries(this.query).length !== 0) {
          histrixApi.getAppData(this.innerContainerUrl, this.query)
            .then((response) => {
              // this.options = this.mapOptions(response.data.data);
              this.options = this.mapRemoteOptions(response.data.data);
            })
            .catch((e) => {
              console.log(e);
            });
        } else {
          this.options = this.mapOptions(this.fieldSchema.options);
        }
      }
    },
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
      rules: [],
      toolbar: [],
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
  mounted() {
    this.setRules();
    this.getOptions();
    this.getHelpSchema();
  },
  computed: {
    fieldSchema() {
      return {...this.schema, ...this.rowSchema}
    },
    clearable() {
      return this.fieldComponent == 'q-select' && this.fieldSchema.innerContainer.empty == true
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
      return mask;
    },
    innerContainerUrl() {
      const { innerContainer } = this.schema;
      const url = `${innerContainer.dir}/${innerContainer.xml}`;
      return url;
    },
    isDisabled() {
      if (this.submitting) {
        return true;
      }
      if (this.histrixType == 'object') {
        return false;
      }
      if (this.fieldSchema.enabler) {
        return this.row[this.fieldSchema.enabler] == 0 || this.row[this.fieldSchema.enabler] == 'false';
      }
      if (this.fieldSchema.deshabilitado == 'true') {
        return true;
      }
      if (this.fieldSchema.deshabilitado == 'false') {
        return false;
      }      
      return (this.fieldSchema.disabled == 'disabled');
    },
    hasOptions() {
      return this.fieldSchema.options && Object.keys(this.fieldSchema.options).length !== 0 || this.fieldSchema.isSelect;
    },
    renderHelper() {
      return this.fieldSchema.innerContainer && !this.hasOptions;
    },
    headers() {
      return [{name: 'Authorization', value: 'Bearer ' + localStorage.accessToken}]

    },
    uploadUrl() {
      return histrixApi.apiUrl() + '/files/' + this.path ;
    },
    thumb() {
      return histrixApi.apiUrl() + '/thumb/' + this.path + this.value;
    },
    helperPath() {
      const helper = this.fieldSchema.innerContainer;
      const url = `${helper.dir}/${helper.xml}`;
      return url.replace('//', '/');
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
      return (this.rowSchema )?this.rowSchema.multiple == 1 : this.schema.multiple == 'multiple'
    },
    isTextarea() {
      return this.fieldSchema.size > 90;
    },
    isDate() {
      return this.schema['data-role'] == 'datebox' || this.histrixType == 'date';
    },
    isTime() {
      return this.fieldSchema.histrix_type == 'Time' || this.histrixType == 'time';
    },
    label() {
      // if (!this.isDisabled) {
      if (this.fieldSchema.label || this.fieldSchema.title) {
        return this.fieldSchema.label || this.fieldSchema.title  
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
              },
            ],
            ['bold', 'italic', 'strike', 'underline', 'subscript', 'superscript'],
            ['token', 'hr', 'link', 'custom_btn'],
            ['print', 'fullscreen'],
            [
              {
                label: this.$q.lang.editor.formatting,
                icon: this.$q.iconSet.editor.formatting,
                list: 'no-icons',
                options: [
                  'p',
                  'h1',
                  'h2',
                  'h3',
                  'h4',
                  'h5',
                  'h6',
                  'code'
                ]
              },
              {
                label: this.$q.lang.editor.fontSize,
                icon: this.$q.iconSet.editor.fontSize,
                fixedLabel: true,
                fixedIcon: true,
                list: 'no-icons',
                options: [
                  'size-1',
                  'size-2',
                  'size-3',
                  'size-4',
                  'size-5',
                  'size-6',
                  'size-7'
                ]
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
      return (this.histrixType == 'radio');
    },
    inputType() {
     if (this.fieldSchema.histrix_type == 'File') {
       return this.fieldSchema.histrix_type
     }
      if (this.histrixType == 'radio') {
        return this.histrixType;
      }
      return this.fieldSchema.type;
    },
    histrixType() {
      let { type } = this;

      if (this.hasOptions) {
        type = 'q-select';
      }

      if (this.fieldSchema.histrix_type == 'Radio') {
        type = 'radio';
      }

      if (this.fieldSchema.TipoDato) {
        type = this.fieldSchema.TipoDato
      }

      if (type == 'select') {
        type = 'q-select';
      }

      if (this.renderHelper) {
        type = 'object';
      }

      if (this.fieldSchema.histrix_type == 'File') {
        type = 'q-file';
      }

      if (this.fieldSchema.histrix_type == 'Editor') {
        type = 'q-editor';
      }

      if (this.fieldSchema.histrix_type == 'Check') {
        type = 'check';
      }

      if (this.fieldSchema.histrix_type == 'Flipswitch') {
        type = 'toggle';
      }
      return type;
    },
    style() {
      let style = this.fieldSchema.style || '';
      if (this.fieldSchema.label) {
        style += `min-width:${this.fieldSchema.label.length * 2}em`;
      }
      return style;
    },
    dateMask() {
      return 'DD/MM/YYYY';
    },
    localValue: {
      get() {
        
        if (this.histrixType == 'check' || this.histrixType == 'toggle') {
          return this.value === true || this.value != 0;
        }
        if (this.isDate) {
          let fecha = new Date(this.value)
          fecha.setMinutes(fecha.getMinutes() + fecha.getTimezoneOffset())
          return date.formatDate(fecha, this.dateMask)
        }


        if (this.histrixType == 'q-select' && this.options ) {
          if (!this.isMultiple) {
            return this.options.find(obj => obj.value == this.value);
          } else {
             if (this.value) {
               return this.value
             } else {
               return []
             }
          }
          
        }
      /*        
        if (this.histrixType == 'q-file') {
           return null
          return this.value.name
        }
*/
        
        // if (this.histrixType == 'object') {
        //   return this.value;
        // }
        
        if (this.value) {
          return (this.value.value != undefined) ? this.value.value : this.value;
        }

        return this.value;
        
      },
      set(localValue) {
        if (this.histrixType == 'q-select'  && !this.isMultiple ) {
            this.$emit('input', localValue.value);
            const option = this.options.find(obj => obj.value == localValue.value);
            this.$emit('selectOption', { value: localValue.value, selected_option: option });
        } else {
          if (this.isDate) {
            var fecha = new Date()
            if (this.dateMask === 'DD/MM/YYYY') {
              fecha = new Date(localValue.replace( /(\d{2})\/(\d{2})\/(\d{4})/, "$2/$1/$3"))
              fecha.setMinutes(fecha.getMinutes() + fecha.getTimezoneOffset())
            } else {
              fecha = new Date(localValue)
              fecha.setMinutes(fecha.getMinutes() + fecha.getTimezoneOffset())
            }
            this.$emit('input', date.formatDate(fecha, 'YYYY-MM-DD'));

          } else {
            this.$emit('input', localValue);
          }          
        }

      },
    },
  },
};
</script>
