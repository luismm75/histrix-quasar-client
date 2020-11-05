<template>
  <div>
    <!--
     <q-toolbar class="text-primary " borderer _flat>
      <q-toolbar-title>
        {{ formTitle }}
      </q-toolbar-title>
      <q-space />
    </q-toolbar>
    -->
    <q-form >
      <div class="row">
        <div class="col">
          <q-tabs v-model="currentTab"  dense class="text-grey" active-color="primary" indicator-color="primary" align="justify" narrow-indicator>
            <q-tab  v-if="Object.keys(innerTabs).length != 0" name="mainTab"  :label="localSchema.title" class="bg-primary text-white" >
              <q-tooltip anchor="top middle" self="bottom middle">
                  Solapa principal {{ localSchema.title }}
              </q-tooltip>
            </q-tab>
            <span v-else >
            {{ localSchema.title }}
            </span>
            <q-tab v-for="tab in innerTabs" :name="tab.name" v-bind:key="tab.name" :label="tab.title || tab.name" >
                <q-tooltip anchor="top middle" self="bottom middle">
                  Click para mas información con respecto a {{tab.title}}
              </q-tooltip>
            </q-tab>
          </q-tabs>

          <q-tab-panels v-model="currentTab" animated>
            <q-tab-panel  name="mainTab"  >
              <div class="row">
                <div
                  v-for="field in editables"
                  v-bind:key="field.name"
                  :name="field.name"
                  :class="fieldClass(field)"
                >
                  <q-item dense >
                    <!--
                    <q-item-section style="text-align:right">
                      <q-item-label caption>{{
                        field.label || field.title
                      }}</q-item-label>
                    </q-item-section>
                    -->
                    <q-item-section>
                      <HistrixField
                        v-model="localValues[field.name]"
                        :name="field.name"
                        :schema="field"
                        :query="fieldQuerys[field.name]"
                        :readonly="localSchema.readonly"
                        :disabled="localSchema.readonly"
                        v-on:selectOption="onSelectOption"
                        v-on:fill-fields="fillFields"
                        v-on:computed-total="onComputedTotal"
                        dense
                        :error-message="errorMessage(field)"
                        :error="$v['localValues'][field.name].$invalid"
                        v-if="!localSchema.readonly"
                      />
                      <div v-else>
                        <q-item-label>ss
                          {{ localValues[field.name] }}
                        </q-item-label>
                      </div>
                    </q-item-section>
                  </q-item>
                </div>
              </div>
            </q-tab-panel>
            <q-tab-panel v-for="field in innerTabs" :name="field.name" v-bind:key="field.name"  >

                <HistrixField
                  v-model="localValues[field.name]"
                  :name="field.name"
                  :schema="field"
                  :query="fieldQuerys[field.name]"
                  :readonly="localSchema.readonly"
                  :disabled="localSchema.readonly"
                  v-on:selectOption="onSelectOption"
                  v-on:fill-fields="fillFields"
                  v-on:computed-total="onComputedTotal"

                  dense
                  v-if="!localSchema.readonly"
                />
            </q-tab-panel>
          </q-tab-panels>

        </div>
      </div>
      </q-form>

      <div class="row">
        <div class="col-5 "></div>
        <div class="col">

          <span class="q-pa-sm">
            <q-btn label="Cancelar"  icon="close"   class="nojustify-end flat"  v-close-popup />
            <q-btn v-if="editedIndex == -1"_v-if="schema.insertButton"  label="Grabar" icon="save" @click="insertRow()" :loading="submitting" />
            <q-btn label="guardar"   icon="save" :disable="$v.$invalid" class=" bg-primary text-white nojustify-end" @click="saveForm()" :loading="submitting" v-if="updateButton" />
          </span>
          <!--
            <q-btn
              icon="thumb_up"
              label="CONFIRMAR"
              class=" bg-secondary text-white nojustify-end"
              @click="processData()"
              :loading="submitting"
              v-if="localSchema.can_process && !inner && !schema.process_next_step && !$attrs.finalStep"
            />
            -->
        </div>
      </div>

  </div>
</template>

<script>
import Vue from 'vue';
import { date } from 'quasar';
import {
  required, maxLength, decimal, email,
} from 'vuelidate/lib/validators';
import histrixApi from '../services/histrixApi.js';

