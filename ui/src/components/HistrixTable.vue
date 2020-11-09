<template>
  <div>
    <HistrixApp v-if="schema.header" :path="headerPath" :query="this.$route.query" :title="this.title" class="col"/>


    <q-table
      :data="innerData"
      :columns="schema.columns"
      :pagination.sync="pagination"
      :grid="mode == 'grid'"
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

    >
    <!-- TOP LEFT: FILTERS -->
    <template v-slot:top-left="props">
      <div v-if="!inner" class="row">
          <HistrixFilters v-if="schema.filters.length" dense :schema="schema" v-on:filter-data="histrixFilter" :show="openFilter"/>
          <q-item v-else _class="text-body1">

            {{ schema.title }}

          </q-item>
          <q-input v-if="search" v-model="searchStr" type="search"  dense label="Buscar" >
            <template v-slot:append >
              <q-icon name="search" />
            </template>
          </q-input>
      </div>
    </template>

    <!-- TOP right: BUTTONS -->
      <template v-slot:top-right="props">
          <q-btn-group dense flat  v-if="!inner">

          <q-btn v-if="schema.export" flat  icon="get_app" _icon="fas fa-file-excel" title="Exportar" @click="$emit('export')" />
          <q-btn flat   icon="print" title="Imprimir" @click="$emit('print')" />
          <!--  <q-btn flat round dense :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'" @click="props.toggleFullscreen" />  -->
          <q-btn flat  :icon="mode === 'grid' ? 'list' : 'grid_on'" @click=" mode = mode === 'grid' ? 'list' : 'grid'; separator = mode === 'grid' ? 'none' : 'horizontal';" >
            <q-tooltip :disable="$q.platform.is.mobile" v-close-popup>{{
              mode === "grid" ? "List" : "Grid"
            }}</q-tooltip>
          </q-btn>
              </q-btn-group>


        <q-btn fab color="positive" icon="add" title="Nuevo" v-if="schema.can_insert && canInsert" @click="addItem()" no-caps >
        </q-btn>
      </template>

      <!-- TABLE HEADER -->
      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th auto-width class="bg-primary" v-if="schema.inline_detail"/>
          <q-th auto-width v-if="canUpdate || canDelete" class="bg-primary" />

          <q-th
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
            :style="schema.fields[col.name]['column_style'] + 'text-align:center;'"
          >
            {{ col.label }}
          </q-th>
        </q-tr>
      </template>

      <!--- TABLE BODY -->
      <template v-slot:body="props" >
        <q-tr :props="props" @click="selectRow(props)"  :class="rowClass(props)" >
          <q-td  style="width:10px;" v-if="schema.inline_detail">
            <q-btn
              v-if="hasDetail(props)"
              size="xs"
              color="accent"

              dense
              @click="props.expand = !props.expand"
              :icon="props.expand ? 'remove' : 'add'"
            />
          </q-td>
          <q-td key="actions">
            <q-btn flat rounded icon="edit"   v-if="canUpdate && !isGrid" color="positive" @click="editRow(props.row)"   size="sm" no-caps />
            <q-btn flat unelevated rounded icon="delete" v-if="schema.can_delete && canDelete " color="secondary"  @click="deleteItem(props.row)" size="sm" no-caps />
          </q-td>

          <q-td
            v-for="cell in props.cols.filter(row => row.name)"
            :key="cell.name"
            :props="props"
            :style="colStyle(cell)" >

              <HistrixField
                v-model="data[props.key][cell.name]"
                :row="rawData[props.key]"                
                :query="fieldQuerys(cell.name, rawData[props.key])"
                :name="cell.name"
                :schema="schema.fields[cell.name]"
                :rowSchema="data[props.key].DT_RowAttr['attributes'][cell.name]"
                dense
                :error-message="errorMessage(props.key, schema.fields[cell.name])"
                :error="$v['rawData']['$each'][props.key][cell.name].$invalid"

                v-if="getFieldAttribute(props.key, cell.name, 'editable') && isGrid"
              />
            <HistrixCell
              v-else
              :path="path"
              :props="props"
              :schema="schema.fields[cell.name]"
              :col="cell"
              v-on:open-link="bubbleLink"
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

      <template v-slot:item="props">
        <div
          class="q-pa-xs col-12 grid-style-transition"
          :style="props.selected ? 'transform: scale(0.95);' : ''"
        >
          <q-card :class="props.selected ? 'bg-grey-2' : ''">

            <q-list dense>
              <q-item
                v-for="cell in props.cols.filter(cell => cell.name !== 'desc')"
                :key="cell.name"
              >
                <q-item-section class="col-3 text-secondary">
                  <q-item-label>{{ cell.label }}</q-item-label>
                </q-item-section>
                <q-item-section _side class="col-11">

              <HistrixField
                v-model="data[props.key][cell.name]"
                :row="rawData[props.key]"
                :name="cell.name"
                :schema="schema.fields[cell.name]"
                :rowSchema="data[props.key].DT_RowAttr['attributes'][cell.name]"
                dense
                :error-message="errorMessage(props.key, schema.fields[cell.name])"
                :error="$v['rawData']['$each'][props.key][cell.name].$invalid"

                v-if="getFieldAttribute(props.key, cell.name, 'editable') && isGrid"
              />
            <HistrixCell
              v-else
              :path="path"
              :props="props"
              :schema="schema.fields[cell.name]"
              :col="cell"
              v-on:open-link="bubbleLink"
            />

                </q-item-section>
              </q-item>
            </q-list>
            <q-separator />
            <q-card-section class="row q-pa-xs">

              <!-- <q-checkbox dense v-model="props.selected" :label="props.row.name" /> -->
            <q-item class="col-9">
            </q-item>
            <q-item>
              <q-btn flat rounded icon="edit"   v-if="canUpdate && !isGrid" color="positive" @click="editRow(props.row)"   size="sm" no-caps />
              <q-btn flat unelevated rounded icon="delete" v-if="schema.can_delete && canDelete " color="secondary"  @click="deleteItem(props.row)" size="sm" no-caps />
            </q-item>
            </q-card-section>
          </q-card>
        </div>
      </template>

      <template v-slot:bottom-row="props">
        <q-tr :props="props" v-if="data.length > 0">
          <q-th />
          <q-th
                v-for="col in props.cols.filter(col => col.name !== 'desc')"
                :key="col.name"
                :class="col.classes + ' text-bold'"
                style="text-align:right;"
          >
          <span v-if="columnTotals[col.name]">
            {{  columnTotals[col.name].toLocaleString('es-AR', { style: 'decimal', maximumFractionDigits : 2, minimumFractionDigits : 2 }) }}
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
        <q-card-section class="row items-center no-wrap">
          <div>
            <div class="text-weight-bold">{{ message }}</div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="edit" ref="formDialog" full-width> -->
      <q-card class="row">
        <q-card-section class="col items-center no-wrap">
          <HistrixForm ref="histrixForm"
          :resources="resources" :schema="schema" :path="path" :query="query" v-bind="$attrs"
          :editedItem="editedItem" :editedIndex="editedIndex"
          :inner="inner"
          v-on:form-saved="formSaved"
          v-on:insert-row="rowRecived"
          :computedFields="computedFields"
          :newRecord="newRecord" />

        </q-card-section>
      </q-card>
    </q-dialog>

  </div>
