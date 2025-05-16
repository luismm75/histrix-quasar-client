<template>
  <q-page class="fit">
    <div class="row">
      <div class="caption">{{ title }}</div>
      <div class="col-4">
        <HistrixFilters
          _v-if="schema.filters[0]"
          dense
          :schema="schema"
          v-on:filter-data="getData(xmlUrl($event))"
        />
      </div>
      <div class="col-5 right-align">
        <q-btn
          v-if="schema.export"
          flat
          round
          dense
          icon="import_export"
          title="Exportar"
          @click="$emit('export')"
        />
        <q-btn
          flat
          round
          dense
          icon="print"
          title="Imprimir"
          @click="$emit('print')"
        />
        <q-btn
          fab
          color="red"
          icon="add"
          title="Nuevo"
          v-if="canInsert"
          @click="addItem()"
          no-caps
        >
        </q-btn>
      </div>
    </div>
    <div class="row">
      <q-hierarchy
        :data="data"
        :columns="schema.columns"
        flat
        separator="cell"
        dense
        :loading="loading"
        :visible-columns="visibleColumns"
        row-key="_id"
        :expanded.sync="expanded"
      >
        <!--
        <template v-slot:body="props">
          <td data-th="Name">
            <div v-bind:style="props.setPadding(props.item)"
                 :class="props.iconName(props.item)!='done'?'q-pl-lg':''">
              <q-btn @click="props.toggle(props.item)" v-if="props.iconName(props.item)!='done'"
                     :icon="props.iconName(props.item)" flat
                     dense>
              </q-btn>
              <span class="q-ml-sm">{{props.item.label}}</span>
            </div>
          </td>
          <td class="text-center">{{props.item.description}}</td>
          <td class="text-left">
            <q-chip color="lime-9" v-if="props.item.note" square size="sm" class="text-white">
              {{props.item.note}}
            </q-chip>
          </td>
        </template>
-->
        <template v-slot:body="props">
          <q-td data-th="Name">
            <div
              v-bind:style="props.setPadding(props.item)"
              :class="props.iconName(props.item) != 'done' ? 'q-pl-lg' : ''"
            >
              <q-btn
                @click="props.toggle(props.item)"
                v-if="props.iconName(props.item) != 'done'"
                :icon="props.iconName(props.item)"
                flat
                dense
              >
              </q-btn>
            </div>
          </q-td>
          <q-td v-for="field in visibleColumns" :key="field">
            <HistrixCell
              :path="path"
              :props="props"
              :schema="schema.fields[field]"
              :col="{ value: props.item[field] }"
            />
          </q-td>

          <q-td key="actions">
            <q-btn
              icon="edit"
              v-if="canUpdate"
              color="blue"
              @click="editItem(props.item)"
              size="sm"
              no-caps
            />
            <q-btn
              icon="cancel"
              v-if="canDelete"
              color="red"
              @click="deleteItem(props.item)"
              size="sm"
              no-caps
            />
          </q-td>
          <!--
        </q-tr>
        <q-tr v-if="props.expand" :props="props">
          <q-td colspan="100%" class="bg-primary">
            <HistrixApp
              name="detail"
              inner="true"
              :path="detailData(props, 'detailpath')"
              :query="detailData(props, 'detailquery')"
            />
          </q-td>
        </q-tr> -->
        </template>
      </q-hierarchy>
    </div>
    <q-dialog v-model="dialog" position="top">
      <q-card style="auto">
        <q-card-section class="row items-center no-wrap">
          <div>
            <div class="text-weight-bold">{{ message }}</div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="edit">
      <HistrixForm
        :resources="resources"
        :schema="schema"
        :path="path"
        :query="query"
        v-bind="$attrs"
        :editedItem="editedItem"
      />
    </q-dialog>
  </q-page>
</template>

<script>
import histrixApi from '../services/histrixApi.js';
import HistrixFilters from './HistrixFilters.vue';
import HistrixCell from './HistrixCell.vue';
import HistrixForm from './HistrixForm.vue';

