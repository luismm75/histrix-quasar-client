<template>
<div>
    <span class="q-pa-xs text-caption" v-if="isRadio" >
      {{  label }}
    </span>
    <component
      v-bind:is="fieldComponent"
      v-model="localValue"
      v-bind="$attrs"
      :title="label"
      :type="inputType"
      :path="helperPath"
      :query="query"
      :options="options"
      :rules="rules"
      :label="label"
      :inner="true"
      :mask="fieldMask"
      :filled="!isDisabled"
      
      :disabled="isDisabled"
      :readonly="isDisabled"
      
      :size="size"
      :_readonly="schema.readonly == 'readonly'"
      :multiple="schema.multiple == 'multiple'"
      :autogrow="isTextarea"
      :style="style"
      @v-on:keyup.113="showHelper()"
      :input-class="inputClass"
      v-on:computed-total="onComputedTotal"
      :clearable="clearable"
      inline
      dense
    >
      <!-- in control button -->
      <template v-slot:append>
        <!-- EXTERNAL HELP POPUP -->

        <q-icon name="help" class="cursor-pointer" v-if="schema.helpContainer" >
          <q-popup-proxy  ref="helperProxy" anchor="bottom left" self="top right" transition-show="scale" transition-hide="scale">
            <HistrixApp  :path="helpPath" :query="query" :title="'Seleccione '+ label" v-on:select-row="selectRow" :search="true"/>
          </q-popup-proxy>
        </q-icon>

        <!-- DATE CONTROL POPUP -->
        <q-icon name="event" class="cursor-pointer"  v-if="isDate">
          <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale" >
            <q-date mask="DD/MM/YYYY" v-model="localValue" @input="() => $refs.qDateProxy.hide()"
            />
          </q-popup-proxy>
        </q-icon>

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

import histrixApi from '../services/histrixApi.js'

export default {
  name: 'HistrixField',
  props: {
    schema: Object,
    rowSchema: Object,
    query: Object,
    value: null,
    row: null,
    submitting: null
  },
  watch: {
    localValue: {
      handler(newVal, oldVal) {
        if (this.schema.helpContainer) {
          this.getFieldHelpData(newVal);
        }
      },
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
        if (this.options.length == 1 && this.schema.innerContainer.empty == false) {
          this.localValue = this.options[0]
        }
      },
      deep: true
    }

  },
  components: {
    HistrixApp: () => import('./HistrixApp.vue'),
  },
  methods: {
    showHelper() {
      if (this.schema.helpContainer) {
        this.$refs.helperProxy.show();
      }
    },
    onComputedTotal(data) {
      this.$emit('computed-total', data);
    },
    selectRow(args) {
      const targets = {};
      const { row, schema } = args;

      if (row) {
        const firstkey = Object.keys(row)[0];
        targets[this.schema.name] = row[firstkey];
        this.helpFounded = true;
      } else {
        this.helpFounded = false;
      }

      Object.entries(schema.fields).filter(field => field[1].detail.length != 0).map((field) => {
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
      const helpKey = this.schema.help_key;
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
          this.options = this.mapOptions(this.schema.options);
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
          this.options = this.mapOptions(this.schema.options);
        }
      }
    },
  },
  data() {
    return {
      delayTimer: 0,
      helpSchema: {},
      helpFoundes: true,
      options: [],
      rules: [],
      type: 'q-input',
    };
  },
  mounted() {
    this.setRules();
    this.getOptions();
    this.getHelpSchema();
  },
  computed: {
    clearable() {
      return this.fieldComponent == 'q-select' && this.schema.innerContainer.empty == true
    },
    inputClass() {
      return `text-${this.schema.align}`;
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
      if (this.schema.enabler) {
        return this.row[this.schema.enabler] == 0 || this.row[this.schema.enabler] == 'false';
      }
      return (this.schema.disabled == 'disabled');
    },
    hasOptions() {
      return this.schema.options && Object.keys(this.schema.options).length !== 0 || this.schema.isSelect;
    },
    renderHelper() {
      return this.schema.innerContainer && !this.hasOptions;
    },
    helperPath() {
      const helper = this.schema.innerContainer;
      const url = `${helper.dir}/${helper.xml}`;
      return url.replace('//', '/');
    },
    helpPath() {
      if (this.schema.helpContainer) {
        const helper = this.schema.helpContainer;
        return `${helper.dir}/${helper.xml}`;
      }
      return null;
    },
    size() {
      return this.schema.size.toString();
    },
    isTextarea() {
      return this.schema.size > 90;
    },
    isDate() {
      return this.schema['data-role'] == 'datebox' || this.histrixType == 'date';
    },
    isTime() {
      return this.schema.histrix_type == 'Time' || this.histrixType == 'time';
    },
    label() {
      // if (!this.isDisabled) {
      return this.schema.label || this.schema.title || this.rowSchema.label;
      // }
    },
    fieldComponent() {
      let component = 'q-input';
      switch (this.histrixType) {
        case 'radio':
          component = 'q-option-group';
          break;
        case 'check':
          component = 'q-checkbox';
          break;
        case 'q-editor':
          component = 'q-editor';
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
      if (this.histrixType == 'radio') {
        return this.histrixType;
      }
      return this.schema.type;
    },
    histrixType() {
      let { type } = this;

      if (this.hasOptions) {
        type = 'q-select';
        if (this.schema.histrix_type == 'Radio') {
          type = 'radio';
        }
      }

      if (this.rowSchema && this.rowSchema.TipoDato) {
        type = this.rowSchema.TipoDato
      }

      if (type == 'select') {
        type = 'q-select';
      }

      if (this.renderHelper) {
        type = 'object';
      }

      if (this.schema.histrix_type == 'Editor') {
        type = 'q-editor';
      }

      if (this.schema.histrix_type == 'Check') {
        type = 'check';
      }

      return type;
    },
    style() {
      let style = this.schema.style || '';
      if (this.schema.label) {
        style += `min-width:${this.schema.label.length * 2}em`;
      }
      return style;
    },
    localValue: {
      get() {
        if (this.histrixType == 'check') {
          return this.value === true || this.value != 0;
        }

        if (this.histrixType == 'q-select' && this.options && this.schema.multiple != 'multiple') {
          return this.options.find(obj => obj.value == this.value);
        }

        if (this.histrixType == 'object') {
          return this.value;
        }
        if (this.value) {
          return (this.value.value != undefined) ? this.value.value : this.value;
        }

        return this.value;
      },
      set(localValue) {
        if (this.histrixType == 'q-select' && this.schema.multiple != 'multiple') {
          this.$emit('input', localValue.value);
          const option = this.options.find(obj => obj.value == localValue.value);
          this.$emit('selectOption', { value: localValue.value, selected_option: option });
        } else {
          this.$emit('input', localValue);
        }
      },
    },
  },
};
</script>