</template>

<script>
import Vue from 'vue';
import { required, maxLength, decimal, email 
} from 'vuelidate/lib/validators';
import qs from 'qs';
import histrixApi from '../services/histrixApi.js'

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
      this.getData(this.xmlUrl(this.query));
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
        this.getData(this.xmlUrl(this.query));
      },
    },
    query: {
      handler(newVal, oldVal) {
        if (JSON.stringify(newVal) != JSON.stringify(oldVal)) {
          this.getData(this.xmlUrl(this.query));
        }
      },
    },
    fullQuery: {
      handler(newVal, oldVal) {
        this.getData(this.xmlUrl(this.fullQuery));
      },
    },
    innerData: {
      handler() {
        this.$emit('input', this.rawData);      
      },
      deep: true
    },
  },
  computed: {
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
      /*
      // add formValidations
      if (this.localSchema.formValidations) {
        this.localSchema.formValidations.map((validation) => {
          const operatios = /[+\-\*\/\(\)]/g;
          const keys = validation.condition.split(operatios);

          keys.map((key) => {
            let k = key.trim()
            if (k  && this.localValues[k] !== undefined && validation.condition) {
              localValidations[k]['customValidation'] = (value) =>  !this.processOperation(validation.condition)
              this.errorMessages[k] ={ customError: validation.message }
            }
          }, this);
        }, this)
      }
      */
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
              const result = this.processOperation(this.computedFields[formula], newRow);
              if (result != undefined) {
                if (row[formula] !== undefined && (typeof row[formula] === 'object' || typeof row[formula] === 'function')) {
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
          if (row[item] !== undefined && (typeof row[item] === 'object' || typeof row[item] === 'function')) {
            newRow[item] = (row[item].value !== undefined) ? row[item].value : row[item]._;
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
      this.schema.columns.filter(col => col.sum !== null).forEach((element) => {
        totals[element.name] = this.data.reduce((prev, cur) => {
          const value = cur[element.name].value || cur[element.name]._ || cur[element.name];
          return prev + (parseFloat(value) || 0);
        }, 0);
      });
      Object.keys(this.computedTotals).map((key) => {
        const sourceName = this.computedTotals[key];
        this.$emit('computed-total', { target: key, value: totals[sourceName] });
      });
      return totals;
    },
    filteredRows() {
      if (this.searchStr === '') {
        return this.data;
      }

      return this.data.filter((row) => Object.keys(row).map((key, index) => {
          return row[key]._ || row[key].value || row[key]
        }).join().toLowerCase().indexOf(this.searchStr.toLowerCase()) > -1);
    },
    filteredData(cols) {
      return this.data.filter((row) => !row.value);
    },
    isGrid() {
      return this.schema.type == 'grid';
    },
    canInsert() {
      return this.resources.hasOwnProperty('POST');
    },
    canUpdate() {
      return this.resources.hasOwnProperty('PUT');
    },
    canDelete() {
      return this.resources.hasOwnProperty('DELETE');
    },
    visibleColumns() {
      return this.schema.columns
        .filter((column) => {
          return !column.hidden;
        })
        .map((column, index, array) => {
          return column.name;
        });
    },
    fieldsWithContainers() {
      return this.filterObject(
        this.schema.fields,
        field => !field.innerContainer && !field.options,
      );
    },
    updatedFields() {
      return this.filterObject(this.schema.fields, field => !field.update_fields);
    },

  },
  methods: {
    fieldQuerys(fieldname, row) {
      const fieldQuerys = {};
    
      //if (this.fieldsWithContainers) {
      const field = this.schema.fields[fieldname]
        const rel = {};
        /**
        * Read initial container conditions
        */
       if (field.innerContainer) {

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

            rel[localtarget] = row[source.valor];
          }, this);

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
    bubbleLink(link) {
      this.$emit('open-link', link);
    },
    refresh() {
      this.getData(this.xmlUrl(this.fullQuery));
    },
    
    getFieldAttribute(rowIndex, name, attr) {
      if (this.data[rowIndex].DT_RowAttr['attributes']
      && this.data[rowIndex].DT_RowAttr['attributes'][name]
      && this.data[rowIndex].DT_RowAttr['attributes'][name][attr] != undefined) {
        return this.data[rowIndex].DT_RowAttr['attributes'][name][attr];
      }
      return this.schema.fields[name][attr];
    },
    colStyle(col) {
      const style = (col.value && col.value.style) ? col.value.style : '';
      return `${style  };max-width:30em;`
    },
    errorMessage(row, field) {
      const cell = this.$v.rawData.$each[row][field.name];
      if (cell.customValidation != undefined && !cell.customValidation) {
        return this.errorMessages[field.name].customError
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
        return `Tamaño mínimo de ${cell.$params.minLength.min } caracteres`;
      }

      if (cell.maxLength != undefined && !cell.maxLength) {
        return `Tamaño máximo de ${cell.$params.maxLength.max } caracteres`;
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
          value = (row[k].value !== undefined) ? row[k].value : row[k]._;
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
    /**
     * Executed when row is inserted by Form
     */
    rowRecived(row, index) {
      console.log('rowRecived')
      console.log(row)
      console.log(index)
      
      Vue.set(this.data, row._id, row);
      this.$refs.formDialog.hide();
      this.refresh();
    },
    formSaved(row, index) {
      // update row values
      if (this.data[index]) {
        for (const field in row) {
          if (row[field] !== undefined && (typeof row[field] === 'object' || typeof row[field] === 'function')) {
            this.data[index][field].value = row[field].value || row[field]._
          } else {
            this.data[index][field] = row[field];
          }
        }
      } else {
        this.getData(this.xmlUrl(this.query));
      }
      this.$refs.formDialog.hide();
    },
    processData() {
      this.submitting = true;
      histrixApi.processApp(this.xmlUrl, this.rawData)
        .then((response) => {
          this.submitting = false;
        })
        .catch((e) => {
          this.submitting = false;
          console.log(e);
        });
    },
    selectRow(props) {
      const {row} = props;
      if (this.hasDetail(props)) {
        const rowAttr = row.DT_RowAttr;
        this.$emit('open-detail', rowAttr);
      } else {
        console.log(row);
        console.log(this.getValuesFromRow(row));
        this.$emit('select-row', { row: this.getValuesFromRow(row), schema: this.schema });
      }
    },

    detailPath(props) {
      const {row} = props;
      const rowAttr = row.DT_RowAttr;
      return rowAttr.detailpath;
    },
    detailQuery(props) {
      const {row} = props;
      const rowAttr = row.DT_RowAttr;
      return qs.parse(rowAttr.detailquery);
    },

    hasDetail(props) {
      const {row} = props;
      if (row.DT_RowAttr) {
        const attr = row.DT_RowAttr;
        return attr.hasOwnProperty('detailpath');
      }
      return false;
    },
    rowClass(props) {
      const {row} = props;
      let rowclass = '';
      if (row.DT_RowAttr) {
        const attr = row.DT_RowAttr;
        rowclass = (attr.DT_RowClass || '');
      }

      if (this.hasDetail(props)) {
        rowclass += ' cursor-pointer '
      }

      return rowclass;
    },
    xmlUrl(filterQuery) {
      return `${this.path}?&_dt=table${filterQuery}`;
},
    deleteItem(item) {
      const index = this.data.indexOf(item);
      if (confirm('¿Realmente desea borrar este elemento?')) {
        this.delete(item);
      }
    },
    getKeys(item) {
      const keyFields = Object.entries(this.schema.fields).filter((field) => field[1].esClave == 'true');
      let keyData = {};
      keyFields.forEach((key) => {
        keyData[key[0]] = item[key[0]].value || item[key[0]]._;
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
        histrixApi.deleteAppData(this.xmlUrl(), this.getKeys(item))
          .then((response) => {
            this.removeItem(item);
          })
          .catch((e) => {
            console.log(e);
          });
      }
    },

    getValuesFromRow(row) {
      let item2 = {}; 
      let key;
      for (key in row) {
        if (row[key] !== undefined && (typeof row[key] === 'object' || typeof row[key] === 'function')) {
          item2[key] = (row[key].value !== undefined) ? row[key].value : row[key]._;
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
      this.editedIndex = this.data.indexOf(row);
      this.newRecord = false;

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
      const result = {}; let
        key;
      for (key in obj) {
        if (obj.hasOwnProperty(key) && !predicate(obj[key])) {
          result[key] = obj[key];
        }
      }
      return result;
    },   
    getData(url) {
      histrixApi.getAppData(url, this.query)
        .then((response) => {
          const {data} = response.data;
          data.map((element) => {
            if (element.DT_RowAttr) {
              element._id = element.DT_RowAttr['o'];
            }
          });
          // alert('llega')
          this.data = data;
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
      edit: false,
      filter: '',
      fullQuery: {},
      expanded: [],
      loading: true,
      message: null,
      dialog: false,
      mode: 'list',
      editedItem: {},
      editedIndex: undefined,
      newRecord: false,
      defaultItem: {},
      dataContainer: null,
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
