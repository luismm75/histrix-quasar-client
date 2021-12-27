<template>
  <div>
    <HistrixApp
      v-if="schema.header"
      :path="headerPath"
      :query="this.$route.query"
      :title="this.title"
      class="col"
    />

    <q-table
      :data="innerData"
      :columns="schema.columns"
      :pagination.sync="pagination"
      :_grid="mode == 'grid'"
      :grid="$q.screen.lt.sm"
      flat
      dense
      :filter="filter"
      :loading="loading"
      :visible-columns="visibleColumns"
      row-key="_id"
      class=" fit"
      :expanded.sync="expanded"
      :hide-bottom="data.length < pagination.rowsPerPage"
      :_hide-top="data.length < pagination.rowsPerPage"
      v-on:closepopup="closePopup"
      @update:pagination="updatePagination"
    >
      <!-- TOP LEFT: FILTERS -->
      <template v-slot:top-left="props">
        <div v-if="!inner" class="row">
          <HistrixFilters
            v-if="schema.filters.length"
            dense
            :schema="schema"
            v-on:filter-data="histrixFilter"
            :show="openFilter"
          />
          <q-item v-else _class="text-body1">
            {{ schema.title }}
          </q-item>
          <q-input
            v-if="search"
            v-model="searchStr"
            type="search"
            dense
            label="Buscar"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
      </template>

      <!-- TOP right: BUTTONS -->
      <template v-slot:top-right="props">
        <div
          v-if="data.length !== 0"
          style="display: flex; align-items: center; justify-content: center; text-align: center;"
        >
          <span style="text-align: center; font-size: 0.8rem;"
            >Cantidad por pagina:
          </span>
          <q-select
            :options="optionsPagination"
            hide-bottom-space
            dense
            item-aligned
            emit-value
            map-options
            v-model="pagination.rowsPerPage"
          />
          <q-btn
            v-if="props.pagesNumber > 2"
            icon="first_page"
            color="grey-8"
            round
            dense
            flat
            :disable="props.isFirstPage"
            @click="props.firstPage"
          />

          <q-btn
            icon="chevron_left"
            color="grey-8"
            round
            dense
            flat
            :disable="props.isFirstPage"
            @click="props.prevPage"
          />

          <q-btn
            icon="chevron_right"
            color="grey-8"
            round
            dense
            flat
            :disable="props.isLastPage"
            @click="props.nextPage"
          />

          <q-btn
            v-if="props.pagesNumber > 2"
            icon="last_page"
            color="grey-8"
            round
            dense
            flat
            :disable="props.isLastPage"
            @click="props.lastPage"
          />
        </div>
        <q-btn-group dense flat v-if="!inner">
          <q-btn
            v-if="schema.export"
            flat
            icon="get_app"
            _icon="fas fa-file-excel"
            title="Exportar"
            @click="$emit('export', fullQuery)"
          />
          <q-btn flat icon="print" title="Imprimir" @click="$emit('print')" />
          <!--  <q-btn flat round dense :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'" @click="props.toggleFullscreen" />  -->
          <!--
          <q-btn flat  :icon="mode === 'grid' ? 'list' : 'grid_on'" @click=" mode = mode === 'grid' ? 'list' : 'grid'; separator = mode === 'grid' ? 'none' : 'horizontal';" >
            <q-tooltip :disable="$q.platform.is.mobile" v-close-popup>{{
              mode === "grid" ? "List" : "Grid"
            }}</q-tooltip>
          </q-btn>
          -->
        </q-btn-group>

        <q-btn
          fab
          color="positive"
          icon="add"
          title="Nuevo"
          v-if="schema.can_insert && canInsert"
          @click="addItem()"
          no-caps
        >
        </q-btn>
      </template>

      <!-- TABLE HEADER -->

      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th auto-width class="bg-primary" v-if="schema.inline_detail"
            >1</q-th
          >
          <q-th
            auto-width
            v-if="(canUpdate && !isGrid) || (schema.can_delete && canDelete)"
            class="bg-primary text-white"
          ></q-th>

          <q-th
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
            :style="
              schema.fields[col.name]['column_style'] + ';text-align:center;'
            "
          >
            <!-- <HistrixField standout dense class="bg-grey text-white" v-model="field.valor" :schema="schema.fields[col.name]" clearable  /> -->
            {{ col.label }}
          </q-th>
        </q-tr>
      </template>

      <!--- TABLE BODY -->
      <template v-slot:body="props">
        <q-tr :props="props" @click="selectRow(props)" :class="rowClass(props)">
          <q-td style="width:10px;" v-if="schema.inline_detail">
            <q-btn
              v-if="hasDetail(props)"
              size="xs"
              color="accent"
              dense
              @click="props.expand = !props.expand"
              :icon="props.expand ? 'remove' : 'add'"
            />
          </q-td>
          <q-td
            key="actions"
            v-if="(canUpdate && !isGrid) || (schema.can_delete && canDelete)"
            class="action-cell"
          >
            <q-btn
              flat
              rounded
              icon="edit"
              v-if="canUpdate && !isGrid"
              color="positive"
              @click="editRow(props.row)"
              size="sm"
              no-caps
            />
            <q-btn
              flat
              unelevated
              rounded
              icon="delete"
              v-if="schema.can_delete && canDelete"
              color="secondary"
              @click="deleteItem(props.row)"
              size="sm"
              no-caps
            />
          </q-td>

          <q-td
            v-for="cell in props.cols.filter((row) => row.name)"
            :key="cell.name"
            :props="props"
            :style="colStyle(cell)"
            class="histrix-cell"
          >
            <HistrixField
              v-model="rawData[props.key][cell.name]"
              :row="rawData[props.key]"
              :query="fieldQuerys(cell.name, rawData[props.key])"
              :name="cell.name"
              :schema="schema.fields[cell.name]"
              :rowSchema="getRowSchema(props.key, cell.name)"
              dense
              hide-bottom-space
              :error-message="errorMessage(props.key, schema.fields[cell.name])"
              :error="
                $v['rawData']['$each'][props.key][cell.name].$invalid ||
                  customError(props.key, schema.fields[cell.name])
              "
              v-on:field-change="rowChange"
              v-if="
                getFieldAttribute(props.key, cell.name, 'editable') && isGrid
              "
            />
            <HistrixCell
              v-else
              :path="path"
              :props="props"
              :schema="schema.fields[cell.name]"
              :col="cell"
              v-on:open-popup="bubbleLink(rawData[props.key], $event)"
              v-on:closepopup="closePopup"
            />
          </q-td>
        </q-tr>
        <q-tr v-if="props.expand" :props="props">
          <q-td colspan="100%" class="bg-grey-12 qa-pa-xs">
            <HistrixApp
              name="detail"
              inner="true"
              :path="detailPath(props)"
              :query="detailQuery(props)"
            />
          </q-td>
        </q-tr>
      </template>

      <!-- grid mode -->
      <template v-slot:item="props">
        <div
          :class="rowClass(props) + 'q-pa-xs col-12 grid-style-transition'"
          :style="props.selected ? 'transform: scale(0.95);' : ''"
        >
          <q-card :class="props.selected ? 'bg-grey-2' : ''">
            <q-item
              v-for="cell in props.cols.filter((row) => row.name)"
              :key="cell.name"
              class=""
              dense
            >
              <q-item-section
                side
                class="col-4 text-grey-15"
                v-if="!getFieldAttribute(props.key, cell.name, 'editable')"
              >
                {{ cell.label }}
              </q-item-section>
              <q-item-section class="col">
                <HistrixField
                  v-model="rawData[props.key][cell.name]"
                  :row="rawData[props.key]"
                  :query="fieldQuerys(cell.name, rawData[props.key])"
                  :name="cell.name"
                  :schema="schema.fields[cell.name]"
                  :rowSchema="getRowSchema(props.key, cell.name)"
                  dense
                  :error-message="
                    errorMessage(props.key, schema.fields[cell.name])
                  "
                  :error="
                    $v['rawData']['$each'][props.key][cell.name].$invalid ||
                      customError(props.key, cell.name)
                  "
                  v-if="
                    getFieldAttribute(props.key, cell.name, 'editable') &&
                      isGrid
                  "
                />
                <HistrixCell
                  v-else
                  :path="path"
                  :props="props"
                  :schema="schema.fields[cell.name]"
                  :col="cell"
                  v-on:open-popup="bubbleLink(rawData[props.key], $event)"
                  v-on:closepopup="closePopup"
                />
              </q-item-section>
            </q-item>

            <q-separator />
            <q-card-section
              class="row q-pa-xs"
              v-if="(canUpdate && !isGrid) || (schema.can_delete && canDelete)"
            >
              <!-- <q-checkbox dense v-model="props.selected" :label="props.row.name" /> -->
              <q-item class="col-9"> </q-item>
              <q-item style="align-items: center;">
                <q-btn
                  flat
                  rounded
                  icon="edit"
                  v-if="canUpdate && !isGrid"
                  color="positive"
                  @click="editRow(props.row)"
                  size="sm"
                  no-caps
                  padding="4px 5px"
                />
                <q-btn
                  flat
                  unelevated
                  rounded
                  icon="delete"
                  v-if="schema.can_delete && canDelete"
                  color="secondary"
                  @click="deleteItem(props.row)"
                  size="sm"
                  no-caps
                  padding="4px 5px"
                  style="margin-left: 0.5rem;"
                />
                <q-btn
                  color="accent"
                  v-if="hasDetail(props)"
                  padding="4px 8px"
                  dense
                  @click="props.expand = !props.expand"
                  :icon="props.expand ? 'remove' : 'add'"
                  style="font-size: 0.6rem; height:1.5rem; margin-left: 0.5rem;"
                />
              </q-item>
            </q-card-section>
            <q-card-section v-if="props.expand" :props="props">
              <div class="bg-grey-12 qa-pa-xs">
                <HistrixApp
                  name="detail"
                  inner="true"
                  :path="detailPath(props)"
                  :query="detailQuery(props)"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </template>

      <template v-slot:bottom-row="props">
        <q-tr :props="props" v-if="data.length > 0">
          <q-th auto-width v-if="schema.inline_detail"> </q-th>
          <q-th
            auto-width
            v-if="(canUpdate && !isGrid) || (schema.can_delete && canDelete)"
            class="bg-primary text-white"
          ></q-th>

          <q-th
            v-for="col in props.cols.filter((col) => col.name !== 'desc')"
            :key="col.name"
            :class="col.classes + ' text-bold'"
            style="text-align:right;"
          >
            <span v-if="columnTotals[col.name]">
              {{
                columnTotals[col.name].toLocaleString('es-AR', {
                  style: 'decimal',
                  maximumFractionDigits: 2,
                  minimumFractionDigits: 2,
                })
              }}
            </span>
          </q-th>
        </q-tr>
      </template>

      <!--
      <template v-slot:bottom="props">
        <q-btn v-if="schema.insertButton" fab icon="add" color="red" title="agregar" @click="insertRow()"></q-btn>
          <q-page-sticky position="bottom-right" :offset="[18, 18]">
            <q-btn fab icon="add" color="red" title="agregar" @onclick="newItem()"></q-btn>}
          </q-page-sticky>
      </template>
      -->
    </q-table>

    <q-dialog v-model="dialog" position="top">
      <q-card style="auto">
        <q-card-section class="row items-center ">
          <div>
            <div class="text-weight-bold">{{ message }}</div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="edit" ref="formDialog" full-width @input="showDialog">
      <q-card>
        <HistrixForm
          ref="histrixForm"
          :resources="resources"
          :schema="schema"
          :path="path"
          :query="query"
          v-bind="$attrs"
          :editedItem="editedItem"
          :editedIndex="editedIndex"
          :editedRow="editedRow"
          :inner="inner"
          v-on:open-popup="bubbleLink(editedItem, $event)"
          v-on:form-saved="formSaved"
          v-on:insert-row="rowRecived"
          v-on:closepopup="closeEdit"
          v-on:valueEdit="setEdit"
          :computedFields="computedFields"
          :newRecord="newRecord"
        />
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import Vue from 'vue';
import { required, maxLength, decimal, email } from 'vuelidate/lib/validators';
import qs from 'qs';
import histrixApi from '../services/histrixApi.js';