export default {
  name: 'HistrixTable',
  props: {
    inner: false,
    title: '',
    path: '',
    query: '',
    schema: {},
    resources: {}
  },
  components: {
    HistrixForm,
    HistrixCell,
    HistrixFilters
  },
  mounted() {
    this.getData(this.xmlUrl(this.query));
  },
  watch: {
    path(_l) {
      const url = this.xmlUrl(this.query);
      this.getData(url);
    },
    query() {
      this.getData(this.xmlUrl(this.query));
    }
  },
  computed: {
    requestQuery() {
      const fullQuery = this.query;
      fullQuery[this.schema.parentField] = this.schema.values[this.schema.parentField];
      return fullQuery;
    },
    filteredData() {
      return this.data.filter((row) => !row.value);
    },
    canInsert() {
      // biome-ignore lint/suspicious/noPrototypeBuiltins: <explanation>
      return this.resources.hasOwnProperty('POST');
    },
    canUpdate() {
      // biome-ignore lint/suspicious/noPrototypeBuiltins: <explanation>
      return this.resources.hasOwnProperty('PUT');
    },
    canDelete() {
      // biome-ignore lint/suspicious/noPrototypeBuiltins: <explanation>
      return this.resources.hasOwnProperty('DELETE');
    },
    visibleColumns() {
      return this.schema.columns.filter((column) => !column.hidden).map((column, _index, _array) => column.name);
    }
  },
  methods: {
    celValue(item, col) {
      return { value: item[col.name], text: item[col.name].value };
    },
    detailData(_props, _attr) {
      /*
      const row = props.row;
      const rowAttr = row["DT_RowAttr"];
      return rowAttr[attr];
      */
    },
    hasDetail(_props) {
      /*
      const row = props.row;
      const attr = row["DT_RowAttr"];
      return attr.hasOwnProperty("detailpath");
      */
    },
    xmlUrl(filterQuery) {
      return `${this.path}?${filterQuery}`;
    },
    deleteItem(item) {
      const _index = this.data.indexOf(item);
      if (confirm('Are you sure you want to delete this item?')) {
        this.delete(item);
      }
    },
    getKeys(item) {
      const keyFields = Object.entries(this.schema.fields).filter((field) => field[1].esClave === 'true');
      const keyData = {};
      for (const key of keyFields) {
        keyData[key[0]] = item[key[0]].value || item[key[0]]._;
      }
      return keyData;
    },
    delete(item) {
      histrixApi
        .deleteAppData(this.xmlUrl(), this.getKeys(item))
        .then((_response) => {
          const index = this.data.indexOf(item);
          this.data.splice(index, 1);
        })
        .catch((e) => {
          console.log(e);
        });
    },
    addItem() {
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
    },
    editItem(item) {
      this.editedIndex = this.data.indexOf(item);

      const item2 = {};
      let key;
      for (key in item) {
        if (Object.prototype.hasOwnProperty.call(item, key)) {
          item2[key] = item[key].value || item[key]._;
        }
      }

      this.editedItem = Object.assign({}, item2);
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
    getData(url) {
      console.log(this.requestQuery);
      histrixApi
        .getAppData(url, this.requestQuery)
        .then((response) => {
          const { data } = response.data;
          /*
          data.map(function(element) {
            element["_id"] = element["DT_RowAttr"]["o"];
          });
          */
          this.data = data;
          this.loading = false;
        })
        .catch((_e) => {
          this.dialog = true;
          this.message = 'Error de Carga de Datos';
          this.loading = false;
        });
    }
  },
  data() {
    return {
      edit: false,
      filter: '',
      expanded: [],
      loading: true,
      message: null,
      dialog: false,
      mode: 'list',
      editedItem: [],
      dataContainer: null,
      data: [],

      pagination: {
        sortBy: 'desc',
        descending: false,
        page: 1,
        rowsPerPage: 15
        // rowsNumber: xx if getting data from a server
      }
    };
  }
};
</script>