export default {
  name: 'HistrixForm',
  props: {
    title: String,
    inner: { type: Boolean, default: false },
    path: String,
    newRecord: { type: Boolean, default: false },
    url: String,
    query: Object,
    schema: Object,
    resources: Object,
    editedItem: null,
    editedIndex: null,
    computedFields: Object,
  },
  components: {
    HistrixField: () => import('./HistrixField.vue'),
  },
  computed: {
    insertButton() {
      return this.editedIndex == -1 || this.editedIndex == null
    },
    updateButton() {
      return this.canUpdate && !this.localSchema.readonly && !this.localSchema.can_process && !this.insertButton
    },
    localValidations() {
      const localValidations = {};
      Object.entries(this.editables).map((fieldArray) => {
        const field = fieldArray[1];
        localValidations[field.name] = {};

        if (field.required == 'required') {
          localValidations[field.name].required = required;
        }

        // add validations
        if (field.maxlength) {
          localValidations[field.name].maxLength = maxLength(field.maxlength);
        }

        switch (field.histrix_type) {
          case 'Numeric':
          case 'CustomNumeric':
            localValidations[field.name].decimal = decimal;
            break;
          case 'Email':
            localValidations[field.name].email = email;
            break;
          default:
            break;
        }
      });

      // add formValidations
      if (this.localSchema.formValidations) {
        this.localSchema.formValidations.map((validation) => {
          const operatios = /[+\-\*\/\(\)]/g;
          const keys = validation.condition.split(operatios);

          keys.map((key) => {
            const k = key.trim();
            if (k && this.localValues[k] !== undefined && validation.condition) {
              if (localValidations[k]) {
                localValidations[k].customValidation = value => !this.processOperation(validation.condition);
              } else {
                localValidations[k] = { customValidation: value => !this.processOperation(validation.condition) };
              }

              this.errorMessages[k] = { customError: validation.message };
            }
          }, this);
        }, this);
      }

      return { localValues: localValidations };
    },
    formTitle() {
      return this.title || this.schema.title;
    },
    fieldsWithContainers() {
      return this.filter(
        this.localSchema.fields,
        field => !field.innerContainer && !field.options,
      );
    },
    editables() {
      return this.filter(
        this.localSchema.fields,
        field => field.hidden || (this.schema.type != 'fichaing' && this.schema.type != 'cabecera' && field.innerContainer && !field.options && field.editable === false),
      );
    },
    innerTabs() {
      return this.filter(
        this.localSchema.fields,
        field => (this.schema.type == 'fichaing' || this.schema.type == 'cabecera' || (!field.innerContainer || field.options)),
      );
    },
    dateFields() {
      return this.filter(this.localSchema.fields, field => (field['data-role'] != 'datebox'));
    },
    postData() {
      return { ...this.localValues, ...this.parseLocaleToDate() };
    },
    canUpdate() {
      return this.resources.hasOwnProperty('PUT');
    },
    visibleColumns() {
      if (this.localSchema.columns) {
        return this.localSchema.columns
          .filter(column => !column.hidden)
          .map((column, index, array) => column.name);
      }
    },
    fieldQuerys() {
      const fieldQuerys = {};

      if (this.fieldsWithContainers) {
        Object.keys(this.fieldsWithContainers).map((target) => {
          const field = this.fieldsWithContainers[target];

         const rel = {};
          /**
          * Read initial container conditions
          */
          if (field.innerContainer.schema) {
            Object.entries(field.innerContainer.schema.conditions).map((conditions) => {
              Object.entries(conditions[1]).map((condition) => {
                rel[conditions[0]] = condition[1].valor;
              });
            }, this);
            fieldQuerys[field.name] = rel;
          }

          /**
           * Read Relationships
           */
          if (field.innerContainer.relationship) {
            Object.entries(field.innerContainer.relationship).map((relationship) => {
              const localtarget = relationship[0];
              const source = relationship[1];

              rel[localtarget] = this.localValues[source.valor];
            }, this);

            fieldQuerys[field.name] = rel;
          }
        }, this);
      }

      // updated field querys with (histrix actualiza)
      Object.entries(this.updatedFields).map((fieldArray) => {
        const field = fieldArray[1];

        const relations = field.update_fields;
        relations.map((relation) => {
          // for inner field querys
          const rel = {};
          if (relation.parentField) {
            const query = {};

            query[relation.targetField] = this.localValues[field.name];
            rel[relation.field] = query;

            fieldQuerys[relation.parentField] = rel;

            if (fieldQuerys[relation.field] == undefined) {
              rel[relation.field] = query;
              fieldQuerys[relation.parentField] = rel;
            } else {
              fieldQuerys[relation.field][relation.field] = query;
            }
          } else if (fieldQuerys[relation.field] == undefined) {
            rel[relation.targetField] = this.localValues[field.name];
            fieldQuerys[relation.field] = rel;
          } else {
            fieldQuerys[relation.field][relation.targetField] = this.localValues[field.name];
          }
        }, this);
      }, this);

      // add External Query data
      Object.keys(this.query).map((key) => {
        if (this.query[key]) {
          const query = this.query[key];
          if (typeof query === 'object' || typeof query === 'function') {
            fieldQuerys[key] = query;
          }
        }
      });

      return fieldQuerys;
    },
    updatedFields() {
      return this.filter(this.localSchema.fields, field => !field.update_fields);
    },
  },
  mounted() {
    console.log('aaa');
    this.localSchema = this.schema;
    this.localValues = this.editedItem;
    if (this.query && this.localSchema.preFetch != false  && !this.editedItem  ) {
      this.getData();
    }
  },
  watch: {
    editedItem:  {
      handler(data) {
          console.log('cambia algo')
          console.log(data)
          this.localValues = this.editedItem;
        },
      deep: true,
    },
    localValues: {
      handler(data) {
        for (const formula in this.computedFields) {
          const result = this.processOperation(this.computedFields[formula]);
          if (result != undefined) {
            this.localValues[formula] = result;
          }
        }
        // this.refreshSchema();
        this.$emit('input', this.localValues);
        this.$emit('validity', !this.$v.$invalid);
      },
      deep: true,
    },
  },

  methods: {
    errorMessage(field) {
      const cell = this.$v.localValues[field.name];

      if (cell.customValidation != undefined && !cell.customValidation) {
        return this.errorMessages[field.name].customError;
      }

      if (cell.required != undefined && !cell.required) {
        return 'Campo Obligatorio';
      }

      if (cell.decimal != undefined && !cell.decimal) {
        return 'Campo debe ser numérico';
      }

      if (cell.email != undefined && !cell.email) {
        return 'Email incorrecto';
      }

      if (cell.minLength != undefined && !cell.minLength) {
        return `Tamaño mínimo de ${cell.$params.minLength.min} caracteres`;
      }
      if (cell.maxLength != undefined && !cell.maxLength) {
        return `Tamaño máximo de ${cell.$params.maxLength.max} caracteres`;
      }
    },
    /**
     * recives values from inner tables and updates local field values
     */
    onComputedTotal(data) {
      this.localValues[data.target] = data.value;
    },
    /**
     * Calculates field Formula
     * replace formula with field values and evaluates
     */
    processOperation(formula) {
      if (formula) {
        const operatios = /[+\-\*\/\(\)]/g;
        const keys = formula.split(operatios);

        keys.map((key) => {
          const k = key.trim();
          if (k && this.localValues[k] !== undefined) {
            formula = formula.replace(k, this.localValues[k]);
          }
        }, this);

        try {
          const result = eval(formula);
          return result;
        } catch (error) {
          // console.log(formula)
        }
      }
    },
    reset() {
      this.localValues = this.editedItem;
      this.setDefaultValues();
    },
    /*
    Why soud i refresh the schema ?
    refreshSchema() {
      var fieldQuerys = {fieldQuerys: this.fieldQuerys};
      histrixApi.getAppSchema(this.url, {...this.query, ...fieldQuerys})
        .then((response) => {
          this.localSchema = response.data.schema;
        })
        .catch((e) => {
          this.dialog = true;
          this.message = 'Error de Carga' + e;
        });
    },
    */
    fillFields(targets) {
      console.log('fill');
      console.log(targets);
      for (const target in targets) {
        this.localValues[target] = targets[target];
      }
      console.log(this.localValues);
    },
    onSelectOption(data) {
      const selectedOptions = data.selected_option;
      if (selectedOptions) {
        const fieldsToChange = selectedOptions.data;
        for (const fieldName in fieldsToChange) {
          this.localValues[fieldName] = fieldsToChange[fieldName];
        }
      }
    },
    back() {
      this.$router.back();
    },

    fieldClass(field) {
      let span = 0;
      if (field.colspan != '') {
        span = field.colspan / 2;
      }

      // fields with inner container expands more
      if (field.innerContainer) {
        span = field.colspan;
      }

      let lg = Math.min(3 + span, 12);
      let md = Math.min(4 + span, 12);
      let sm = Math.min(6 + span, 12);
      let xs = 12;

      // small forms
      if (this.visibleColumns.length < 6 /* || (field.innerContainer && !field.options) */) {
        const all = 12;
        lg = all;
        md = all;
        sm = all;
        xs = all;
      }
      return `col-lg-${lg} col-md-${md} col-sm-${sm} col-xs-${xs}`;
    },

    filter(obj, predicate) {
      const result = {}; let
        key;
      for (key in obj) {
        if (obj.hasOwnProperty(key) && !predicate(obj[key])) {
          result[key] = obj[key];
        }
      }
      return result;
    },
    deleteItem(item) {},
    xmlUrl() {
      return `${this.path}?`;
    },
    getKeys(item) {
      const keyFields = Object.entries(this.localSchema.fields).filter(field => field[1].esClave == 'true');
      const keyData = {};
      keyFields.forEach((key) => {
        keyData[key[0]] = this.localValues[key[0]];
      });
      return keyData;
    },
    processData() {
      this.submitting = true;
      histrixApi.processAppForm(this.xmlUrl(), this.postData)
        .then((response) => {
          this.submitting = false;
          // this.$router.back();
          this.$emit('process-finish', true);
        })
        .catch((e) => {
          this.submitting = false;
          this.$emit('process-finish', true);
        });
    },
    insertRow() {
      this.newRecord = true
      this.saveForm();
      this.$emit('insert-row', this.localValues, this.editedIndex);
    },
    saveForm() {
      this.submitting = true;
      if (this.newRecord) {
        histrixApi.insertAppData(
          this.xmlUrl(),
          {
            keys: this.getKeys(this.editedItem),
            data: this.postData,
          },
        )
          .then((response) => {
            this.submitting = false;
            this.$emit('form-saved', this.localValues, this.editedIndex);
          })
          .catch((e) => {
            console.log(e);
            this.submitting = false;
          });
      } else {
        histrixApi.updateAppData(
          this.xmlUrl(),
          {
            keys: this.getKeys(this.editedItem),
            data: this.postData,
          },
        )
          .then((response) => {
            this.submitting = false;
            this.$emit('form-saved', this.localValues, this.editedIndex);
          })
          .catch((e) => {
            console.log(e);
            this.submitting = false;
          });
      }
    },
    parseDateToLocale() {
      const dates = {};
      for (const key in this.dateFields) {
        const fieldDate = Date(this.localValues[key]);
        dates[key] = date.formatDate(fieldDate, 'DD/MM/YYYY');
      }
      return dates;
    },
    parseLocaleToDate() {
      const dates = {};
      for (const key in this.dateFields) {
        const gmt = date.extractDate(this.localValues[key], 'DD/MM/YYYY');
        dates[key] = date.formatDate(gmt, 'YYYY-MM-DD');
      }
      return dates;
    },

    setDefaultValues() {
      for (const key in this.localSchema.fields) {
        const field = this.localSchema.fields[key];
        if (field.hasOwnProperty('default_option_value') && this.localValues[field.name] == '' && field.default_option_value != '') {
          this.localValues[field.name] = field.default_option_value;
        }
      }
    },
    getData() {
      histrixApi.getAppData(this.xmlUrl(), this.query)
        .then((response) => {
          this.localValues = response.data.data[0];
          this.localValues = { ...this.localValues, ...this.parseDateToLocale() };
          this.setDefaultValues();
        })
        .catch((e) => {
          this.dialog = true;
          this.message = 'Error de Carga de Datos';
        });
    },
  },
  validations() {
    return this.localValidations;
  },
  data() {
    return {
      localValues: {},
      errorMessages: {},
      localSchema: {
        fields: {},
        columns: [],
      },
      // fieldQuerys:{},
      data: [],
      submitting: false,
      currentTab: 'mainTab',
    };
  },
};
</script>
