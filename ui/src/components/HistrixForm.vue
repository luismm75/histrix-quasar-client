<template>
  <div class="q-pa-sm">
    <slot name="slot-top-form" :props="localValues" />
    <!--
     <q-toolbar class="text-primary " borderer _flat>
      <q-toolbar-title>
        {{ formTitle }}
      </q-toolbar-title>
      <q-space />
    </q-toolbar>
    -->
    <q-form @submit="onSubmit" enctype="multipart/form-data">
      <div class="row">
        <div class="col">
          <q-tabs
            v-model="currentTab"
            dense
            class="text-grey"
            active-color="primary"
            indicator-color="primary"
            align="justify"
            narrow-indicator
          >
            <q-tab
              v-if="Object.keys(innerTabs).length != 0"
              name="mainTab"
              :label="localSchema.title"
              class="bg-primary text-white"
            >
              <q-tooltip anchor="top middle" self="bottom middle">
                Solapa principal {{ localSchema.title }}
              </q-tooltip>
            </q-tab>
            <span v-else>
              {{ localSchema.title }}
            </span>
            <q-tab
              v-for="tab in innerTabs"
              :name="tab.name"
              v-bind:key="tab.name"
              :label="tab.title || tab.name"
            >
              <q-tooltip anchor="top middle" self="bottom middle">
                Click para mas información con respecto a {{ tab.title }}
              </q-tooltip>
            </q-tab>
          </q-tabs>

          <q-tab-panels v-model="currentTab" animated>
            <q-tab-panel name="mainTab" class="q-pl-none q-pr-none">
              <div class="row">
                <div
                  v-for="field in editables"
                  v-bind:key="field.name"
                  :name="field.name"
                  :class="fieldClass(field)"
                >
                  <q-item dense>
                    <!--
                    <q-item-section style="text-align:right">
                      <q-item-label caption>{{
                        field.label || field.title
                      }}</q-item-label>
                    </q-item-section>
                    -->
                    <q-item-section>
                      <q-item-label
                        v-if="
                          editedRow &&
                          editedRow[field.name] &&
                          editedRow[field.name]['link']
                        "
                      >
                        {{ field.title }}
                      </q-item-label>
                      <HistrixCell
                        v-if="
                          editedRow &&
                          editedRow[field.name] &&
                          editedRow[field.name]['link']
                        "
                        :path="path"
                        :props="editedRow[field.name]"
                        :schema="field"
                        :col="{ value: editedRow[field.name] }"
                        v-on:open-popup="bubbleLink(editedRow, $event)"
                        v-on:closepopup="closePopup"
                      />

                      <HistrixField
                        v-model="localValues[field.name]"
                        :name="field.name"
                        :row="localValues"
                        :schema="field"
                        :path="computedPath(field)"
                        :submitting="submitting"
                        :query="fieldQuerys[field.name]"
                        :readonly="localSchema.readonly"
                        :disabled="localSchema.readonly"
                        v-on:selectOption="onSelectOption"
                        v-on:fill-fields="fillFields"
                        v-on:computed-total="onComputedTotal"
                        dense
                        v-else-if="!localSchema.readonly"
                      >
                        <template v-slot:slot-top-field-histrixapp="props">
                          <slot
                            name="slot-top-field-histrixapp"
                            :props="props.props"
                          />
                        </template>
                      </HistrixField>
                      <div v-else>
                        <span v-html="localValues[field.name]" />
                      </div>
                    </q-item-section>
                  </q-item>
                </div>
              </div>
            </q-tab-panel>
            <q-tab-panel
              v-for="field in innerTabs"
              :name="field.name"
              v-bind:key="field.name"
            >
              <HistrixField
                v-model="localValues[field.name]"
                :name="field.name"
                :schema="field"
                :path="computedPath(field)"
                :row="localValues"
                :submitting="submitting"
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
      <q-separator />
      <div class="row">
        <span class="q-pa-sm col-12 text-center">
          <q-btn
            label="Cancelar"
            icon="close"
            class="nojustify-end flat"
            @click="closePopup"
            type="reset"
            v-if="insertButton || updateButton"
          />
          <q-btn
            v-if="insertButton || updateButton"
            :disable="v$.$invalid"
            type="submit"
            label="Grabar"
            icon="save"
            class="bg-positive text-white nojustify-end"
            :loading="submitting"
          />

          <!--
            <q-btn v-if="editedIndex == -1" label="Grabar" icon="save" @click="insertRow()"  />
            <q-btn v-if="updateButton" label="guardar"   icon="save" :disable="v$.$invalid" class=" bg-primary text-white nojustify-end" @click="saveForm()" :loading="submitting" />
            -->
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
    </q-form>
    <slot name="slot-botton-form" :props="localValues" />
  </div>