export default {
  name: 'HistrixTable',
  props: {
    inner: { type: Boolean, default: false },
    path: String,
    query: Object,
    schema: { type: Object, required: true },
    resources: Object,
    title: String,
    search: String,
    computedFields: Object,
    computedTotals: Object,
    value: null,
  },
  components: {
    HistrixFilters: () => import('./HistrixFilters.vue'),
    HistrixField: () => import('./HistrixField.vue'),
    HistrixForm: () => import('./HistrixForm.vue'),
    HistrixCell: () => import('./HistrixCell.vue'),
    HistrixApp: () => import('./HistrixApp.vue'),
  },
  mounted() {
    this.editedItem = Object.assign({}, this.schema.values);
    /*
    if (this.value) {
      this.data = JSON.parse(JSON.stringify(this.value))
    } else {
      this.data = []
    }
    */
    if (this.schema.preFetch === true /* && this.data.length == 0 */) {
      this.getData();
    } else {
      // Open filter
      if (!this.data.length) {
        this.openFilter = true;
      }
    }
  },
  watch: {
    path: {
      handler(newVal, oldVal) {
        this.getData();
      },
    },
    query: {
      handler(newVal, oldVal) {
        if (JSON.stringify(newVal) != JSON.stringify(oldVal)) {
          this.getData();
        }
      },
    },
    fullQuery: {
      handler(newVal, oldVal) {
        this.getData();
      },
    },
    innerData: {
      handler() {
        this.$emit('input', this.rawData);
      },
      deep: true,
    },
  },
  computed: {
    localTableValidations() {
      const tableValidations = this.rawData.map((row, index) => {
        // const rowSchema = {...this.schema.fields, ...this.data[index].DT_RowAttr['attributes'] }

        let localValidations = {};
        Object.entries(this.schema.fields).map((fieldArray) => {
          const field = fieldArray[1];
          const fieldData = {
            ...field,
            ...this.data[index].DT_RowAttr['attributes'][field.name],
          };
          localValidations[field.name] = {};

          if (fieldData.required == 'required') {
            localValidations[field.name].required = required;
          }

          // add validations
          if (fieldData.maxlength) {
            localValidations[field.name].maxLength = maxLength(
              fieldData.maxlength
            );
          }

          switch (fieldData.histrix_type) {
            case 'Numeric':
            case 'CustomNumeric':
              localValidations[fieldData.name].decimal = decimal;
              break;
            case 'Email':
              localValidations[fieldData.name].email = email;
              break;
            default:
              break;
          }
        });
        return localValidations;
      });
      return { rawData: { $each: tableValidations } };
    },

    localValidations() {
      let localValidations = {};
      Object.entries(this.schema.fields).map((fieldArray) => {
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

      return { rawData: { $each: localValidations } };
    },
    headerPath() {
      if (this.schema.header) {
        const path = `${this.schema.header.dir}/${this.schema.header.xml}`;
        /*
        if (link.dir == null) {
          path = `/${this.dirname(this.path)}/${link.file}`;
        }
        */
        const finalLink = `${path}`;
        return finalLink.replace('//', '/');
      }
      return false;
    },
    innerData() {
      if (this.filteredRows) {
        return this.filteredRows.map((row) => {
          let newRow = row;
          // calculate fields in row
          if (this.computedFields != undefined) {
            for (const formula in this.computedFields) {
              const result = this.processOperation(
                this.computedFields[formula],
                newRow
              );
              if (result != undefined) {
                if (
                  row[formula] !== undefined &&
                  (typeof row[formula] === 'object' ||
                    typeof row[formula] === 'function')
                ) {
                  newRow[formula].value = result;
                } else {
                  newRow[formula] = result;
                }
              }
            }
          }

          return newRow;
        });
      }
    },
    rawData() {
      return this.innerData.map((row) => {
        let newRow = {};
        for (const item in row) {
          if (
            row[item] !== undefined &&
            (typeof row[item] === 'object' || typeof row[item] === 'function')
          ) {
            newRow[item] =
              row[item].value !== undefined ? row[item].value : row[item]._;
          } else {
            newRow[item] = row[item];
          }
        }
        return newRow;
      });
    },

    /** Calculates the bottom amount where field has sum = true */
    columnTotals() {
      let totals = {};
      this.schema.columns
        .filter((col) => col.sum !== null)
        .forEach((element) => {
          totals[element.name] = this.data.reduce((prev, cur) => {
            const value =
              cur[element.name].value ||
              cur[element.name]._ ||
              cur[element.name];
            return prev + (parseFloat(value) || 0);
          }, 0);
        });
      Object.keys(this.computedTotals).map((key) => {
        const sourceName = this.computedTotals[key];
        this.$emit('computed-total', {
          target: key,
          value: totals[sourceName],
        });
      });
      return totals;
    },
    filteredRows() {
      if (this.searchStr === '') {
        return this.data;
      }

      return this.data.filter(
        (row) =>
          Object.keys(row)
            .map((key, index) => {
              return row[key]._ || row[key].value || row[key];
            })
            .join()
            .toLowerCase()
            .indexOf(this.searchStr.toLowerCase()) > -1
      );
    },
    filteredData(cols) {
      return this.data.filter((row) => !row.value);
    },
    isGrid() {
      return this.schema.type == 'grid' || this.schema.type == 'liveGrid';
    },
    canInsert() {
      return this.resources.hasOwnProperty('POST');
    },
    canUpdate() {
      return this.resources.hasOwnProperty('PUT') && this.schema.can_update;
    },
    canDelete() {
      return this.resources.hasOwnProperty('DELETE');
    },
    visibleColumns() {
      return this.schema.columns
        .filter((column) => {
          return !column.hidden && !column.style.includes('display:none;');
        })
        .map((column, index, array) => {
          return column.name;
        });
    },
    fieldsWithContainers() {
      return this.filterObject(
        this.schema.fields,
        (field) => !field.innerContainer && !field.options
      );
    },
    updatedFields() {
      return this.filterObject(
        this.schema.fields,
        (field) => !field.update_fields
      );
    },
  },
  methods: {
    setEdit(value) {
      this.editValue = value;
      this.$events.fire('editValue', value);
    },
    getRowSchema(index, cell) {
      if (this.data[index].DT_RowAttr['attributes']) {
        return this.data[index].DT_RowAttr['attributes'][cell];
      } else [];
    },
    showDialog() {
      // eslint-disable-next-line no-alert
      let confim = true;
      if (this.editValue) {
        confim = window.confirm(
          'Usted esta por cerrar el formulario. Recuerde guardar la informacion o se perdera'
        );
      }
      if (!confim) {
        this.edit = true;
      } else {
        this.setEdit(false)
      }
    },
    closeEdit() {
      this.edit = false;
      this.setEdit(false);
    },
    updatePagination(pagination) {
      const descending = pagination.descending ? 'desc' : 'asc';
      this.localFilters._sortBy = `${pagination.sortBy}|${descending}`;
      this.getData();
    },
    fieldQuerys(fieldname, row) {
      const fieldQuerys = {};

      //if (this.fieldsWithContainers) {
      const field = this.schema.fields[fieldname];
      const rel = {};
      /**
       * Read initial container conditions
       */
      if (field.innerContainer) {
        if (field.innerContainer.schema) {
          Object.entries(field.innerContainer.schema.conditions).map(
            (conditions) => {
              Object.entries(conditions[1]).map((condition) => {
                rel[conditions[0]] = condition[1].valor;
              });
            },
            this
          );
          fieldQuerys[field.name] = rel;
        }

        /**
         * Read Relationships
         */
        if (field.innerContainer.relationship) {
          Object.entries(field.innerContainer.relationship).map(
            (relationship) => {
              const localtarget = relationship[0];
              const source = relationship[1];

              rel[localtarget] = row[source.valor];
            },
            this
          );

          fieldQuerys[field.name] = rel;
        }
      }
      /*
      // updated field querys with (histrix actualiza)
      Object.entries(this.updatedFields).map((fieldArray) => {
        const field = fieldArray[1];

        const relations = field.update_fields;
        relations.map((relation) => {
          // for inner field querys
          const rel = {};
          if (relation.parentField) {
            const query = {};

            query[relation.targetField] = row[field.name];
            rel[relation.field] = query;

            fieldQuerys[relation.parentField] = rel;

            if (fieldQuerys[relation.field] == undefined) {
              rel[relation.field] = query;
              fieldQuerys[relation.parentField] = rel;
            } else {
              fieldQuerys[relation.field][relation.field] = query;
            }
          } else if (fieldQuerys[relation.field] == undefined) {
            rel[relation.targetField] = row[field.name];
            fieldQuerys[relation.field] = rel;
          } else {
            fieldQuerys[relation.field][relation.targetField] = row[field.name];
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
      */

      return rel;
    },
    bubbleLink(row, link) {
      link.row = row;
      this.$emit('open-popup', link);
    },
    closePopup() {
      this.$emit('closepopup');
    },
    refresh() {
      this.getData();
    },
    rowChange(row) {
      console.log('CHANGE ROW');
      if (this.schema.type === 'liveGrid') {
        this.updateLiveRow(row);
      }
    },

    getFieldAttribute(rowIndex, name, attr) {
      if (
        this.data[rowIndex].DT_RowAttr &&
        this.data[rowIndex].DT_RowAttr['attributes'] &&
        this.data[rowIndex].DT_RowAttr['attributes'][name] &&
        this.data[rowIndex].DT_RowAttr['attributes'][name][attr] != undefined
      ) {
        return this.data[rowIndex].DT_RowAttr['attributes'][name][attr];
      }
      return this.schema.fields[name][attr];
    },
    colStyle(col) {
      const style = col.value && col.value.style ? col.value.style : '';
      return `${style};`;
    },
    customError(row, field) {
      const cell = {
        ...this.schema.fields[field.name],
        ...this.getRowSchema(row, field.name),
      };

      if (
        cell.required &&
        (cell.required === 'required' || cell.required === 'true') &&
        (this.rawData[row][field.name] == '' ||
          this.rawData[row][field.name] == undefined)
      ) {
        return true;
      }
      return false;
    },
    errorMessage(row, field) {
      const cell = {
        ...this.$v.rawData.$each[row][field.name],
        ...this.getRowSchema(row, field.name),
      };

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
    processOperation(str, row) {
      let formula = str;
      let operatios = /[+\-\*\/\(\)]/g;
      let keys = formula.split(operatios);
      let that = this;

      keys.map((key) => {
        const k = key.trim();
        let value = row[k];
        if (typeof row[k] === 'object' || typeof row[k] === 'function') {
          value = row[k].value !== undefined ? row[k].value : row[k]._;
        }

        if (k && value !== undefined) {
          formula = formula.replace(k, value);
        }
      }, this);

      try {
        const result = eval(formula);
        return result;
      } catch (error) {
        // console.log(formula)
      }
    },
    insertRow() {
      const item = JSON.parse(JSON.stringify(this.schema.values));

      // let item = this.defaultItem;
      item._id = this.data.length;
      item._ajax_ = false;
      // this.data.push(item);
      this.editedIndex = item._id;
      this.editedItem = item;
      this.edit = true;
    },
    getKeys(row) {
      const keyFields = Object.entries(this.schema.fields).filter(
        (field) => field[1].esClave == 'true'
      );
      const keyData = {};
      keyFields.forEach((key) => {
        keyData[key[0]] = row[key[0]];
      });
      return keyData;
    },
    updateLiveRow(row) {
      const postData = {
        keys: this.getKeys(row),
        data: this.getValuesFromRow(row),
      };
      const that = this;
      histrixApi
        .updateAppData(this.xmlUrl(), postData)
        .then((response) => {
          that.$q.notify({
            message: 'Dato Guardado',
            type: 'accept',
            textColor: 'white',
            color: 'info',
            icon: 'info',
            closeBtn: 'cerrar',
            position: 'bottom right',
          });
        })
        .catch((e) => {
          console.log(e);
        });
    },
    /**
     * Executed when row is inserted by Form
     */
    rowRecived(row, index) {
      Vue.set(this.data, row._id, row);
      this.edit = false;
      this.refresh();
    },
    formSaved(row, index) {
      // update row values

      if (this.data[index]) {
        this.getData(index);
      } else {
        this.getData();
      }
      this.edit = false;
    },
    processData() {
      this.submitting = true;
      histrixApi
        .processApp(this.xmlUrl(), this.rawData)
        .then((response) => {
          this.submitting = false;
          this.$emit('closepopup');
          this.refresh();
        })
        .catch((e) => {
          this.submitting = false;
        });
    },
    selectRow(props) {
      const { row } = props;
      if (this.hasDetail(props)) {
        const rowAttr = row.DT_RowAttr;
        this.$emit('open-detail', rowAttr);
      } else {
        this.$emit('select-row', {
          row: this.getValuesFromRow(row),
          schema: this.schema,
        });
      }
    },

    detailPath(props) {
      const { row } = props;
      const rowAttr = row.DT_RowAttr;
      return rowAttr.detailpath;
    },
    detailQuery(props) {
      const { row } = props;
      const rowAttr = row.DT_RowAttr;
      return qs.parse(rowAttr.detailquery);
    },

    hasDetail(props) {
      const { row } = props;
      if (row.DT_RowAttr) {
        const attr = row.DT_RowAttr;
        return attr.hasOwnProperty('detailpath');
      }
      return false;
    },
    rowClass(props) {
      const { row } = props;
      let rowclass = '';
      if (row.DT_RowAttr) {
        const attr = row.DT_RowAttr;
        rowclass = attr.DT_RowClass || '';
      }

      if (this.hasDetail(props)) {
        rowclass += ' cursor-pointer ';
      }

      return rowclass;
    },
    xmlUrl(filterQuery) {
      return `${this.path}?&_dt=table${filterQuery}`;
    },
    deleteItem(item) {
      if (confirm('¿Realmente desea borrar este elemento?')) {
        this.delete(item);
      }
    },
    getKeys(item) {
      const keyFields = Object.entries(this.schema.fields).filter(
        (field) => field[1].esClave == 'true'
      );
      let keyData = {};
      keyFields.forEach((key) => {
        keyData[key[0]] = item[key[0]]._ ? item[key[0]]._ : item[key[0]];
      });
      return keyData;
    },
    removeItem(item) {
      const index = this.data.indexOf(item);
      this.data.splice(index, 1);
    },
    delete(item) {
      if (item._ajax_ == false) {
        this.removeItem(item);
      } else {
        if (this.getKeys(item).length != 0) {
          histrixApi
            .deleteAppData(this.xmlUrl(), this.getKeys(item))
            .then((response) => {
              this.removeItem(item);
              this.refresh();
            })
            .catch((e) => {
              console.log(e);
            });
        }
      }
    },

    getValuesFromRow(row) {
      let item2 = {};
      let key;
      for (key in row) {
        if (
          row[key] !== undefined &&
          (typeof row[key] === 'object' || typeof row[key] === 'function')
        ) {
          item2[key] =
            row[key].value !== undefined ? row[key].value : row[key]._;
        } else {
          item2[key] = row[key];
        }
      }
      return item2;
    },
    addItem() {
      if (this.schema.type == 'grid' || this.schema.type == 'ing') {
        this.insertRow();
      } else {
        this.editedIndex = -1;
        this.newRecord = true;
        this.editedItem = JSON.parse(JSON.stringify(this.schema.values));
      }
      this.insertButton = true;
      this.edit = true;

      // if (this.$refs.histrixForm) {
      // this.$refs.histrixForm.reset()
      // }

      /*
      this.$router.push({
        name: 'form',
        params: {
          path: this.path,
          editedItem: {},
          newRecord: true,
          schema: this.schema,
          resources: this.resources
        }
      });
      */
    },
    editRow(row) {
      // this.editedIndex = this.data.indexOf(row);
      this.editedIndex = row;
      this.newRecord = false;
      this.editedRow = row;
      this.editedItem = Object.assign({}, this.getValuesFromRow(row));
      // this.editedItem = this.data[this.editedIndex]
      /*
      this.$router.push({
        name: "form",
        params: {
          path: this.path,
          editedItem: item2,
          schema: this.schema,
          resources: this.resources
        }
      });
      */

      this.edit = true;
    },
    close() {
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      }, 300);
    },
    histrixFilter($query) {
      this.fullQuery = $query;
    },
    filterObject(obj, predicate) {
      const result = {};
      let key;
      for (key in obj) {
        if (obj.hasOwnProperty(key) && !predicate(obj[key])) {
          result[key] = obj[key];
        }
      }
      return result;
    },
    getData(index) {
      const url = this.xmlUrl(this.fullQuery);
      const filters = { ...this.query, ...this.localFilters };

      histrixApi
        .getAppData(url, filters)
        .then((response) => {
          const { data } = response.data;
          data.map((element) => {
            if (element.DT_RowAttr) {
              element._id = element.DT_RowAttr['o'];
            }
          });
          // alert('llega')
          if (index) {
            this.data[index] = data[index];
          } else {
            this.data = data;
          }

          this.loading = false;
          this.openFilter = false;
        })
        .catch((e) => {
          this.dialog = true;
          this.message = 'Error de Carga de Datos';
          this.loading = false;
        });
    },
  },
  validations() {
    return this.localValidations;
  },
  data() {
    return {
      localFilters: {
        _sortBy: '',
      },
      edit: false,
      editValue: false,
      filter: '',
      fullQuery: this.query,
      expanded: [],
      loading: true,
      message: null,
      dialog: false,
      mode: 'list',
      editedItem: {},
      editedRow: {},
      editedIndex: undefined,
      newRecord: false,
      defaultItem: {},
      dataContainer: null,
      optionsPagination: [
        { label: '5', value: 5 },
        { label: '10', value: 10 },
        { label: '15', value: 15 },
        { label: '20', value: 20 },
        { label: '25', value: 25 },
        { label: '50', value: 50 },
        { label: 'Todos', value: 0 },
      ],
      data: [],
      openFilter: false,
      searchStr: '',
      pagination: {
        sortBy: 'desc',
        descending: false,
        page: 1,
        rowsPerPage: 50,
        // rowsNumber: xx if getting data from a server
      },
    };
  },
};
</script>
<style>
.histrix-cell {
  max-width: 200px;
}

.q-table td,
.q-table th {
  /* don't shorten cell contents */
  white-space: normal;
}

.action-cell {
  white-space: nowrap !important ;
}
</style>