</template>

<script>
import { useVuelidate } from '@vuelidate/core';
import histrixApi from '../services/histrixApi.js';
import HistrixField from './HistrixField.vue';
import HistrixCell from './HistrixCell.vue';

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
    editedRow: null,
    editedIndex: null,
    computedFields: Object
  },
  components: {
    HistrixField,
    HistrixCell
  },
  setup() {
    return { v$: useVuelidate() };
  },
  computed: {
    insertButton() {
      return this.schema.insertButton && (this.editedIndex === -1 || this.editedIndex == null);
    },
    updateButton() {
      return (
        this.canUpdate &&
        !this.localSchema.readonly &&
        !this.localSchema.can_process &&
        !this.insertButton &&
        this.schema.updateButton
      );
    },
    //@TODO: Ver de implemtar esto
    // localValidations() {
    //   // add formValidationscol
    //   if (this.localSchema.formValidations) {
    //     this.localSchema.formValidations.map((validation) => {
    //       const operatios = /[+\-\*\/\(\)]/g;
    //       const keys = validation.condition.split(operatios);

    //       keys.map((key) => {
    //         const k = key.trim();
    //         if (k && this.localValues[k] !== undefined && validation.condition) {
    //           if (localValidations[k]) {
    //             localValidations[k].customValidation = (_value) => !this.processOperation(validation.condition);
    //           } else {
    //             localValidations[k] = {
    //               customValidation: (_value) => !this.processOperation(validation.condition)
    //             };
    //           }

    //           this.errorMessages[k] = { customError: validation.message };
    //         }
    //       }, this);
    //     }, this);
    //   }

    //   return { localValues: localValidations };
    // },
    formTitle() {
      return this.title || this.schema.title;
    },
    fieldsWithContainers() {
      return this.filter(this.localSchema.fields, (field) => !field.innerContainer && !field.options);
    },
    editables() {
      return this.filter(this.localSchema.fields, this.isFieldEditable);
    },
    innerTabs() {
      return this.filter(
        this.localSchema.fields,
        (field) =>
          this.schema.type === 'fichaing' || this.schema.type === 'cabecera' || !field.innerContainer || field.isSelect
      );
    },
    dateFields() {
      return this.filter(this.localSchema.fields, (field) => field['data-role'] !== 'datebox');
    },
    /**
     * @description: chequea si el formulario tiene campos de tipo date object
     * @returns {Array || null}
     */
    files() {
      const data = [];
      Object.keys(this.localValues).map((item) => {
        if (this.localSchema.fields[item] && this.localSchema.fields[item].inputType === 'file') {
          data.push({
            name: item,
            data: this.localValues[item],
            path: this.computedPath(this.schema.fields[item])
          });
        }
      });
      return data.length ? data : null;
    },
    postData() {
      // return this.localValues;
      const data = this.localValues;
      Object.keys(this.localValues).map((item) => {
        if (this.localValues[item] && typeof this.localValues[item] === 'object' && this.localValues[item].name) {
          data[item] = this.localValues[item].name;
        }
      });
      return data;
    },
    canUpdate() {
      // biome-ignore lint/suspicious/noPrototypeBuiltins: <explanation>
      return this.resources.hasOwnProperty('PUT') && this.schema.can_update;
    },
    visibleColumns() {
      if (this.localSchema.columns) {
        return this.localSchema.columns.filter((column) => !column.hidden).map((column, _index, _array) => column.name);
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
                const con = condition[1]?.operador ?? null;
                if (con && con === '=') {
                  rel[conditions[0]] = condition[1].valor;
                }
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

            if (fieldQuerys[relation.field] === undefined) {
              rel[relation.field] = query;
              fieldQuerys[relation.parentField] = rel;
            } else {
              fieldQuerys[relation.field][relation.field] = query;
            }
          } else if (fieldQuerys[relation.field] === undefined) {
            rel[relation.targetField] = this.localValues[field.name];
            fieldQuerys[relation.field] = rel;
          } else {
            const data = this.localValues[field.name];
            if (data) {
              fieldQuerys[relation.field][relation.targetField] = data.value || data;
            }
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
      return this.filter(this.localSchema.fields, (field) => !field.update_fields);
    }
  },
  mounted() {
    this.refresh();
  },
  watch: {
    editedItem: {
      handler(_data) {
        this.localValues = { ...this.editedItem, ...{} };
      },
      deep: true
    },
    localValues: {
      handler(_data, oldVal) {
        if (!this.valueEdit && JSON.stringify(oldVal).length !== 2) {
          this.valueEdit = true;
          this.$emit('valueEdit', true);
        }
        for (const formula in this.computedFields) {
          const result = this.processOperation(this.computedFields[formula]);
          if (result !== undefined) {
            this.localValues[formula] = result;
          }
        }
        // this.refreshSchema();
        this.$emit('input', this.localValues);
      },
      deep: true
    },
    v$: {
      handler() {
        this.$emit('validity', !this.v$.$invalid);
      },
      deep: true
    }
  },
  methods: {
    refresh() {
      this.localSchema = this.schema;
      this.localValues = { ...this.editedItem, ...{} };

      Object.keys(this.query).map((key) => {
        this.localValues[key] = this.query[key];
      });
      if (this.query && this.localSchema.preFetch !== false && !this.editedItem) {
        this.getData();
      }
    },
    bubbleLink(row, link) {
      link.row = row;
      this.$emit('open-popup', link);
    },
    closePopup() {
      this.$emit('closepopup');
    },

    computedPath(field) {
      const dirValue = this.localValues[field.path] || '';
      const path = `${this.schema.path}/${dirValue}/`;
      return path.replaceAll('//', '/').replaceAll('//', '/');
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
        let resultFormula = formula;

        keys.map((key) => {
          const k = key.trim();
          if (k && this.localValues[k] !== undefined) {
            resultFormula = resultFormula.replace(k, this.localValues[k]);
          }
        }, this);

        try {
          // biome-ignore lint/security/noGlobalEval: <explanation>
          const result = eval(resultFormula);
          return result;
        } catch (_error) {
          // console.log(formula)
        }
      }
    },
    reset() {
      this.localValues = { ...this.editedItem, ...{} };
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
      if (field.colspan !== '') {
        span = field.colspan / 2;
      }

      // fields with inner container expands more
      if (field.innerContainer) {
        span = field.colspan;
      }

      let lg = Math.min(4 + span, 12);
      let md = Math.min(6 + span, 12);
      let sm = 12;
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
      return Object.fromEntries(Object.entries(obj).filter(([_key, value]) => !predicate(value)));
    },
    isFieldEditable(field) {
      // TRUE = No mostrar No editable
      // FALSE = Mostrar editable
      // Si editable es explícitamente falso, no es editable
      if (!field.editable) return true;

      // Si hidden es verdadero, es editable
      // Si editable es explícitamente falso, no es editable
      if (!field.hidden) return false;
      // return (this.schema.type != 'fichaing' &&
      //         this.schema.type != 'cabecera' &&
      //         field.innerContainer &&
      //         !field.isSelect &&
      //         field.editable === false)

      // Evaluar condiciones específicas para ciertos tipos
      const isSpecialType = this.schema.type !== 'fichaing' && this.schema.type !== 'cabecera';
      const isInnerContainer = field.innerContainer;
      const isNotSelect = !field.isSelect;
      const isExplicitlyNotEditable = field.editable === false;

      // Si cumple todas estas condiciones, no es editable
      if (isSpecialType && isInnerContainer && isNotSelect && isExplicitlyNotEditable) {
        return false;
      }
      // Si no cayó en ninguno de los casos anteriores, el campo es editable
      return true;
    },
    deleteItem(_item) {
      //
    },
    xmlUrl() {
      return `${this.path}?`;
    },
    getKeys(_item) {
      const keyFields = Object.entries(this.localSchema.fields).filter((field) => field[1].esClave === 'true');
      const keyData = {};
      for (const key of keyFields) {
        keyData[key[0]] = this.localValues[key[0]];
      }
      return keyData;
    },
    processData() {
      this.submitting = true;

      // upload attached files
      if (this.files) {
        histrixApi.upload(this.files);
      }
      console.log('process');
      console.log(this.postData);
      histrixApi
        .processAppForm(this.xmlUrl(), this.postData)
        .then((_response) => {
          this.submitting = false;
          this.$q.notify({
            message: 'PROCESO FINALIZADO',
            type: 'success',
            textColor: 'white',
            color: 'success',
            icon: 'info',
            closeBtn: 'cerrar',
            position: 'top'
          });
          // this.$router.back();
          this.reset();
          this.refresh();
          this.$emit('process-finish', true);
          this.$emit('closepopup');
        })
        .catch((e) => {
          this.$q.notify({
            type: 'negative',
            message: e.response.data,
            position: 'top'
          });
          this.submitting = false;
          this.$events.fire('closepopup');
          this.$emit('process-finish', true);
        });
    },
    onSubmit() {
      if (this.editedIndex === -1 || this.editedIndex === null) {
        this.insertRow();
      } else {
        this.saveForm();
      }
    },
    insertRow() {
      this.newRecord = true;
      this.saveForm();
    },
    saveForm() {
      // set button state
      this.submitting = true;

      // upload attached files
      if (this.files) {
        histrixApi.upload(this.files);
      }

      const postData = {
        keys: this.getKeys(this.editedItem),
        data: this.postData
      };
      // if this is a new record Insert
      if (this.newRecord) {
        histrixApi
          .insertAppData(this.xmlUrl(), postData)
          .then((response) => {
            this.submitting = false;
            this.$emit('closepopup');
            this.$emit('form-saved', this.localValues, response.data.id);
            this.$emit('insert-row', this.localValues, response.data.id);
          })
          .catch((e) => {
            console.log(e);
            this.submitting = false;
            this.$events.fire('histrix-error-http', e);
          });
      } else {
        histrixApi
          .updateAppData(this.xmlUrl(), postData)
          .then((_response) => {
            this.submitting = false;
            this.$emit('closepopup');
            this.$emit('form-saved', this.localValues, this.editedIndex);
          })
          .catch((e) => {
            console.log(e);
            this.submitting = false;
          });
      }
    },
    setDefaultValues() {
      for (const key in this.localSchema.fields) {
        const field = this.localSchema.fields[key];
        if (
          // biome-ignore lint/suspicious/noPrototypeBuiltins: <explanation>
          field.hasOwnProperty('default_option_value') &&
          this.localValues[field.name] === '' &&
          field.default_option_value !== ''
        ) {
          this.localValues[field.name] = field.default_option_value;
        }
      }
    },
    getData() {
      histrixApi
        .getAppData(this.xmlUrl(), this.query)
        .then((response) => {
          this.localValues = response.data.data[0];
          // this.localValues = { ...this.localValues, ...this.parseDateToLocale() };
          this.setDefaultValues();
        })
        .catch((_e) => {
          this.dialog = true;
          this.message = 'Error de Carga de Datos';
        });
    }
  },
  validations() {
    return {};
  },
  data() {
    return {
      localValues: {},
      errorMessages: {},
      localSchema: {
        fields: {},
        columns: []
      },
      // fieldQuerys:{},
      data: [],
      submitting: false,
      currentTab: 'mainTab',
      valueEdit: false
    };
  }
};
</script>
